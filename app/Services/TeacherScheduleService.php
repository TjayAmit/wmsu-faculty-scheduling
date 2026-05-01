<?php

namespace App\Services;

use App\DTOs\TeacherScheduleData;
use App\Models\TeacherSchedule;
use App\Repositories\TeacherScheduleRepository;
use App\Enums\TeacherScheduleStatus;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeacherScheduleService
{
    public function __construct(
        protected TeacherScheduleRepository $repository
    ) {}

    public function create(Request $request): TeacherSchedule
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = TeacherScheduleData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        // Log activity AFTER transaction commits to ensure data integrity
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, TeacherSchedule $teacherSchedule): TeacherSchedule
    {
        $oldData = $teacherSchedule->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $teacherSchedule, &$dto, &$updatedModel) {
            $dto = TeacherScheduleData::fromRequest($request);
            $updatedModel = $this->repository->update($teacherSchedule->id, $dto->toArray());
        });
        
        // Log activity AFTER transaction commits
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(TeacherSchedule $teacherSchedule): bool
    {
        $data = $teacherSchedule->toArray();
        $result = false;
        
        DB::transaction(function () use ($teacherSchedule, &$result) {
            $result = $this->repository->delete($teacherSchedule->id);
        });
        
        // Log activity AFTER transaction commits
        $this->logActivity('deleted', $teacherSchedule, $data);
        
        return $result;
    }

    public function cancel(TeacherSchedule $teacherSchedule): TeacherSchedule
    {
        if (!$teacherSchedule->canBeCancelled()) {
            throw new \InvalidArgumentException('Schedule cannot be cancelled');
        }

        $oldData = $teacherSchedule->getOriginal();
        $updatedModel = null;
        
        DB::transaction(function () use ($teacherSchedule, &$updatedModel) {
            $updatedModel = $this->repository->update($teacherSchedule->id, [
                'status' => TeacherScheduleStatus::CANCELLED->value
            ]);
        });
        
        // Log activity AFTER transaction commits
        $this->logActivity('cancelled', $updatedModel, [
            'old' => $oldData,
            'new' => ['status' => TeacherScheduleStatus::CANCELLED->value]
        ]);
        
        return $updatedModel;
    }

    public function complete(TeacherSchedule $teacherSchedule): TeacherSchedule
    {
        if ($teacherSchedule->status !== TeacherScheduleStatus::SCHEDULED) {
            throw new \InvalidArgumentException('Only scheduled sessions can be completed');
        }

        $oldData = $teacherSchedule->getOriginal();
        $updatedModel = null;
        
        DB::transaction(function () use ($teacherSchedule, &$updatedModel) {
            $updatedModel = $this->repository->update($teacherSchedule->id, [
                'status' => TeacherScheduleStatus::COMPLETED->value
            ]);
        });
        
        // Log activity AFTER transaction commits
        $this->logActivity('completed', $updatedModel, [
            'old' => $oldData,
            'new' => ['status' => TeacherScheduleStatus::COMPLETED->value]
        ]);
        
        return $updatedModel;
    }

    public function findByTeacherAndSemester(int $teacherId, int $semesterId): iterable
    {
        return $this->repository->findByTeacherAndSemester($teacherId, $semesterId);
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return $this->repository->findByDateRange($startDate, $endDate);
    }

    public function findByStatus(string $status): iterable
    {
        return $this->repository->findByStatus($status);
    }

    protected function getDtoClass(): string
    {
        return TeacherScheduleData::class;
    }

    protected function logActivity(string $action, Model $model, array $data): void
    {
        $properties = [];
        
        if ($action === 'updated') {
            $properties['old'] = $data['old'] ?? [];
            $properties['new'] = $data['new'] ?? [];
        } elseif ($action === 'deleted') {
            $properties['deleted_data'] = $data;
            $properties['deleted_by'] = auth()->id();
        } else {
            $properties['data'] = $data;
        }
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
