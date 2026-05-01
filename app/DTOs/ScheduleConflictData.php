<?php

namespace App\DTOs;

use App\Enums\ConflictType;
use App\Enums\ConflictSeverity;
use App\Enums\ConflictStatus;
use App\Enums\DayOfWeek;
use Illuminate\Http\Request;

class ScheduleConflictData
{
    public function __construct(
        public readonly ConflictType $conflict_type,
        public readonly ?int $primary_schedule_id = null,
        public readonly ?int $secondary_schedule_id = null,
        public readonly ?int $teacher_id = null,
        public readonly ?int $classroom_id = null,
        public readonly ?int $time_slot_id = null,
        public readonly ?DayOfWeek $day_of_week = null,
        public readonly int $semester_id,
        public readonly ConflictSeverity $severity = ConflictSeverity::MEDIUM,
        public readonly ConflictStatus $status = ConflictStatus::PENDING,
        public readonly ?int $resolved_by = null,
        public readonly ?string $resolution_notes = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            conflict_type: ConflictType::from($request->validated('conflict_type', ConflictType::TEACHER_OVERLAP->value)),
            primary_schedule_id: $request->validated('primary_schedule_id'),
            secondary_schedule_id: $request->validated('secondary_schedule_id'),
            teacher_id: $request->validated('teacher_id'),
            classroom_id: $request->validated('classroom_id'),
            time_slot_id: $request->validated('time_slot_id'),
            day_of_week: $request->validated('day_of_week') ? DayOfWeek::from($request->validated('day_of_week')) : null,
            semester_id: $request->validated('semester_id'),
            severity: ConflictSeverity::from($request->validated('severity', ConflictSeverity::MEDIUM->value)),
            status: ConflictStatus::from($request->validated('status', ConflictStatus::PENDING->value)),
            resolved_by: $request->validated('resolved_by'),
            resolution_notes: $request->validated('resolution_notes'),
        );
    }

    public static function fromModel(ScheduleConflict $scheduleConflict): self
    {
        return new self(
            conflict_type: ConflictType::from($scheduleConflict->conflict_type),
            primary_schedule_id: $scheduleConflict->primary_schedule_id,
            secondary_schedule_id: $scheduleConflict->secondary_schedule_id,
            teacher_id: $scheduleConflict->teacher_id,
            classroom_id: $scheduleConflict->classroom_id,
            time_slot_id: $scheduleConflict->time_slot_id,
            day_of_week: $scheduleConflict->day_of_week ? DayOfWeek::from($scheduleConflict->day_of_week) : null,
            semester_id: $scheduleConflict->semester_id,
            severity: ConflictSeverity::from($scheduleConflict->severity),
            status: ConflictStatus::from($scheduleConflict->status),
            resolved_by: $scheduleConflict->resolved_by,
            resolution_notes: $scheduleConflict->resolution_notes,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'conflict_type' => $this->conflict_type->value,
            'primary_schedule_id' => $this->primary_schedule_id,
            'secondary_schedule_id' => $this->secondary_schedule_id,
            'teacher_id' => $this->teacher_id,
            'classroom_id' => $this->classroom_id,
            'time_slot_id' => $this->time_slot_id,
            'day_of_week' => $this->day_of_week?->value,
            'semester_id' => $this->semester_id,
            'severity' => $this->severity->value,
            'status' => $this->status->value,
            'resolved_by' => $this->resolved_by,
            'resolution_notes' => $this->resolution_notes,
        ], fn ($value) => $value !== null);
    }
}
