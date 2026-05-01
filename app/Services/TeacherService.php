<?php

namespace App\Services;

use App\DTOs\TeacherData;
use App\Models\Teacher;
use App\Repositories\TeacherRepository;
use Illuminate\Http\Request;

class TeacherService
{
    public function __construct(
        protected TeacherRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Teacher
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): Teacher
    {
        $dto = TeacherData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): Teacher
    {
        $dto = TeacherData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(TeacherData $dto): Teacher
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, TeacherData $dto): Teacher
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
