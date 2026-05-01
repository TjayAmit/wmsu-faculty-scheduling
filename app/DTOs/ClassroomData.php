<?php

namespace App\DTOs;

use App\Enums\RoomType;
use Illuminate\Http\Request;

class ClassroomData
{
    public function __construct(
        public readonly string $building,
        public readonly string $room_number,
        public readonly ?string $room_name = null,
        public readonly int $capacity = 30,
        public readonly RoomType $room_type = RoomType::CLASSROOM,
        public readonly ?array $equipment = null,
        public readonly bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            building: $request->validated('building'),
            room_number: $request->validated('room_number'),
            room_name: $request->validated('room_name'),
            capacity: $request->validated('capacity', 30),
            room_type: RoomType::from($request->validated('room_type', RoomType::CLASSROOM->value)),
            equipment: $request->validated('equipment'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Classroom $classroom): self
    {
        return new self(
            building: $classroom->building,
            room_number: $classroom->room_number,
            room_name: $classroom->room_name,
            capacity: $classroom->capacity,
            room_type: RoomType::from($classroom->room_type),
            equipment: $classroom->equipment,
            is_active: $classroom->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'building' => $this->building,
            'room_number' => $this->room_number,
            'room_name' => $this->room_name,
            'capacity' => $this->capacity,
            'room_type' => $this->room_type->value,
            'equipment' => $this->equipment,
            'is_active' => $this->is_active,
        ], fn ($value) => $value !== null);
    }
}
