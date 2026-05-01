<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class TeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $teacherId = $this->route('teacher')?->id;

        return [
            'user_id' => ['required', 'exists:users,id', Rule::unique('teachers', 'user_id')->ignore($teacherId)],
            'employee_id' => ['required', 'string', 'max:50', Rule::unique('teachers', 'employee_id')->ignore($teacherId)],
            'department' => 'nullable|string|max:255',
            'rank' => 'nullable|string|max:100',
            'employment_type' => 'required|string|in:full_time,part_time,casual',
            'date_hired' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
