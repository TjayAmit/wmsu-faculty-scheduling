<?php

namespace App\Repositories;

use App\Models\TimeSlot;

interface TimeSlotRepository
{
    public function all(): iterable;

    public function findById(int $id): ?TimeSlot;

    public function create(array $data): TimeSlot;

    public function update(int $id, array $data): TimeSlot;

    public function delete(int $id): bool;
}
