<?php

namespace App\Services;

use App\DTOs\ScheduleConflictData;
use App\Models\ScheduleConflict;
use App\Models\User;
use App\Repositories\Contracts\RepositoryInterface;
use App\Repositories\ScheduleConflictRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleConflictService
{
    public function __construct(
        protected ScheduleConflictRepository $repository
    ) {}

    public function create(Request $request): ScheduleConflict
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = ScheduleConflictData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, ScheduleConflict $model): ScheduleConflict
    {
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = ScheduleConflictData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(ScheduleConflict $model): bool
    {
        $data = $model->toArray();
        $result = false;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->delete($model->id);
        });
        
        $this->logActivity('deleted', $model, $data);
        
        return $result;
    }

    public function markAsResolved(ScheduleConflict $model, ?User $resolver = null, ?string $notes = null): bool
    {
        $result = false;
        
        DB::transaction(function () use ($model, $resolver, $notes, &$result) {
            $model->status = \App\Enums\ConflictStatus::RESOLVED->value;
            $model->resolved_by = $resolver?->id;
            $model->resolution_notes = $notes;
            $result = $model->save();
        });
        
        $this->logActivity('resolved', $model, [
            'resolver_id' => $resolver?->id,
            'resolution_notes' => $notes,
        ]);
        
        return $result;
    }

    protected function getDtoClass(): string
    {
        return ScheduleConflictData::class;
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
        
        if ($action === 'resolved') {
            $properties['resolver_id'] = $data['resolver_id'] ?? null;
            $properties['resolution_notes'] = $data['resolution_notes'] ?? null;
        }
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
