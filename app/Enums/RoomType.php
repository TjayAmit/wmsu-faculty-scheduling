<?php

namespace App\Enums;

enum RoomType: string
{
    case CLASSROOM = 'classroom';
    case LAB = 'lab';
    case LECTURE_HALL = 'lecture_hall';
    case OFFICE = 'office';

    public function getLabel(): string
    {
        return match ($this) {
            self::CLASSROOM => 'Classroom',
            self::LAB => 'Laboratory',
            self::LECTURE_HALL => 'Lecture Hall',
            self::OFFICE => 'Office',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
