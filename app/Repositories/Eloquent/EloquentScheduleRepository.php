<?php

namespace App\Repositories\Eloquent;

use App\Models\Schedule;
use App\Repositories\ScheduleRepository;
use Illuminate\Support\Facades\DB;

class EloquentScheduleRepository implements ScheduleRepository
{
    public function all(): iterable
    {
        return Schedule::all();
    }

    public function findById(int $id): ?Schedule
    {
        return Schedule::find($id);
    }

    public function create(array $data): Schedule
    {
        return Schedule::create($data);
    }

    public function update(int $id, array $data): Schedule
    {
        $schedule = $this->findById($id);
        $schedule->update($data);
        return $schedule;
    }

    public function delete(int $id): bool
    {
        $schedule = $this->findById($id);
        return $schedule->delete();
    }

    public function checkConflict(int $semesterId, array $timeSlots, ?int $excludeId = null): bool
    {
        foreach ($timeSlots as $slot) {
            $day = $slot['day'];
            $timeSlotId = $slot['time_slot_id'];

            $query = Schedule::where('semester_id', $semesterId)
                ->whereJsonContains('time_slots', [['day' => $day, 'time_slot_id' => $timeSlotId]]);

            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if ($query->exists()) {
                return true;
            }
        }

        return false;
    }

    public function getSchedulesByDayAndTimeSlot(string $day, int $timeSlotId, int $semesterId): iterable
    {
        return Schedule::where('semester_id', $semesterId)
            ->whereJsonContains('time_slots', [['day' => $day, 'time_slot_id' => $timeSlotId]])
            ->get();
    }

    public function getSchedulesForDay(string $day, int $semesterId): iterable
    {
        return Schedule::where('semester_id', $semesterId)
            ->whereJsonContains('time_slots', [['day' => $day]])
            ->get();
    }
}
