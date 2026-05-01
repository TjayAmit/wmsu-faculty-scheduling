<?php

namespace App\Repositories\Eloquent;

use App\Models\TimeSlot;
use App\Repositories\TimeSlotRepository;

class EloquentTimeSlotRepository implements TimeSlotRepository
{
    public function all(): iterable
    {
        return TimeSlot::all();
    }

    public function findById(int $id): ?TimeSlot
    {
        return TimeSlot::find($id);
    }

    public function create(array $data): TimeSlot
    {
        return TimeSlot::create($data);
    }

    public function update(int $id, array $data): TimeSlot
    {
        $timeSlot = $this->findById($id);
        $timeSlot->update($data);
        return $timeSlot;
    }

    public function delete(int $id): bool
    {
        $timeSlot = $this->findById($id);
        return $timeSlot->delete();
    }
}
