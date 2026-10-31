<?php

namespace App\Enums;

enum ZktecoMatchStatus: string
{
    case MATCHED = 'matched';
    case MISMATCHED_ROOM = 'mismatched_room';
    case NO_SCHEDULED_CLASS = 'no_scheduled_class';
    case TEACHER_NOT_FOUND = 'teacher_not_found';
    case DUPLICATE_IGNORED = 'duplicate_ignored';

    public function getLabel(): string
    {
        return match ($this) {
            self::MATCHED => 'Matched (Present)',
            self::MISMATCHED_ROOM => 'Wrong Classroom',
            self::NO_SCHEDULED_CLASS => 'No Scheduled Class',
            self::TEACHER_NOT_FOUND => 'Teacher Not Found',
            self::DUPLICATE_IGNORED => 'Duplicate Ignored',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
