<?php

namespace App\Repositories;

use App\Enums\DraftScheduleStatus;
use App\Models\DraftSchedule;

interface DraftScheduleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?DraftSchedule;

    public function create(array $data): DraftSchedule;

    public function update(int $id, array $data): DraftSchedule;

    public function delete(int $id): bool;

    public function findByTeacher(int $teacherId): iterable;

    public function findByStatus(DraftScheduleStatus $status): iterable;

    public function findByTeacherAndStatus(int $teacherId, DraftScheduleStatus $status): iterable;

    public function findBySchedule(int $scheduleId): iterable;
}
