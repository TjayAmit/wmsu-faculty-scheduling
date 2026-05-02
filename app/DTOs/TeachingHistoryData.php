<?php

namespace App\DTOs;

use App\Models\TeachingHistory;
use Illuminate\Http\Request;

class TeachingHistoryData
{
    public function __construct(
        public readonly int $teacher_id,
        public readonly int $semester_id,
        public readonly int $subject_id,
        public readonly ?int $schedule_id = null,
        public readonly float $hours_assigned = 0,
        public readonly float $hours_completed = 0,
        public readonly string $status = 'completed',
        public readonly ?string $notes = null,
        public readonly ?string $archived_at = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacher_id: $request->validated('teacher_id'),
            semester_id: $request->validated('semester_id'),
            subject_id: $request->validated('subject_id'),
            schedule_id: $request->validated('schedule_id'),
            hours_assigned: $request->validated('hours_assigned', 0),
            hours_completed: $request->validated('hours_completed', 0),
            status: $request->validated('status', 'completed'),
            notes: $request->validated('notes'),
            archived_at: $request->validated('archived_at'),
        );
    }

    public static function fromModel(TeachingHistory $teachingHistory): self
    {
        return new self(
            teacher_id: $teachingHistory->teacher_id,
            semester_id: $teachingHistory->semester_id,
            subject_id: $teachingHistory->subject_id,
            schedule_id: $teachingHistory->schedule_id,
            hours_assigned: $teachingHistory->hours_assigned,
            hours_completed: $teachingHistory->hours_completed,
            status: $teachingHistory->status,
            notes: $teachingHistory->notes,
            archived_at: $teachingHistory->archived_at?->format('Y-m-d H:i:s'),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'teacher_id' => $this->teacher_id,
            'semester_id' => $this->semester_id,
            'subject_id' => $this->subject_id,
            'schedule_id' => $this->schedule_id,
            'hours_assigned' => $this->hours_assigned,
            'hours_completed' => $this->hours_completed,
            'status' => $this->status,
            'notes' => $this->notes,
            'archived_at' => $this->archived_at,
        ], fn ($value) => $value !== null);
    }
}
