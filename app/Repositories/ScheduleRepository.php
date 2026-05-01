<?php

namespace App\Repositories;

use App\Models\Schedule;

interface ScheduleRepositoryInterface
{
    public function all(): iterable;

    public function findById(int $id): ?Schedule;

    public function create(array $data): Schedule;

    public function update(int $id, array $data): Schedule;

    public function delete(int $id): bool;
}
