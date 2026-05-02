<?php

namespace App\Services;

use App\DTOs\RoomScheduleData;
use App\Models\RoomSchedule;
use App\Repositories\RoomScheduleRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomScheduleService
{
    public function __construct(
        protected RoomScheduleRepository $repository
    ) {}

    public function create(Request $request): RoomSchedule
    {
        $model = null;
        $dto = null;
        
        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = RoomScheduleData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });
        
        $this->logActivity('created', $model, $dto->toArray());
        
        return $model;
    }

    public function update(Request $request, RoomSchedule $model): RoomSchedule
    {
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;
        
        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = RoomScheduleData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });
        
        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray()
        ]);
        
        return $updatedModel;
    }

    public function delete(RoomSchedule $model): bool
    {
        $data = $model->toArray();
        $result = false;
        
        DB::transaction(function () use ($model, &$result) {
            $result = $this->repository->delete($model->id);
        });
        
        $this->logActivity('deleted', $model, $data);
        
        return $result;
    }

    public function createFromRequest(Request $request): RoomSchedule
    {
        return $this->create($request);
    }

    public function updateFromRequest(int $id, Request $request): RoomSchedule
    {
        $model = $this->repository->findById($id);
        return $this->update($request, $model);
    }

    public function deleteById(int $id): bool
    {
        $model = $this->repository->findById($id);
        return $this->delete($model);
    }

    public function checkForOverlaps(int $classroomId, string $date, string $startTime, string $endTime): iterable
    {
        return $this->repository->findOverlapping($classroomId, $date, $startTime, $endTime);
    }

    protected function getDtoClass(): string
    {
        return RoomScheduleData::class;
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
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
