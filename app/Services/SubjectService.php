<?php

namespace App\Services;

use App\DTOs\SubjectData;
use App\Models\Subject;
use App\Repositories\SubjectRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubjectService
{
    public function __construct(
        protected SubjectRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Subject
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): Subject
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = SubjectData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): Subject
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = SubjectData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray(),
        ]);

        return $updatedModel;
    }

    public function delete(int $id): bool
    {
        $model = $this->repository->findById($id);
        $data = $model->toArray();
        $result = false;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->delete($id);
        });

        $this->logActivity('deleted', $model, $data);

        return $result;
    }

    public function createFromDTO(SubjectData $dto): Subject
    {
        $model = null;

        DB::transaction(function () use ($dto, &$model) {
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromDTO(int $id, SubjectData $dto): Subject
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($id, $dto, &$updatedModel) {
            $updatedModel = $this->repository->update($id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray(),
        ]);

        return $updatedModel;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = [];

        if ($action === 'updated') {
            $properties = $data;
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
            ->log("{$action} ".class_basename($model));
    }
}
