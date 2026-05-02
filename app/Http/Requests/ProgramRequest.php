<?php

namespace App\Http\Requests;

use App\Enums\DegreeLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programId = $this->route('program')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('programs', 'code')->ignore($programId),
            ],
            'name' => 'required|string|max:255',
            'degree_level' => ['required', 'string', Rule::in(DegreeLevel::values())],
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable|string|max:1000',
            'duration_years' => 'required|numeric|min:1|max:10',
            'total_units' => 'required|numeric|min:1|max:500',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'This program code already exists.',
            'department_id.exists' => 'The selected department does not exist.',
            'degree_level.in' => 'Invalid degree level selected.',
        ];
    }
}
