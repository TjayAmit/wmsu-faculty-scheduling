<?php

namespace App\Repositories;

use App\Models\Subject;

interface SubjectRepositoryInterface
{
    public function all(): iterable;

    public function findById(int $id): ?Subject;

    public function create(array $data): Subject;

    public function update(int $id, array $data): Subject;

    public function delete(int $id): bool;
}
