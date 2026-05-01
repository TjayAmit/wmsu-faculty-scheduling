<?php

namespace App\Services;

use App\DTOs\TeacherAssignmentData;
use App\Models\TeacherAssignment;
use App\Repositories\TeacherAssignmentRepository;
use Illuminate\Http\Request;

class TeacherAssignmentService
{
    public function __construct(
        protected TeacherAssignmentRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?TeacherAssignment
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): TeacherAssignment
    {
        $dto = TeacherAssignmentData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): TeacherAssignment
    {
        $dto = TeacherAssignmentData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(TeacherAssignmentData $dto): TeacherAssignment
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, TeacherAssignmentData $dto): TeacherAssignment
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
