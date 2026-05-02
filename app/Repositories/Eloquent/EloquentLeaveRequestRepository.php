<?php

namespace App\Repositories\Eloquent;

use App\Models\LeaveRequest;
use App\Repositories\LeaveRequestRepository;

class EloquentLeaveRequestRepository implements LeaveRequestRepository
{
    public function all(): iterable
    {
        return LeaveRequest::all();
    }

    public function findById(int $id): ?LeaveRequest
    {
        return LeaveRequest::find($id);
    }

    public function create(array $data): LeaveRequest
    {
        return LeaveRequest::create($data);
    }

    public function update(int $id, array $data): LeaveRequest
    {
        $leaveRequest = $this->findById($id);
        $leaveRequest->update($data);

        return $leaveRequest;
    }

    public function delete(int $id): bool
    {
        $leaveRequest = $this->findById($id);

        return $leaveRequest->delete();
    }

    public function findByTeacher(int $teacherId): iterable
    {
        return LeaveRequest::forTeacher($teacherId)->get();
    }

    public function findByLeaveType(string $leaveType): iterable
    {
        return LeaveRequest::byLeaveType($leaveType)->get();
    }

    public function findByStatus(string $status): iterable
    {
        return LeaveRequest::byStatus($status)->get();
    }

    public function findPending(): iterable
    {
        return LeaveRequest::pending()->get();
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return LeaveRequest::forDateRange($startDate, $endDate)->get();
    }
}
