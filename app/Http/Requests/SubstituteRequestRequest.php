<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubstituteRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $substituteRequestId = $this->route('substitute_request')?->id;

        return [
            'requesting_teacher_id' => 'required|exists:teachers,id',
            'substitute_teacher_id' => 'nullable|exists:teachers,id|different:requesting_teacher_id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'date' => 'required|date|after_or_equal:today',
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
            'requesting_teacher_id.exists' => 'The selected requesting teacher does not exist.',
            'substitute_teacher_id.exists' => 'The selected substitute teacher does not exist.',
            'substitute_teacher_id.different' => 'The substitute teacher must be different from the requesting teacher.',
            'schedule_id.exists' => 'The selected schedule does not exist.',
            'date.after_or_equal' => 'The date must be today or in the future.',
            'status.in' => 'Status must be one of: pending, approved, rejected, cancelled.',
        ];
    }
}
