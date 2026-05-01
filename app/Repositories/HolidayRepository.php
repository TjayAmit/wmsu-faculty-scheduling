<?php

namespace App\Repositories;

use App\Models\Holiday;

interface HolidayRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Holiday;

    public function create(array $data): Holiday;

    public function update(int $id, array $data): Holiday;

    public function delete(int $id): bool;

    public function findByDate(string $date): ?Holiday;

    public function findByDateRange(string $startDate, string $endDate): iterable;

    public function findAffectsSchedules(): iterable;

    public function findByType(string $type): iterable;

    public function findByAcademicYear(string $academicYear): iterable;
}
