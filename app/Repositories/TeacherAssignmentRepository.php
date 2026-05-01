<?php

namespace App\Repositories;

use App\Models\TeacherAssignment;

interface TeacherAssignmentRepository
{
    public function all(): iterable;

    public function findById(int $id): ?TeacherAssignment;

    public function create(array $data): TeacherAssignment;

    public function update(int $id, array $data): TeacherAssignment;

    public function delete(int $id): bool;
}
