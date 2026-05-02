<?php

namespace App\DTOs;

use App\Models\RoomSchedule;
use Illuminate\Http\Request;

class RoomScheduleData
{
    public function __construct(
        public readonly int $classroom_id,
        public readonly ?int $schedule_id = null,
        public readonly string $date,
        public readonly string $start_time,
        public readonly string $end_time,
        public readonly ?string $notes = null,
        public readonly bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            classroom_id: $request->validated('classroom_id'),
            schedule_id: $request->validated('schedule_id'),
            date: $request->validated('date'),
            start_time: $request->validated('start_time'),
            end_time: $request->validated('end_time'),
            notes: $request->validated('notes'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(RoomSchedule $roomSchedule): self
    {
        return new self(
            classroom_id: $roomSchedule->classroom_id,
            schedule_id: $roomSchedule->schedule_id,
            date: $roomSchedule->date->format('Y-m-d'),
            start_time: $roomSchedule->start_time->format('H:i'),
            end_time: $roomSchedule->end_time->format('H:i'),
            notes: $roomSchedule->notes,
            is_active: $roomSchedule->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'classroom_id' => $this->classroom_id,
            'schedule_id' => $this->schedule_id,
            'date' => $this->date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
        ], fn ($value) => $value !== null);
    }
}
