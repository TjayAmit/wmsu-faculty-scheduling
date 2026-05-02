<?php

namespace App\Repositories\Eloquent;

use App\Models\TeachingHistory;
use App\Repositories\TeachingHistoryRepository;

class EloquentTeachingHistoryRepository implements TeachingHistoryRepository
{
    public function all(): iterable
    {
        return TeachingHistory::all();
    }

    public function findById(int $id): ?TeachingHistory
    {
        return TeachingHistory::find($id);
    }

    public function create(array $data): TeachingHistory
    {
        return TeachingHistory::create($data);
    }

    public function update(int $id, array $data): TeachingHistory
    {
        $teachingHistory = $this->findById($id);
        $teachingHistory->update($data);

        return $teachingHistory;
    }

    public function delete(int $id): bool
    {
        $teachingHistory = $this->findById($id);

        return $teachingHistory->delete();
    }

    public function findByTeacher(int $teacherId): iterable
    {
        return TeachingHistory::forTeacher($teacherId)->get();
    }

    public function findBySemester(int $semesterId): iterable
    {
        return TeachingHistory::forSemester($semesterId)->get();
    }

    public function findByTeacherAndSemester(int $teacherId, int $semesterId): iterable
    {
        return TeachingHistory::forTeacher($teacherId)
            ->forSemester($semesterId)
            ->get();
    }

    public function findByStatus(string $status): iterable
    {
        return TeachingHistory::byStatus($status)->get();
    }

    public function findArchived(): iterable
    {
        return TeachingHistory::archived()->get();
    }

    public function getTotalHoursByTeacher(int $teacherId): float
    {
        return (float) TeachingHistory::forTeacher($teacherId)
            ->sum('hours_completed');
    }

    public function getTotalHoursBySemester(int $semesterId): float
    {
        return (float) TeachingHistory::forSemester($semesterId)
            ->sum('hours_completed');
    }
}
