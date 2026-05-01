<?php

namespace App\Services;

use App\DTOs\SubjectData;
use App\Models\Subject;
use App\Repositories\SubjectRepository;
use Illuminate\Http\Request;

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
        $dto = SubjectData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): Subject
    {
        $dto = SubjectData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(SubjectData $dto): Subject
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, SubjectData $dto): Subject
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
