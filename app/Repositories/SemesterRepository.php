<?php

namespace App\Repositories;

use App\Models\Semester;

interface SemesterRepositoryInterface
{
    public function all(): iterable;

    public function findById(int $id): ?Semester;

    public function create(array $data): Semester;

    public function update(int $id, array $data): Semester;

    public function delete(int $id): bool;
}
