<?php

namespace App\DTOs;

use App\Models\Schedule;
use Illuminate\Http\Request;

readonly class ScheduleData
{
    public function __construct(
        public ?int $subject_id = null,
        public ?int $semester_id = null,
        public ?array $time_slots = null,
        public ?string $room = null,
        public ?string $section = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            subject_id: $request->input('subject_id'),
            semester_id: $request->input('semester_id'),
            time_slots: $request->input('time_slots'),
            room: $request->input('room'),
            section: $request->input('section'),
            is_active: $request->input('is_active', true),
        );
    }

    public static function fromModel(Schedule $schedule): self
    {
        return new self(
            subject_id: $schedule->subject_id,
            semester_id: $schedule->semester_id,
            time_slots: $schedule->time_slots,
            room: $schedule->room,
            section: $schedule->section,
            is_active: $schedule->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }

    public function hasTimeSlot(string $day, int $timeSlotId): bool
    {
        if (empty($this->time_slots)) {
            return false;
        }

        foreach ($this->time_slots as $slot) {
            if ($slot['day'] === $day && (int) $slot['time_slot_id'] === $timeSlotId) {
                return true;
            }
        }

        return false;
    }

    public function getTimeSlotCount(): int
    {
        return is_array($this->time_slots) ? count($this->time_slots) : 0;
    }

    public function getUniqueDays(): array
    {
        if (empty($this->time_slots)) {
            return [];
        }

        return collect($this->time_slots)
            ->pluck('day')
            ->unique()
            ->values()
            ->toArray();
    }
}
