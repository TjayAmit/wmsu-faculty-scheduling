<?php

namespace App\Repositories\Eloquent;

use App\Enums\DraftScheduleStatus;
use App\Models\DraftSchedule;
use App\Repositories\DraftScheduleRepository;

class EloquentDraftScheduleRepository implements DraftScheduleRepository
{
    public function all(): iterable
    {
        return DraftSchedule::with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer'])->get();
    }

    public function findById(int $id): ?DraftSchedule
    {
        return DraftSchedule::with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer', 'teacherAssignment'])->find($id);
    }

    public function create(array $data): DraftSchedule
    {
        return DraftSchedule::create($data);
    }

    public function update(int $id, array $data): DraftSchedule
    {
        $draftSchedule = $this->findById($id);
        $draftSchedule->update($data);
        return $draftSchedule;
    }

    public function delete(int $id): bool
    {
        $draftSchedule = $this->findById($id);
        return $draftSchedule->delete();
    }

    public function findByTeacher(int $teacherId): iterable
    {
        return DraftSchedule::with(['schedule.subject', 'schedule.semester'])
            ->where('teacher_id', $teacherId)
            ->get();
    }

    public function findByStatus(DraftScheduleStatus $status): iterable
    {
        return DraftSchedule::with(['teacher.user', 'schedule.subject', 'schedule.semester'])
            ->where('status', $status->value)
            ->get();
    }

    public function findByTeacherAndStatus(int $teacherId, DraftScheduleStatus $status): iterable
    {
        return DraftSchedule::with(['schedule.subject', 'schedule.semester'])
            ->where('teacher_id', $teacherId)
            ->where('status', $status->value)
            ->get();
    }

    public function findBySchedule(int $scheduleId): iterable
    {
        return DraftSchedule::with(['teacher.user'])
            ->where('schedule_id', $scheduleId)
            ->get();
    }
}
