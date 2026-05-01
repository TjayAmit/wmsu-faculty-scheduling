<?php

namespace App\Http\Requests;

use App\Enums\DraftScheduleStatus;
use Illuminate\Foundation\Http\FormRequest;

class DraftScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_id' => 'required|exists:teachers,id',
            'schedule_id' => 'required|exists:schedules,id',
            'status' => 'sometimes|in:' . implode(',', DraftScheduleStatus::values()),
            'notes' => 'nullable|string|max:1000',
            'reviewed_by' => 'nullable|exists:users,id',
            'reviewed_at' => 'nullable|date',
            'review_comments' => 'nullable|string|max:1000',
            'submitted_at' => 'nullable|date',
            'teacher_assignment_id' => 'nullable|exists:teacher_assignments,id',
        ];
    }
}
