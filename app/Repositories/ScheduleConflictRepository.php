<?php

namespace App\Repositories;

use App\Models\ScheduleConflict;

interface ScheduleConflictRepository
{
    public function all(): iterable;

    public function findById(int $id): ?ScheduleConflict;

    public function create(array $data): ScheduleConflict;

    public function update(int $id, array $data): ScheduleConflict;

    public function delete(int $id): bool;

    public function findPending(): iterable;

    public function findResolved(): iterable;

    public function findByConflictType(string $conflictType): iterable;

    public function findBySeverity(string $severity): iterable;

    public function findByTeacherId(int $teacherId): iterable;

    public function findByClassroomId(int $classroomId): iterable;

    public function findBySemesterId(int $semesterId): iterable;
}
