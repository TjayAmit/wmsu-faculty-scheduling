<?php

namespace App\Repositories;

use App\Models\AttendanceRecord;

interface AttendanceRecordRepository
{
    public function all(): iterable;

    public function findById(int $id): ?AttendanceRecord;

    public function create(array $data): AttendanceRecord;

    public function update(int $id, array $data): AttendanceRecord;

    public function delete(int $id): bool;
}
