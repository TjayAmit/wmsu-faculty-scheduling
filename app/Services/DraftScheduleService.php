<?php

namespace App\Services;

use App\DTOs\DraftScheduleData;
use App\Enums\DraftScheduleStatus;
use App\Models\DraftSchedule;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Repositories\DraftScheduleRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DraftScheduleService
{
    public function __construct(
        protected DraftScheduleRepository $repository,
        protected TeacherScheduleGenerationService $generationService
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?DraftSchedule
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): DraftSchedule
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = DraftScheduleData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());

            if ($model->isApproved()) {
                $this->generationService->generateFromDraft($model->fresh(['schedule.semester', 'schedule.subject', 'teacherAssignment.teacher']));
            }
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): DraftSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = DraftScheduleData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());

            if ($updatedModel->isApproved()) {
                $this->generationService->regenerateFromDraft($updatedModel->fresh(['schedule.semester', 'schedule.subject', 'teacherAssignment.teacher']));
            } else {
                TeacherSchedule::where('draft_schedule_id', $updatedModel->id)->delete();
                if ($updatedModel->teacher_assignment_id) {
                    TeacherAssignment::where('id', $updatedModel->teacher_assignment_id)->delete();
                    $updatedModel->update(['teacher_assignment_id' => null]);
                }
            }
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray(),
        ]);

        return $updatedModel;
    }

    public function delete(int $id): bool
    {
        $model = $this->repository->findById($id);
        $data = $model->toArray();
        $result = false;

        DB::transaction(function () use ($id, $model, &$result) {
            TeacherSchedule::where('draft_schedule_id', $model->id)->delete();
            if ($model->teacher_assignment_id) {
                TeacherSchedule::where('teacher_assignment_id', $model->teacher_assignment_id)->delete();
                TeacherAssignment::where('id', $model->teacher_assignment_id)->delete();
            }
            $result = $this->repository->delete($id);
        });

        $this->logActivity('deleted', $model, $data);

        return $result;
    }

    public function submitForReview(int $id): DraftSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($model, &$updatedModel) {
            if (! $model->canBeSubmitted()) {
                throw new \InvalidArgumentException('Draft schedule can only be submitted from draft status.');
            }

            $updatedModel = $this->repository->update($model->id, [
                'status' => DraftScheduleStatus::PENDING_REVIEW->value,
                'submitted_at' => now(),
            ]);
        });

        $this->logActivity('submitted_for_review', $updatedModel, [
            'old' => $oldData,
            'new' => $updatedModel->toArray(),
        ]);

        return $updatedModel;
    }

    public function approve(int $id, ?string $comments = null): DraftSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($model, $comments, &$updatedModel) {
            if (! $model->canBeReviewed()) {
                throw new \InvalidArgumentException('Draft schedule can only be reviewed from pending review status.');
            }

            $updatedModel = $this->repository->update($model->id, [
                'status' => DraftScheduleStatus::APPROVED->value,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'review_comments' => $comments,
            ]);

            $this->generationService->regenerateFromDraft($updatedModel->fresh(['schedule.semester', 'schedule.subject', 'teacherAssignment.teacher']));
        });

        $this->logActivity('approved', $updatedModel, [
            'old' => $oldData,
            'new' => $updatedModel->toArray(),
        ]);

        return $updatedModel;
    }

    public function reject(int $id, ?string $comments = null): DraftSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($model, $comments, &$updatedModel) {
            if (! $model->canBeReviewed()) {
                throw new \InvalidArgumentException('Draft schedule can only be reviewed from pending review status.');
            }

            TeacherSchedule::where('draft_schedule_id', $model->id)->delete();
            if ($model->teacher_assignment_id) {
                TeacherSchedule::where('teacher_assignment_id', $model->teacher_assignment_id)->delete();
                TeacherAssignment::where('id', $model->teacher_assignment_id)->delete();
            }

            $updatedModel = $this->repository->update($model->id, [
                'status' => DraftScheduleStatus::REJECTED->value,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'review_comments' => $comments,
                'teacher_assignment_id' => null,
            ]);
        });

        $this->logActivity('rejected', $updatedModel, [
            'old' => $oldData,
            'new' => $updatedModel->toArray(),
        ]);

        return $updatedModel;
    }

    public function linkToTeacherAssignment(int $id, int $teacherAssignmentId): DraftSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($model, $teacherAssignmentId, &$updatedModel) {
            $updatedModel = $this->repository->update($model->id, [
                'teacher_assignment_id' => $teacherAssignmentId,
            ]);
        });

        $this->logActivity('linked_to_assignment', $updatedModel, [
            'old' => $oldData,
            'new' => $updatedModel->toArray(),
        ]);

        return $updatedModel;
    }

    public function findByTeacher(int $teacherId): iterable
    {
        return $this->repository->findByTeacher($teacherId);
    }

    public function findByStatus(DraftScheduleStatus $status): iterable
    {
        return $this->repository->findByStatus($status);
    }

    public function findByTeacherAndStatus(int $teacherId, DraftScheduleStatus $status): iterable
    {
        return $this->repository->findByTeacherAndStatus($teacherId, $status);
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = [];

        if ($action === 'updated' || $action === 'submitted_for_review' || $action === 'approved' || $action === 'rejected' || $action === 'linked_to_assignment') {
            $properties = $data;
        }

        if ($action === 'deleted') {
            $properties['deleted_data'] = $data;
            $properties['deleted_by'] = auth()->id();
        }

        if ($action === 'created') {
            $properties['new_data'] = $data;
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} ".class_basename($model));
    }
}
