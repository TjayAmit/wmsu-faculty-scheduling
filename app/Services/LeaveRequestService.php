<?php

namespace App\Services;

use App\DTOs\LeaveRequestData;
use App\Models\LeaveRequest;
use App\Repositories\LeaveRequestRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaveRequestService
{
    public function __construct(
        protected LeaveRequestRepository $repository
    ) {}

    public function create(Request $request): LeaveRequest
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = LeaveRequestData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, LeaveRequest $model): LeaveRequest
    {
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = LeaveRequestData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(LeaveRequest $model): bool
    {
        $data = $model->toArray();
        $result = false;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->delete($model->id);
        });
        
        $this->logActivity('deleted', $model, $data);
        
        return $result;
    }

    public function approve(LeaveRequest $model): LeaveRequest
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

    public function reject(LeaveRequest $model, string $reason): LeaveRequest
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

    public function cancel(LeaveRequest $model): LeaveRequest
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

    public function createFromRequest(Request $request): LeaveRequest
    {
        return $this->create($request);
    }

    public function updateFromRequest(int $id, Request $request): LeaveRequest
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
        return LeaveRequestData::class;
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
