<?php

namespace App\Repositories;

use App\Models\Department;

interface DepartmentRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Department;

    public function create(array $data): Department;

    public function update(int $id, array $data): Department;

    public function delete(int $id): bool;

    public function findByCode(string $code): ?Department;

    public function findActive(): iterable;

    public function findByHeadId(int $headId): iterable;
}
