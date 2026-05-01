<?php

namespace App\DTOs;

use App\Enums\DayOfWeek;
use App\Models\Schedule;
use Illuminate\Http\Request;

readonly class ScheduleData
{
    public function __construct(
        public ?int $subject_id = null,
        public ?int $semester_id = null,
        public ?int $time_slot_id = null,
        public DayOfWeek|string|null $day_of_week = null,
        public ?string $room = null,
        public ?string $section = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            subject_id: $request->validated('subject_id'),
            semester_id: $request->validated('semester_id'),
            time_slot_id: $request->validated('time_slot_id'),
            day_of_week: $request->validated('day_of_week'),
            room: $request->validated('room'),
            section: $request->validated('section'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Schedule $schedule): self
    {
        return new self(
            subject_id: $schedule->subject_id,
            semester_id: $schedule->semester_id,
            time_slot_id: $schedule->time_slot_id,
            day_of_week: $schedule->day_of_week,
            room: $schedule->room,
            section: $schedule->section,
            is_active: $schedule->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
