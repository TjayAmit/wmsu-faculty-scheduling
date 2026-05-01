<?php

namespace App\Repositories\Eloquent;

use App\Models\AttendanceRecord;
use App\Repositories\AttendanceRecordRepository;

class EloquentAttendanceRecordRepository implements AttendanceRecordRepository
{
    public function all(): iterable
    {
        return AttendanceRecord::all();
    }

    public function findById(int $id): ?AttendanceRecord
    {
        return AttendanceRecord::find($id);
    }

    public function create(array $data): AttendanceRecord
    {
        return AttendanceRecord::create($data);
    }

    public function update(int $id, array $data): AttendanceRecord
    {
        $attendanceRecord = $this->findById($id);
        $attendanceRecord->update($data);

        return $attendanceRecord;
    }

    public function delete(int $id): bool
    {
        $attendanceRecord = $this->findById($id);

        return $attendanceRecord->delete();
    }
}
