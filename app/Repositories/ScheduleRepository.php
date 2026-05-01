<?php

namespace App\Repositories;

use App\Models\Schedule;

interface ScheduleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Schedule;

    public function create(array $data): Schedule;

    public function update(int $id, array $data): Schedule;

    public function delete(int $id): bool;

    public function checkConflict(int $semesterId, array $timeSlots, ?int $excludeId = null): bool;

    public function getSchedulesByDayAndTimeSlot(string $day, int $timeSlotId, int $semesterId): iterable;

    public function getSchedulesForDay(string $day, int $semesterId): iterable;
}
