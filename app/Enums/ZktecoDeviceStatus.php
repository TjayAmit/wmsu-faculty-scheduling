<?php

namespace App\Enums;

enum ZktecoDeviceStatus: string
{
    case ONLINE = 'online';
    case OFFLINE = 'offline';
    case ERROR = 'error';
    case DISABLED = 'disabled';

    public function getLabel(): string
    {
        return match ($this) {
            self::ONLINE => 'Online',
            self::OFFLINE => 'Offline',
            self::ERROR => 'Connection Error',
            self::DISABLED => 'Disabled',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
