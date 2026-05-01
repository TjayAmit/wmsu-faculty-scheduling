<?php

namespace App\DTOs;

use App\Enums\CurriculumSemesterType;
use Illuminate\Http\Request;

class CurriculumData
{
    public function __construct(
        public readonly int $program_id,
        public readonly int $subject_id,
        public readonly int $year_level = 1,
        public readonly CurriculumSemesterType $semester_type = CurriculumSemesterType::FIRST,
        public readonly bool $is_required = true,
        public readonly ?array $prerequisite_subjects = null,
        public readonly ?float $units_override = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            program_id: $request->validated('program_id'),
            subject_id: $request->validated('subject_id'),
            year_level: $request->validated('year_level', 1),
            semester_type: CurriculumSemesterType::from($request->validated('semester_type', CurriculumSemesterType::FIRST->value)),
            is_required: $request->validated('is_required', true),
            prerequisite_subjects: $request->validated('prerequisite_subjects'),
            units_override: $request->validated('units_override'),
        );
    }

    public static function fromModel(Curriculum $curriculum): self
    {
        return new self(
            program_id: $curriculum->program_id,
            subject_id: $curriculum->subject_id,
            year_level: $curriculum->year_level,
            semester_type: CurriculumSemesterType::from($curriculum->semester_type),
            is_required: $curriculum->is_required,
            prerequisite_subjects: $curriculum->prerequisite_subjects,
            units_override: $curriculum->units_override,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'program_id' => $this->program_id,
            'subject_id' => $this->subject_id,
            'year_level' => $this->year_level,
            'semester_type' => $this->semester_type->value,
            'is_required' => $this->is_required,
            'prerequisite_subjects' => $this->prerequisite_subjects,
            'units_override' => $this->units_override,
        ], fn ($value) => $value !== null);
    }
}
