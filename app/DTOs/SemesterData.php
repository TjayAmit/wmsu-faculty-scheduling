<?php

namespace App\DTOs;

use App\Enums\SemesterType;
use App\Models\Semester;
use Illuminate\Http\Request;

readonly class SemesterData
{
    public function __construct(
        public string $name,
        public string $academic_year,
        public SemesterType|string $semester_type,
        public ?string $start_date = null,
        public ?string $end_date = null,
        public bool $is_current = false,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->validated('name'),
            academic_year: $request->validated('academic_year'),
            semester_type: $request->validated('semester_type'),
            start_date: $request->validated('start_date'),
            end_date: $request->validated('end_date'),
            is_current: $request->validated('is_current', false),
        );
    }

    public static function fromModel(Semester $semester): self
    {
        return new self(
            name: $semester->name,
            academic_year: $semester->academic_year,
            semester_type: $semester->semester_type,
            start_date: $semester->start_date?->toDateString(),
            end_date: $semester->end_date?->toDateString(),
            is_current: $semester->is_current,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
