<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeachingHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $teachingHistoryId = $this->route('teaching_history')?->id;

        return [
            'teacher_id' => 'required|exists:teachers,id',
            'semester_id' => 'required|exists:semesters,id',
            'subject_id' => 'required|exists:subjects,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'hours_assigned' => 'required|numeric|min:0|max:999.99',
            'hours_completed' => 'required|numeric|min:0|max:999.99',
            'status' => ['required', 'string', Rule::in(['completed', 'incomplete', 'dropped'])],
            'notes' => 'nullable|string|max:1000',
            'archived_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'teacher_id.exists' => 'The selected teacher does not exist.',
            'semester_id.exists' => 'The selected semester does not exist.',
            'subject_id.exists' => 'The selected subject does not exist.',
            'schedule_id.exists' => 'The selected schedule does not exist.',
            'hours_assigned.max' => 'Hours assigned cannot exceed 999.99.',
            'hours_completed.max' => 'Hours completed cannot exceed 999.99.',
            'status.in' => 'Status must be one of: completed, incomplete, dropped.',
        ];
    }
}
