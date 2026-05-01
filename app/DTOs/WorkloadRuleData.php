<?php

namespace App\DTOs;

use App\Enums\EmploymentType;
use Illuminate\Http\Request;

class WorkloadRuleData
{
    public function __construct(
        public readonly EmploymentType $employment_type,
        public readonly float $max_teaching_hours = 24.0,
        public readonly float $max_units = 24.0,
        public readonly ?float $min_units = null,
        public readonly ?float $max_preparation_hours = null,
        public readonly ?float $overtime_rate = null,
        public readonly ?string $description = null,
        public readonly bool $is_active = true,
        public readonly string $effective_date,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            employment_type: EmploymentType::from($request->validated('employment_type', EmploymentType::FULL_TIME->value)),
            max_teaching_hours: $request->validated('max_teaching_hours', 24.0),
            max_units: $request->validated('max_units', 24.0),
            min_units: $request->validated('min_units'),
            max_preparation_hours: $request->validated('max_preparation_hours'),
            overtime_rate: $request->validated('overtime_rate'),
            description: $request->validated('description'),
            is_active: $request->validated('is_active', true),
            effective_date: $request->validated('effective_date'),
        );
    }

    public static function fromModel(WorkloadRule $workloadRule): self
    {
        return new self(
            employment_type: EmploymentType::from($workloadRule->employment_type),
            max_teaching_hours: $workloadRule->max_teaching_hours,
            max_units: $workloadRule->max_units,
            min_units: $workloadRule->min_units,
            max_preparation_hours: $workloadRule->max_preparation_hours,
            overtime_rate: $workloadRule->overtime_rate,
            description: $workloadRule->description,
            is_active: $workloadRule->is_active,
            effective_date: $workloadRule->effective_date,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'employment_type' => $this->employment_type->value,
            'max_teaching_hours' => $this->max_teaching_hours,
            'max_units' => $this->max_units,
            'min_units' => $this->min_units,
            'max_preparation_hours' => $this->max_preparation_hours,
            'overtime_rate' => $this->overtime_rate,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'effective_date' => $this->effective_date,
        ], fn ($value) => $value !== null);
    }
}
