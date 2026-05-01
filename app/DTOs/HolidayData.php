<?php

namespace App\DTOs;

use App\Enums\HolidayType;
use Illuminate\Http\Request;

class HolidayData
{
    public function __construct(
        public readonly string $name,
        public readonly string $date,
        public readonly HolidayType $type = HolidayType::REGULAR,
        public readonly ?string $description = null,
        public readonly bool $affects_schedules = true,
        public readonly ?string $academic_year = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->validated('name'),
            date: $request->validated('date'),
            type: HolidayType::from($request->validated('type', HolidayType::REGULAR->value)),
            description: $request->validated('description'),
            affects_schedules: $request->validated('affects_schedules', true),
            academic_year: $request->validated('academic_year'),
        );
    }

    public static function fromModel(Holiday $holiday): self
    {
        return new self(
            name: $holiday->name,
            date: $holiday->date,
            type: HolidayType::from($holiday->type),
            description: $holiday->description,
            affects_schedules: $holiday->affects_schedules,
            academic_year: $holiday->academic_year,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'date' => $this->date,
            'type' => $this->type->value,
            'description' => $this->description,
            'affects_schedules' => $this->affects_schedules,
            'academic_year' => $this->academic_year,
        ], fn ($value) => $value !== null);
    }
}
