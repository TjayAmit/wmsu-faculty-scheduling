<?php

namespace App\Repositories;

use App\Models\RoomSchedule;

interface RoomScheduleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?RoomSchedule;

    public function create(array $data): RoomSchedule;

    public function update(int $id, array $data): RoomSchedule;

    public function delete(int $id): bool;

    public function findByClassroomAndDate(int $classroomId, string $date): iterable;

    public function findByDateRange(string $startDate, string $endDate): iterable;

    public function findActive(): iterable;

    public function findBySchedule(int $scheduleId): iterable;

    public function findOverlapping(int $classroomId, string $date, string $startTime, string $endTime): iterable;
}
