<?php

namespace App\Repositories\Eloquent;

use App\Models\ScheduleConflict;
use App\Repositories\ScheduleConflictRepository;

class EloquentScheduleConflictRepository implements ScheduleConflictRepository
{
    public function all(): iterable
    {
        return ScheduleConflict::all();
    }

    public function findById(int $id): ?ScheduleConflict
    {
        return ScheduleConflict::find($id);
    }

    public function create(array $data): ScheduleConflict
    {
        return ScheduleConflict::create($data);
    }

    public function update(int $id, array $data): ScheduleConflict
    {
        $scheduleConflict = $this->findById($id);
        $scheduleConflict->update($data);

        return $scheduleConflict;
    }

    public function delete(int $id): bool
    {
        $scheduleConflict = $this->findById($id);

        return $scheduleConflict->delete();
    }

    public function findPending(): iterable
    {
        return ScheduleConflict::pending()->get();
    }

    public function findResolved(): iterable
    {
        return ScheduleConflict::resolved()->get();
    }

    public function findByConflictType(string $conflictType): iterable
    {
        return ScheduleConflict::where('conflict_type', $conflictType)->get();
    }

    public function findBySeverity(string $severity): iterable
    {
        return ScheduleConflict::where('severity', $severity)->get();
    }

    public function findByTeacherId(int $teacherId): iterable
    {
        return ScheduleConflict::where('teacher_id', $teacherId)->get();
    }

    public function findByClassroomId(int $classroomId): iterable
    {
        return ScheduleConflict::where('classroom_id', $classroomId)->get();
    }

    public function findBySemesterId(int $semesterId): iterable
    {
        return ScheduleConflict::where('semester_id', $semesterId)->get();
    }
}
