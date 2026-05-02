<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('departments', 'code')->ignore($departmentId),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'head_id' => 'nullable|exists:teachers,id',
            'office_location' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'This department code already exists.',
            'head_id.exists' => 'The selected department head does not exist.',
        ];
    }
}
