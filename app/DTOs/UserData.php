<?php

namespace App\DTOs;

use App\Models\User;
use Illuminate\Http\Request;

readonly class UserData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $password = null,
        public ?string $email_verified_at = null,
        public ?string $two_factor_confirmed_at = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            email_verified_at: $request->validated('email_verified_at'),
            two_factor_confirmed_at: $request->validated('two_factor_confirmed_at'),
        );
    }

    public static function fromModel(User $user): self
    {
        return new self(
            name: $user->name,
            email: $user->email,
            email_verified_at: $user->email_verified_at?->toDateTimeString(),
            two_factor_confirmed_at: $user->two_factor_confirmed_at?->toDateTimeString(),
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
