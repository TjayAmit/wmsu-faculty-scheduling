<?php

namespace App\Repositories;

use App\Models\FeatureFlag;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface FeatureFlagRepository
{
    public function all(): array;

    public function paginate(int $perPage = 10): LengthAwarePaginator;

    public function findById(int $id): ?FeatureFlag;

    public function findByKey(string $key): ?FeatureFlag;

    public function create(array $data): FeatureFlag;

    public function update(int $id, array $data): FeatureFlag;

    public function delete(int $id): bool;

    public function enable(int $id, int $enabledBy): FeatureFlag;

    public function disable(int $id): FeatureFlag;

    public function getEnabled(): array;

    public function getDisabled(): array;

    /**
     * Get all enabled feature flags as a collection.
     *
     * @return Collection<int, FeatureFlag>
     */
    public function getAllEnabled(): Collection;
}
