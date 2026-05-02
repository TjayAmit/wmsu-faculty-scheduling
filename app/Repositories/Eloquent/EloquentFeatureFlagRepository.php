<?php

namespace App\Repositories\Eloquent;

use App\Models\FeatureFlag;
use App\Repositories\FeatureFlagRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EloquentFeatureFlagRepository implements FeatureFlagRepository
{
    public function all(): array
    {
        return FeatureFlag::with('enabledBy')->get()->toArray();
    }

    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return FeatureFlag::with('enabledBy')
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?FeatureFlag
    {
        return FeatureFlag::with('enabledBy')->find($id);
    }

    public function findByKey(string $key): ?FeatureFlag
    {
        return FeatureFlag::with('enabledBy')->byKey($key)->first();
    }

    public function create(array $data): FeatureFlag
    {
        return FeatureFlag::create($data);
    }

    public function update(int $id, array $data): FeatureFlag
    {
        $featureFlag = FeatureFlag::findOrFail($id);
        $featureFlag->update($data);
        return $featureFlag->fresh();
    }

    public function delete(int $id): bool
    {
        $featureFlag = FeatureFlag::findOrFail($id);
        return $featureFlag->delete();
    }

    public function enable(int $id, int $enabledBy): FeatureFlag
    {
        $featureFlag = FeatureFlag::findOrFail($id);
        $featureFlag->update([
            'is_enabled' => true,
            'enabled_by' => $enabledBy,
            'enabled_at' => now(),
        ]);
        return $featureFlag->fresh();
    }

    public function disable(int $id): FeatureFlag
    {
        $featureFlag = FeatureFlag::findOrFail($id);
        $featureFlag->update([
            'is_enabled' => false,
            'enabled_by' => null,
            'enabled_at' => null,
        ]);
        return $featureFlag->fresh();
    }

    public function getEnabled(): array
    {
        return FeatureFlag::enabled()->with('enabledBy')->get()->toArray();
    }

    public function getDisabled(): array
    {
        return FeatureFlag::disabled()->with('enabledBy')->get()->toArray();
    }

    public function getAllEnabled(): \Illuminate\Support\Collection
    {
        return FeatureFlag::enabled()->get();
    }
}
