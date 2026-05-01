<?php

namespace App\Repositories;

use App\Models\Classroom;

interface ClassroomRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Classroom;

    public function create(array $data): Classroom;

    public function update(int $id, array $data): Classroom;

    public function delete(int $id): bool;

    public function findByBuildingAndRoom(string $building, string $roomNumber): ?Classroom;

    public function findActive(): iterable;

    public function findByRoomType(string $roomType): iterable;
}
