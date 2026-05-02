<?php

namespace App\DTOs;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestData
{
    public function __construct(
        public readonly int $teacher_id,
        public readonly string $leave_type,
        public readonly string $start_date,
        public readonly string $end_date,
        public readonly string $reason,
        public readonly string $status = 'pending',
        public readonly ?int $approved_by = null,
        public readonly ?string $approved_at = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacher_id: $request->validated('teacher_id'),
            leave_type: $request->validated('leave_type'),
            start_date: $request->validated('start_date'),
            end_date: $request->validated('end_date'),
            reason: $request->validated('reason'),
            status: $request->validated('status', 'pending'),
            approved_by: $request->validated('approved_by'),
            approved_at: $request->validated('approved_at'),
            notes: $request->validated('notes'),
        );
    }

    public static function fromModel(LeaveRequest $leaveRequest): self
    {
        return new self(
            teacher_id: $leaveRequest->teacher_id,
            leave_type: $leaveRequest->leave_type,
            start_date: $leaveRequest->start_date->format('Y-m-d'),
            end_date: $leaveRequest->end_date->format('Y-m-d'),
            reason: $leaveRequest->reason,
            status: $leaveRequest->status,
            approved_by: $leaveRequest->approved_by,
            approved_at: $leaveRequest->approved_at?->format('Y-m-d H:i:s'),
            notes: $leaveRequest->notes,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'teacher_id' => $this->teacher_id,
            'leave_type' => $this->leave_type,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'reason' => $this->reason,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at,
            'notes' => $this->notes,
        ], fn ($value) => $value !== null);
    }
}
