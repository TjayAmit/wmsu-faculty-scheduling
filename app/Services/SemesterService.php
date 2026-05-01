<?php

namespace App\Services;

use App\DTOs\SemesterData;
use App\Models\Semester;
use App\Repositories\SemesterRepository;
use Illuminate\Http\Request;

class SemesterService
{
    public function __construct(
        protected SemesterRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Semester
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): Semester
    {
        $dto = SemesterData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): Semester
    {
        $dto = SemesterData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(SemesterData $dto): Semester
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, SemesterData $dto): Semester
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
