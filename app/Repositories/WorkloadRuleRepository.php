<?php

namespace App\Repositories;

use App\Models\WorkloadRule;

interface WorkloadRuleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?WorkloadRule;

    public function create(array $data): WorkloadRule;

    public function update(int $id, array $data): WorkloadRule;

    public function delete(int $id): bool;

    public function findActive(): iterable;

    public function findByEmploymentType(string $employmentType): iterable;

    public function findEffectiveOn(string $date): iterable;

    public function findLatest(): iterable;
}
