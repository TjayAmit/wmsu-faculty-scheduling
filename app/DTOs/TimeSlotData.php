<?php

namespace App\DTOs;

use App\Models\TimeSlot;
use Illuminate\Http\Request;

readonly class TimeSlotData
{
    public function __construct(
        public string $name,
        public ?string $start_time = null,
        public ?string $end_time = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name'),
            start_time: $request->input('start_time'),
            end_time: $request->input('end_time'),
            is_active: $request->input('is_active', true),
        );
    }

    public static function fromModel(TimeSlot $timeSlot): self
    {
        return new self(
            name: $timeSlot->name,
            start_time: $timeSlot->start_time?->toDateTimeString(),
            end_time: $timeSlot->end_time?->toDateTimeString(),
            is_active: $timeSlot->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
