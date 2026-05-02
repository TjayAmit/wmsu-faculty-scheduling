<?php

namespace App\Repositories\Eloquent;

use App\Models\RoomSchedule;
use App\Repositories\RoomScheduleRepository;

class EloquentRoomScheduleRepository implements RoomScheduleRepository
{
    public function all(): iterable
    {
        return RoomSchedule::all();
    }

    public function findById(int $id): ?RoomSchedule
    {
        return RoomSchedule::find($id);
    }

    public function create(array $data): RoomSchedule
    {
        return RoomSchedule::create($data);
    }

    public function update(int $id, array $data): RoomSchedule
    {
        $roomSchedule = $this->findById($id);
        $roomSchedule->update($data);

        return $roomSchedule;
    }

    public function delete(int $id): bool
    {
        $roomSchedule = $this->findById($id);

        return $roomSchedule->delete();
    }

    public function findByClassroomAndDate(int $classroomId, string $date): iterable
    {
        return RoomSchedule::forClassroom($classroomId)
            ->forDate($date)
            ->get();
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return RoomSchedule::forDateRange($startDate, $endDate)
            ->get();
    }

    public function findActive(): iterable
    {
        return RoomSchedule::active()->get();
    }

    public function findBySchedule(int $scheduleId): iterable
    {
        return RoomSchedule::where('schedule_id', $scheduleId)->get();
    }

    public function findOverlapping(int $classroomId, string $date, string $startTime, string $endTime): iterable
    {
        return RoomSchedule::forClassroom($classroomId)
            ->forDate($date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->get();
    }
}
