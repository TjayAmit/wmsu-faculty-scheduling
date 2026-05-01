<?php

namespace App\Services;

use App\DTOs\TimeSlotData;
use App\Models\TimeSlot;
use App\Repositories\TimeSlotRepository;
use Illuminate\Http\Request;

class TimeSlotService
{
    public function __construct(
        protected TimeSlotRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?TimeSlot
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): TimeSlot
    {
        $dto = TimeSlotData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): TimeSlot
    {
        $dto = TimeSlotData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(TimeSlotData $dto): TimeSlot
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, TimeSlotData $dto): TimeSlot
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
