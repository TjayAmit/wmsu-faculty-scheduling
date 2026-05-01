<?php

namespace App\DTOs;

use App\Models\TeacherAssignment;
use Illuminate\Http\Request;

readonly class TeacherAssignmentData
{
    public function __construct(
        public ?int $teacher_id = null,
        public ?int $schedule_id = null,
        public ?string $assigned_at = null,
        public ?int $assigned_by = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacher_id: $request->input('teacher_id'),
            schedule_id: $request->input('schedule_id'),
            assigned_at: $request->input('assigned_at'),
            assigned_by: $request->input('assigned_by'),
            is_active: $request->input('is_active', true),
        );
    }

    public static function fromModel(TeacherAssignment $teacherAssignment): self
    {
        return new self(
            teacher_id: $teacherAssignment->teacher_id,
            schedule_id: $teacherAssignment->schedule_id,
            assigned_at: $teacherAssignment->assigned_at?->toDateTimeString(),
            assigned_by: $teacherAssignment->assigned_by,
            is_active: $teacherAssignment->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
