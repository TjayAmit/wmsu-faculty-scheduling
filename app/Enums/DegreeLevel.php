<?php

namespace App\Enums;

enum DegreeLevel: string
{
    case BACHELOR = 'bachelor';
    case MASTER = 'master';
    case DOCTORAL = 'doctoral';

    public function getLabel(): string
    {
        return match ($this) {
            self::BACHELOR => 'Bachelor\'s Degree',
            self::MASTER => 'Master\'s Degree',
            self::DOCTORAL => 'Doctoral Degree',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
