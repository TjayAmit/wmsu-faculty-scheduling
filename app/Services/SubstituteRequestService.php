<?php

namespace App\Services;

use App\DTOs\SubstituteRequestData;
use App\Models\SubstituteRequest;
use App\Repositories\SubstituteRequestRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubstituteRequestService
{
    public function __construct(
        protected SubstituteRequestRepository $repository
    ) {}

    public function create(Request $request): SubstituteRequest
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = SubstituteRequestData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, SubstituteRequest $model): SubstituteRequest
    {
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = SubstituteRequestData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(SubstituteRequest $model): bool
    {
        $data = $model->toArray();
        $result = false;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->delete($model->id);
        });
        
        $this->logActivity('deleted', $model, $data);
        
        return $result;
    }

    public function approve(SubstituteRequest $model): SubstituteRequest
    {
        $oldData = $model->getOriginal();
        $result = null;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->update($model->id, [
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        });
        
        $this->logActivity('approved', $result, [
            'old' => $oldData,
            'new' => $result->toArray()
        ]);
        
        return $result;
    }

    public function reject(SubstituteRequest $model, string $reason): SubstituteRequest
    {
        $oldData = $model->getOriginal();
        $result = null;
        
        DB::transaction(function () use ($model, $reason, &$result) {
            $result = $this->repository->update($model->id, [
                'status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $reason,
            ]);
        });
        
        $this->logActivity('rejected', $result, [
            'old' => $oldData,
            'new' => $result->toArray()
        ]);
        
        return $result;
    }

    public function cancel(SubstituteRequest $model): SubstituteRequest
    {
        $oldData = $model->getOriginal();
        $result = null;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->update($model->id, [
                'status' => 'cancelled',
            ]);
        });
        
        $this->logActivity('cancelled', $result, [
            'old' => $oldData,
            'new' => $result->toArray()
        ]);
        
        return $result;
    }

    public function createFromRequest(Request $request): SubstituteRequest
    {
        return $this->create($request);
    }

    public function updateFromRequest(int $id, Request $request): SubstituteRequest
    {
        $model = $this->repository->findById($id);
        return $this->update($request, $model);
    }

    public function deleteById(int $id): bool
    {
        $model = $this->repository->findById($id);
        return $this->delete($model);
    }

    protected function getDtoClass(): string
    {
        return SubstituteRequestData::class;
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
        
        if (in_array($action, ['approved', 'rejected', 'cancelled'])) {
            $properties['old'] = $data['old'] ?? [];
            $properties['new'] = $data['new'] ?? [];
            $properties['action_by'] = auth()->id();
        }
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
