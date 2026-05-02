<?php

namespace App\Services;

use App\DTOs\FeatureFlagData;
use App\Models\FeatureFlag;
use App\Repositories\FeatureFlagRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FeatureFlagService
{
    public function __construct(
        protected FeatureFlagRepository $repository
    ) {}

    public function create(Request $request): FeatureFlag
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = FeatureFlagData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, FeatureFlag $featureFlag): FeatureFlag
    {
        $oldData = $featureFlag->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $featureFlag, &$dto, &$updatedModel) {
            $dto = FeatureFlagData::fromRequest($request);
            $updatedModel = $this->repository->update($featureFlag->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(FeatureFlag $featureFlag): bool
    {
        $data = $featureFlag->toArray();
        $result = false;
        
        DB::transaction(function () use ($featureFlag, &$result) {
            $result = $this->repository->delete($featureFlag->id);
        });
        
        $this->logActivity('deleted', $featureFlag, $data);
        
        return $result;
    }

    public function enable(int $id): FeatureFlag
    {
        $featureFlag = $this->repository->findById($id);
        if (!$featureFlag) {
            throw new \Exception('Feature flag not found');
        }

        $result = false;
        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->enable($id, Auth::id());
        });
        
        $this->logActivity('enabled', $featureFlag, [
            'enabled_by' => Auth::id(),
            'enabled_at' => now()->format('Y-m-d H:i:s'),
        ]);
        
        return $result;
    }

    public function disable(int $id): FeatureFlag
    {
        $featureFlag = $this->repository->findById($id);
        if (!$featureFlag) {
            throw new \Exception('Feature flag not found');
        }

        $result = false;
        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->disable($id);
        });
        
        $this->logActivity('disabled', $featureFlag, [
            'disabled_by' => Auth::id(),
            'disabled_at' => now()->format('Y-m-d H:i:s'),
        ]);
        
        return $result;
    }

    public function isEnabled(string $key): bool
    {
        $featureFlag = $this->repository->findByKey($key);
        return $featureFlag ? $featureFlag->isEnabled() : false;
    }

    public function getEnabled(): array
    {
        return $this->repository->getEnabled();
    }

    public function getDisabled(): array
    {
        return $this->repository->getDisabled();
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = [];
        
        if ($action === 'updated') {
            $properties['old'] = $data['old'] ?? [];
            $properties['new'] = $data['new'] ?? [];
        }
        
        if ($action === 'deleted') {
            $properties['deleted_data'] = $data;
            $properties['deleted_by'] = Auth::id();
        }
        
        if ($action === 'enabled') {
            $properties['enabled_by'] = $data['enabled_by'];
            $properties['enabled_at'] = $data['enabled_at'];
        }
        
        if ($action === 'disabled') {
            $properties['disabled_by'] = $data['disabled_by'];
            $properties['disabled_at'] = $data['disabled_at'];
        }
        
        activity()
            ->causedBy(Auth::user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }

    protected function getDtoClass(): string
    {
        return FeatureFlagData::class;
    }
}
