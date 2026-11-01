<?php

namespace App\Enums;

enum DegreeLevel: string
{
    case BACHELOR = 'bachelor';
    case MASTER = 'master';
    case DOCTORAL = 'doctoral';
    case CERTIFICATE = 'certificate';

    public function getLabel(): string
    {
        return match ($this) {
            self::BACHELOR => 'Bachelor\'s Degree',
            self::MASTER => 'Master\'s Degree',
            self::DOCTORAL => 'Doctoral Degree',
            self::CERTIFICATE => 'Certificate Program',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
