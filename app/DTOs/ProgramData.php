<?php

namespace App\DTOs;

use App\Enums\DegreeLevel;
use Illuminate\Http\Request;

class ProgramData
{
    public function __construct(
        public readonly string $code,
        public readonly string $name,
        public readonly DegreeLevel $degree_level,
        public readonly int $department_id,
        public readonly ?string $description = null,
        public readonly float $duration_years = 4.0,
        public readonly float $total_units = 0.0,
        public readonly bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            code: $request->validated('code'),
            name: $request->validated('name'),
            degree_level: DegreeLevel::from($request->validated('degree_level', DegreeLevel::BACHELOR->value)),
            department_id: $request->validated('department_id'),
            description: $request->validated('description'),
            duration_years: $request->validated('duration_years', 4.0),
            total_units: $request->validated('total_units', 0.0),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Program $program): self
    {
        return new self(
            code: $program->code,
            name: $program->name,
            degree_level: DegreeLevel::from($program->degree_level),
            department_id: $program->department_id,
            description: $program->description,
            duration_years: $program->duration_years,
            total_units: $program->total_units,
            is_active: $program->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'code' => $this->code,
            'name' => $this->name,
            'degree_level' => $this->degree_level->value,
            'department_id' => $this->department_id,
            'description' => $this->description,
            'duration_years' => $this->duration_years,
            'total_units' => $this->total_units,
            'is_active' => $this->is_active,
        ], fn ($value) => $value !== null);
    }
}
