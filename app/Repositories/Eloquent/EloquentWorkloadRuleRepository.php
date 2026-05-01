<?php

namespace App\Repositories\Eloquent;

use App\Models\WorkloadRule;
use App\Repositories\WorkloadRuleRepository;

class EloquentWorkloadRuleRepository implements WorkloadRuleRepository
{
    public function all(): iterable
    {
        return WorkloadRule::all();
    }

    public function findById(int $id): ?WorkloadRule
    {
        return WorkloadRule::find($id);
    }

    public function create(array $data): WorkloadRule
    {
        return WorkloadRule::create($data);
    }

    public function update(int $id, array $data): WorkloadRule
    {
        $workloadRule = $this->findById($id);
        $workloadRule->update($data);

        return $workloadRule;
    }

    public function delete(int $id): bool
    {
        $workloadRule = $this->findById($id);

        return $workloadRule->delete();
    }

    public function findActive(): iterable
    {
        return WorkloadRule::active()->get();
    }

    public function findByEmploymentType(string $employmentType): iterable
    {
        return WorkloadRule::where('employment_type', $employmentType)->get();
    }

    public function findEffectiveOn(string $date): iterable
    {
        return WorkloadRule::effectiveOn($date)->get();
    }

    public function findLatest(): iterable
    {
        return WorkloadRule::latest()->get();
    }
}
