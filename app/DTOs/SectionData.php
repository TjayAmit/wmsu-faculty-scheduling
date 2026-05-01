<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class SectionData
{
    public function __construct(
        public readonly string $section_code,
        public readonly int $program_id,
        public readonly int $semester_id,
        public readonly int $year_level = 1,
        public readonly int $max_students = 40,
        public readonly int $current_students = 0,
        public readonly ?int $adviser_id = null,
        public readonly bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            section_code: $request->validated('section_code'),
            program_id: $request->validated('program_id'),
            semester_id: $request->validated('semester_id'),
            year_level: $request->validated('year_level', 1),
            max_students: $request->validated('max_students', 40),
            current_students: $request->validated('current_students', 0),
            adviser_id: $request->validated('adviser_id'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Section $section): self
    {
        return new self(
            section_code: $section->section_code,
            program_id: $section->program_id,
            semester_id: $section->semester_id,
            year_level: $section->year_level,
            max_students: $section->max_students,
            current_students: $section->current_students,
            adviser_id: $section->adviser_id,
            is_active: $section->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'section_code' => $this->section_code,
            'program_id' => $this->program_id,
            'semester_id' => $this->semester_id,
            'year_level' => $this->year_level,
            'max_students' => $this->max_students,
            'current_students' => $this->current_students,
            'adviser_id' => $this->adviser_id,
            'is_active' => $this->is_active,
        ], fn ($value) => $value !== null);
    }
}
