<?php

namespace App\Enums;

enum ConflictType: string
{
    case TEACHER_OVERLAP = 'teacher_overlap';
    case ROOM_DOUBLE_BOOK = 'room_double_book';
    case TIME_SLOT_CONFLICT = 'time_slot_conflict';

    public function getLabel(): string
    {
        return match ($this) {
            self::TEACHER_OVERLAP => 'Teacher Schedule Overlap',
            self::ROOM_DOUBLE_BOOK => 'Room Double Booking',
            self::TIME_SLOT_CONFLICT => 'Time Slot Conflict',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
