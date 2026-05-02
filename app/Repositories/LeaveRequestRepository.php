<?php

namespace App\Repositories;

use App\Models\LeaveRequest;

interface LeaveRequestRepository
{
    public function all(): iterable;

    public function findById(int $id): ?LeaveRequest;

    public function create(array $data): LeaveRequest;

    public function update(int $id, array $data): LeaveRequest;

    public function delete(int $id): bool;

    public function findByTeacher(int $teacherId): iterable;

    public function findByLeaveType(string $leaveType): iterable;

    public function findByStatus(string $status): iterable;

    public function findPending(): iterable;

    public function findByDateRange(string $startDate, string $endDate): iterable;
}
