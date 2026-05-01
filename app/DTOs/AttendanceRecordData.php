<?php

namespace App\DTOs;

use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;

readonly class AttendanceRecordData
{
    public function __construct(
        public ?int $teacher_assignment_id = null,
        public ?string $date = null,
        public AttendanceStatus|string|null $status = null,
        public ?string $timestamp_in = null,
        public ?string $timestamp_out = null,
        public ?string $notes = null,
        public ?int $recorded_by = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacher_assignment_id: $request->input('teacher_assignment_id'),
            date: $request->input('date'),
            status: $request->input('status'),
            timestamp_in: $request->input('timestamp_in'),
            timestamp_out: $request->input('timestamp_out'),
            notes: $request->input('notes'),
            recorded_by: $request->input('recorded_by'),
        );
    }

    public static function fromModel(AttendanceRecord $attendanceRecord): self
    {
        return new self(
            teacher_assignment_id: $attendanceRecord->teacher_assignment_id,
            date: $attendanceRecord->date?->toDateString(),
            status: $attendanceRecord->status,
            timestamp_in: $attendanceRecord->timestamp_in?->toDateTimeString(),
            timestamp_out: $attendanceRecord->timestamp_out?->toDateTimeString(),
            notes: $attendanceRecord->notes,
            recorded_by: $attendanceRecord->recorded_by,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
