<?php

namespace App\Enums;

enum TeacherScheduleStatus: string
{
    case SCHEDULED = 'scheduled';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';
    case POSTPONED = 'postponed';

    public function getLabel(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Scheduled',
            self::CANCELLED => 'Cancelled',
            self::COMPLETED => 'Completed',
            self::POSTPONED => 'Postponed',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
