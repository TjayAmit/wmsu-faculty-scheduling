<?php

namespace App\Services;

use App\DTOs\AttendanceRecordData;
use App\Models\AttendanceRecord;
use App\Repositories\AttendanceRecordRepository;
use Illuminate\Http\Request;

class AttendanceRecordService
{
    public function __construct(
        protected AttendanceRecordRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?AttendanceRecord
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): AttendanceRecord
    {
        $dto = AttendanceRecordData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): AttendanceRecord
    {
        $dto = AttendanceRecordData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(AttendanceRecordData $dto): AttendanceRecord
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, AttendanceRecordData $dto): AttendanceRecord
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
