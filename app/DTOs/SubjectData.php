<?php

namespace App\DTOs;

use App\Models\Subject;
use Illuminate\Http\Request;

readonly class SubjectData
{
    public function __construct(
        public string $code,
        public string $title,
        public ?float $units = null,
        public ?string $description = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            code: $request->input('code'),
            title: $request->input('title'),
            units: $request->input('units'),
            description: $request->input('description'),
            is_active: $request->input('is_active', true),
        );
    }

    public static function fromModel(Subject $subject): self
    {
        return new self(
            code: $subject->code,
            title: $subject->title,
            units: $subject->units,
            description: $subject->description,
            is_active: $subject->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
