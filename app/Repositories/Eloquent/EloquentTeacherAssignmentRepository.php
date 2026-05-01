<?php

namespace App\Repositories\Eloquent;

use App\Models\TeacherAssignment;
use App\Repositories\TeacherAssignmentRepository;

class EloquentTeacherAssignmentRepository implements TeacherAssignmentRepository
{
    public function all(): iterable
    {
        return TeacherAssignment::all();
    }

    public function findById(int $id): ?TeacherAssignment
    {
        return TeacherAssignment::find($id);
    }

    public function create(array $data): TeacherAssignment
    {
        return TeacherAssignment::create($data);
    }

    public function update(int $id, array $data): TeacherAssignment
    {
        $teacherAssignment = $this->findById($id);
        $teacherAssignment->update($data);

        return $teacherAssignment;
    }

    public function delete(int $id): bool
    {
        $teacherAssignment = $this->findById($id);

        return $teacherAssignment->delete();
    }
}
