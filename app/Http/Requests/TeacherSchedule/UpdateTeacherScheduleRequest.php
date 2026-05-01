<?php

namespace App\Http\Requests\TeacherSchedule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('update', $this->teacherSchedule);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'teacher_assignment_id' => ['sometimes', 'required', 'exists:teacher_assignments,id'],
            'draft_schedule_id' => ['sometimes', 'required', 'exists:draft_schedules,id'],
            'subject_id' => ['sometimes', 'required', 'exists:subjects,id'],
            'semester_id' => ['sometimes', 'required', 'exists:semesters,id'],
            'teacher_id' => ['sometimes', 'required', 'exists:teachers,id'],
            'scheduled_date' => ['sometimes', 'required', 'date'],
            'day_of_week' => ['sometimes', 'required', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])],
            'start_time' => ['sometimes', 'required', 'date_format:H:i'],
            'end_time' => ['sometimes', 'required', 'date_format:H:i', 'after:start_time'],
            'room' => ['nullable', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'required', Rule::in(['scheduled', 'cancelled', 'completed', 'postponed'])],
            'attendance_record_id' => ['nullable', 'exists:attendance_records,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_holiday' => ['sometimes', 'boolean'],
            'holiday_name' => ['nullable', 'string', 'max:100', 'required_if:is_holiday,true'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'end_time.after' => 'The end time must be after the start time.',
            'holiday_name.required_if' => 'The holiday name is required when is_holiday is true.',
        ];
    }
}
