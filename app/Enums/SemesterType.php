<?php

namespace App\Enums;

enum SemesterType: string
{
    case FIRST = 'first';
    case SECOND = 'second';
    case SUMMER = 'summer';

    public function getLabel(): string
    {
        return match ($this) {
            self::FIRST => 'First Semester',
            self::SECOND => 'Second Semester',
            self::SUMMER => 'Summer',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
