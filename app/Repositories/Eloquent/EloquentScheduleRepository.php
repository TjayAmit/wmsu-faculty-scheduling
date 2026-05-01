<?php

namespace App\Repositories\Eloquent;

use App\Models\Schedule;
use App\Repositories\ScheduleRepository;

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
}
