<?php

namespace App\Repositories;

use App\Models\Program;

interface ProgramRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Program;

    public function create(array $data): Program;

    public function update(int $id, array $data): Program;

    public function delete(int $id): bool;

    public function findByCode(string $code): ?Program;

    public function findActive(): iterable;

    public function findByDepartmentId(int $departmentId): iterable;

    public function findByDegreeLevel(string $degreeLevel): iterable;
}
