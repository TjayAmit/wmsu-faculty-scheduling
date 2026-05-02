<?php

namespace App\DTOs;

use App\Models\SubstituteRequest;
use Illuminate\Http\Request;

class SubstituteRequestData
{
    public function __construct(
        public readonly int $requesting_teacher_id,
        public readonly ?int $substitute_teacher_id = null,
        public readonly ?int $schedule_id = null,
        public readonly string $date,
        public readonly string $reason,
        public readonly string $status = 'pending',
        public readonly ?int $approved_by = null,
        public readonly ?string $approved_at = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            requesting_teacher_id: $request->validated('requesting_teacher_id'),
            substitute_teacher_id: $request->validated('substitute_teacher_id'),
            schedule_id: $request->validated('schedule_id'),
            date: $request->validated('date'),
            reason: $request->validated('reason'),
            status: $request->validated('status', 'pending'),
            approved_by: $request->validated('approved_by'),
            approved_at: $request->validated('approved_at'),
            notes: $request->validated('notes'),
        );
    }

    public static function fromModel(SubstituteRequest $substituteRequest): self
    {
        return new self(
            requesting_teacher_id: $substituteRequest->requesting_teacher_id,
            substitute_teacher_id: $substituteRequest->substitute_teacher_id,
            schedule_id: $substituteRequest->schedule_id,
            date: $substituteRequest->date->format('Y-m-d'),
            reason: $substituteRequest->reason,
            status: $substituteRequest->status,
            approved_by: $substituteRequest->approved_by,
            approved_at: $substituteRequest->approved_at?->format('Y-m-d H:i:s'),
            notes: $substituteRequest->notes,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'requesting_teacher_id' => $this->requesting_teacher_id,
            'substitute_teacher_id' => $this->substitute_teacher_id,
            'schedule_id' => $this->schedule_id,
            'date' => $this->date,
            'reason' => $this->reason,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at,
            'notes' => $this->notes,
        ], fn ($value) => $value !== null);
    }
}
