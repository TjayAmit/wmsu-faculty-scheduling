<?php

namespace App\Services;

use App\DTOs\TeachingHistoryData;
use App\Models\TeachingHistory;
use App\Repositories\TeachingHistoryRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeachingHistoryService
{
    public function __construct(
        protected TeachingHistoryRepository $repository
    ) {}

    public function create(Request $request): TeachingHistory
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = TeachingHistoryData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, TeachingHistory $model): TeachingHistory
    {
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = TeachingHistoryData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(TeachingHistory $model): bool
    {
        $data = $model->toArray();
        $result = false;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->delete($model->id);
        });
        
        $this->logActivity('deleted', $model, $data);
        
        return $result;
    }

    public function createFromRequest(Request $request): TeachingHistory
    {
        return $this->create($request);
    }

    public function updateFromRequest(int $id, Request $request): TeachingHistory
    {
        $model = $this->repository->findById($id);
        return $this->update($request, $model);
    }

    public function deleteById(int $id): bool
    {
        $model = $this->repository->findById($id);
        return $this->delete($model);
    }

    public function archive(TeachingHistory $model): TeachingHistory
    {
        $data = $model->toArray();
        $result = null;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->update($model->id, [
                'archived_at' => now(),
            ]);
        });
        
        $this->logActivity('archived', $result, $data);
        
        return $result;
    }

    protected function getDtoClass(): string
    {
        return TeachingHistoryData::class;
    }

    protected function logActivity(string $action, Model $model, array $data): void
    {
        $properties = [];
        
        if ($action === 'updated') {
            $properties['old'] = $data['old'] ?? [];
            $properties['new'] = $data['new'] ?? [];
        }
        
        if ($action === 'deleted') {
            $properties['deleted_data'] = $data;
            $properties['deleted_by'] = auth()->id();
        }
        
        if ($action === 'created') {
            $properties['new_data'] = $data;
        }
        
        if ($action === 'archived') {
            $properties['archived_data'] = $data;
            $properties['archived_by'] = auth()->id();
        }
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
