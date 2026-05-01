<?php

namespace App\DTOs;

use App\Enums\DraftScheduleStatus;
use App\Models\DraftSchedule;
use Illuminate\Http\Request;

readonly class DraftScheduleData
{
    public function __construct(
        public int $teacher_id,
        public int $schedule_id,
        public DraftScheduleStatus|string $status = DraftScheduleStatus::DRAFT,
        public ?string $notes = null,
        public ?int $reviewed_by = null,
        public ?string $reviewed_at = null,
        public ?string $review_comments = null,
        public ?string $submitted_at = null,
        public ?int $teacher_assignment_id = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacher_id: $request->input('teacher_id'),
            schedule_id: $request->input('schedule_id'),
            status: $request->input('status', DraftScheduleStatus::DRAFT->value),
            notes: $request->input('notes'),
            reviewed_by: $request->input('reviewed_by'),
            reviewed_at: $request->input('reviewed_at'),
            review_comments: $request->input('review_comments'),
            submitted_at: $request->input('submitted_at'),
            teacher_assignment_id: $request->input('teacher_assignment_id'),
        );
    }

    public static function fromModel(DraftSchedule $draftSchedule): self
    {
        return new self(
            teacher_id: $draftSchedule->teacher_id,
            schedule_id: $draftSchedule->schedule_id,
            status: $draftSchedule->status,
            notes: $draftSchedule->notes,
            reviewed_by: $draftSchedule->reviewed_by,
            reviewed_at: $draftSchedule->reviewed_at?->toDateTimeString(),
            review_comments: $draftSchedule->review_comments,
            submitted_at: $draftSchedule->submitted_at?->toDateTimeString(),
            teacher_assignment_id: $draftSchedule->teacher_assignment_id,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
