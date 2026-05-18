<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
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
            'email'           => ['required', 'email', 'max:255', Rule::unique('teachers', 'email')->ignore($teacherId)],
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'employee_id'     => ['required', 'string', 'max:50', Rule::unique('teachers', 'employee_id')->ignore($teacherId)],
            'department'      => 'nullable|string|max:255',
            'rank'            => 'nullable|string|max:100',
            'employment_type' => 'required|string|in:full_time,part_time,casual',
            'date_hired'      => 'nullable|date',
            'phone'           => 'nullable|string|max:20',
            'address'         => 'nullable|string',
            'is_active'       => 'boolean',
        ];
    }
}
