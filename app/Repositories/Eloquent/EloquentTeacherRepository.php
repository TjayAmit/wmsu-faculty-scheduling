<?php

namespace App\Repositories\Eloquent;

use App\Models\Teacher;
use App\Repositories\TeacherRepository;

class EloquentTeacherRepository implements TeacherRepository
{
    public function all(): iterable
    {
        return Teacher::all();
    }

    public function findById(int $id): ?Teacher
    {
        return Teacher::find($id);
    }

    public function create(array $data): Teacher
    {
        return Teacher::create($data);
    }

    public function update(int $id, array $data): Teacher
    {
        $teacher = $this->findById($id);
        $teacher->update($data);
        return $teacher;
    }

    public function delete(int $id): bool
    {
        $teacher = $this->findById($id);
        return $teacher->delete();
    }
}
