<?php

namespace App\Repositories\Eloquent;

use App\Models\SubstituteRequest;
use App\Repositories\SubstituteRequestRepository;

class EloquentSubstituteRequestRepository implements SubstituteRequestRepository
{
    public function all(): iterable
    {
        return SubstituteRequest::all();
    }

    public function findById(int $id): ?SubstituteRequest
    {
        return SubstituteRequest::find($id);
    }

    public function create(array $data): SubstituteRequest
    {
        return SubstituteRequest::create($data);
    }

    public function update(int $id, array $data): SubstituteRequest
    {
        $substituteRequest = $this->findById($id);
        $substituteRequest->update($data);

        return $substituteRequest;
    }

    public function delete(int $id): bool
    {
        $substituteRequest = $this->findById($id);

        return $substituteRequest->delete();
    }

    public function findByRequestingTeacher(int $teacherId): iterable
    {
        return SubstituteRequest::forRequestingTeacher($teacherId)->get();
    }

    public function findBySubstituteTeacher(int $teacherId): iterable
    {
        return SubstituteRequest::forSubstituteTeacher($teacherId)->get();
    }

    public function findByStatus(string $status): iterable
    {
        return SubstituteRequest::byStatus($status)->get();
    }

    public function findPending(): iterable
    {
        return SubstituteRequest::pending()->get();
    }

    public function findByDate(string $date): iterable
    {
        return SubstituteRequest::forDate($date)->get();
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return SubstituteRequest::whereBetween('date', [$startDate, $endDate])->get();
    }
}
