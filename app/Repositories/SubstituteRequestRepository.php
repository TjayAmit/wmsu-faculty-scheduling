<?php

namespace App\Repositories;

use App\Models\SubstituteRequest;

interface SubstituteRequestRepository
{
    public function all(): iterable;

    public function findById(int $id): ?SubstituteRequest;

    public function create(array $data): SubstituteRequest;

    public function update(int $id, array $data): SubstituteRequest;

    public function delete(int $id): bool;

    public function findByRequestingTeacher(int $teacherId): iterable;

    public function findBySubstituteTeacher(int $teacherId): iterable;

    public function findByStatus(string $status): iterable;

    public function findPending(): iterable;

    public function findByDate(string $date): iterable;

    public function findByDateRange(string $startDate, string $endDate): iterable;
}
