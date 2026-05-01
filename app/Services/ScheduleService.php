<?php

namespace App\Services;

use App\DTOs\ScheduleData;
use App\Models\Schedule;
use App\Repositories\ScheduleRepository;
use Illuminate\Http\Request;

class ScheduleService
{
    public function __construct(
        protected ScheduleRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Schedule
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): Schedule
    {
        $dto = ScheduleData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): Schedule
    {
        $dto = ScheduleData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(ScheduleData $dto): Schedule
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, ScheduleData $dto): Schedule
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
