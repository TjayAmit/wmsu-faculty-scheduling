<?php

namespace App\Enums;

enum HolidayType: string
{
    case REGULAR = 'regular';
    case SPECIAL = 'special';
    case SUSPENSION = 'suspension';

    public function getLabel(): string
    {
        return match ($this) {
            self::REGULAR => 'Regular Holiday',
            self::SPECIAL => 'Special Holiday',
            self::SUSPENSION => 'Class Suspension',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
