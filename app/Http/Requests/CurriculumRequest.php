<?php

namespace App\Http\Requests;

use App\Enums\CurriculumSemesterType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CurriculumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $curriculumId = $this->route('curriculum')?->id;

        return [
            'program_id' => 'required|integer|exists:programs,id',
            'subject_id' => 'required|integer|exists:subjects,id',
            'year_level' => 'required|integer|min:1|max:5',
            'semester_type' => ['required', 'string', Rule::in(CurriculumSemesterType::values())],
            'is_required' => 'boolean',
            'prerequisite_subjects' => 'nullable|array',
            'prerequisite_subjects.*' => 'integer|exists:subjects,id',
            'units_override' => 'nullable|numeric|min:0|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'program_id.exists' => 'The selected program does not exist.',
            'subject_id.exists' => 'The selected subject does not exist.',
            'prerequisite_subjects.*.exists' => 'One or more prerequisites do not exist.',
        ];
    }
}
