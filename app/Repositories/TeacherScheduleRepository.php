<?php

namespace App\Repositories;

use App\Models\TeacherSchedule;

interface TeacherScheduleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?TeacherSchedule;

    public function create(array $data): TeacherSchedule;

    public function update(int $id, array $data): TeacherSchedule;

    public function delete(int $id): bool;

    public function findByTeacherAndSemester(int $teacherId, int $semesterId): iterable;

    public function findByDraftSchedule(int $draftScheduleId): iterable;

    public function findByDateRange(string $startDate, string $endDate): iterable;

    public function findByStatus(string $status): iterable;

    public function deleteByDraftSchedule(int $draftScheduleId): bool;
}
