<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sectionId = $this->route('section')?->id;

        return [
            'section_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('sections', 'section_code')->ignore($sectionId),
            ],
            'program_id' => 'required|exists:programs,id',
            'semester_id' => 'required|exists:semesters,id',
            'year_level' => 'required|integer|min:1|max:5',
            'max_students' => 'required|integer|min:1|max:200',
            'current_students' => 'required|integer|min:0|max:max_students',
            'adviser_id' => 'nullable|exists:teachers,id',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'section_code.required' => 'Section code is required.',
            'section_code.unique' => 'This section code is already taken.',
            'section_code.max' => 'Section code may not exceed 20 characters.',
            'program_id.exists' => 'The selected program does not exist.',
            'semester_id.exists' => 'The selected semester does not exist.',
            'year_level.min' => 'Year level must be at least 1.',
            'year_level.max' => 'Year level may not exceed 5.',
            'max_students.min' => 'Maximum students must be at least 1.',
            'max_students.max' => 'Maximum students may not exceed 200.',
            'current_students.min' => 'Current students cannot be negative.',
            'current_students.max' => 'Current students cannot exceed maximum students.',
            'adviser_id.exists' => 'The selected adviser does not exist.',
        ];
    }
}
