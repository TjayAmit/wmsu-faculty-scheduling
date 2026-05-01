<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_assignment_id' => 'required|exists:teacher_assignments,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'timestamp_in' => 'nullable|date',
            'timestamp_out' => 'nullable|date|after:timestamp_in',
            'notes' => 'nullable|string',
            'recorded_by' => 'nullable|exists:users,id',
        ];
    }
}
