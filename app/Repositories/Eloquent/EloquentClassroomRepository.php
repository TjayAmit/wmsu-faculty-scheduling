<?php

namespace App\Repositories\Eloquent;

use App\Models\Classroom;
use App\Repositories\ClassroomRepository;

class EloquentClassroomRepository implements ClassroomRepository
{
    public function all(): iterable
    {
        return Classroom::all();
    }

    public function findById(int $id): ?Classroom
    {
        return Classroom::find($id);
    }

    public function create(array $data): Classroom
    {
        return Classroom::create($data);
    }

    public function update(int $id, array $data): Classroom
    {
        $classroom = $this->findById($id);
        $classroom->update($data);

        return $classroom;
    }

    public function delete(int $id): bool
    {
        $classroom = $this->findById($id);

        return $classroom->delete();
    }

    public function findByBuildingAndRoom(string $building, string $roomNumber): ?Classroom
    {
        return Classroom::where('building', $building)
            ->where('room_number', $roomNumber)
            ->first();
    }

    public function findActive(): iterable
    {
        return Classroom::active()->get();
    }

    public function findByRoomType(string $roomType): iterable
    {
        return Classroom::where('room_type', $roomType)->get();
    }
}
