<?php

namespace App\Repositories;

use App\Models\Teacher;

interface TeacherRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Teacher;

    public function create(array $data): Teacher;

    public function update(int $id, array $data): Teacher;

    public function delete(int $id): bool;
}
