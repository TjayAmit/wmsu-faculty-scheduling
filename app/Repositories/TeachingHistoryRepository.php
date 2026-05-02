<?php

namespace App\Repositories;

use App\Models\TeachingHistory;

interface TeachingHistoryRepository
{
    public function all(): iterable;

    public function findById(int $id): ?TeachingHistory;

    public function create(array $data): TeachingHistory;

    public function update(int $id, array $data): TeachingHistory;

    public function delete(int $id): bool;

    public function findByTeacher(int $teacherId): iterable;

    public function findBySemester(int $semesterId): iterable;

    public function findByTeacherAndSemester(int $teacherId, int $semesterId): iterable;

    public function findByStatus(string $status): iterable;

    public function findArchived(): iterable;

    public function getTotalHoursByTeacher(int $teacherId): float;

    public function getTotalHoursBySemester(int $semesterId): float;
}
