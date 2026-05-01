<?php

namespace App\Enums;

enum ConflictStatus: string
{
    case PENDING = 'pending';
    case RESOLVED = 'resolved';
    case IGNORED = 'ignored';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::RESOLVED => 'Resolved',
            self::IGNORED => 'Ignored',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
