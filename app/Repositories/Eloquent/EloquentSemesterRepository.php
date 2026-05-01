<?php

namespace App\Repositories\Eloquent;

use App\Models\Semester;
use App\Repositories\SemesterRepository;

class EloquentSemesterRepository implements SemesterRepository
{
    public function all(): iterable
    {
        return Semester::all();
    }

    public function findById(int $id): ?Semester
    {
        return Semester::find($id);
    }

    public function create(array $data): Semester
    {
        return Semester::create($data);
    }

    public function update(int $id, array $data): Semester
    {
        $semester = $this->findById($id);
        $semester->update($data);
        return $semester;
    }

    public function delete(int $id): bool
    {
        $semester = $this->findById($id);
        return $semester->delete();
    }
}
