<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $leaveRequestId = $this->route('leave_request')?->id;

        return [
            'teacher_id' => 'required|exists:teachers,id',
            'leave_type' => ['required', 'string', Rule::in(['sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity', 'other'])],
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'status' => ['nullable', 'string', Rule::in(['pending', 'approved', 'rejected', 'cancelled'])],
            'approved_by' => 'nullable|exists:users,id',
            'approved_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'teacher_id.exists' => 'The selected teacher does not exist.',
            'leave_type.in' => 'Leave type must be one of: sick, vacation, personal, emergency, maternity, paternity, other.',
            'start_date.after_or_equal' => 'Start date must be today or in the future.',
            'end_date.after_or_equal' => 'End date must be on or after the start date.',
            'status.in' => 'Status must be one of: pending, approved, rejected, cancelled.',
        ];
    }
}
