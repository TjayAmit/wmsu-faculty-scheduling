<?php

namespace App\Http\Requests;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update teachers');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $teacher = $this->route('teacher');

        return Teacher::getValidationRules([
            'email' => [
                'required',
                'email',
                Rule::unique('teachers', 'email')->ignore($teacher->id),
                'max:255',
            ],
            'employee_id' => [
                'required',
                'string',
                'max:50',
                Rule::unique('teachers', 'employee_id')->ignore($teacher->id),
            ],
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('teachers', 'user_id')->ignore($teacher->id),
            ],
        ]);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'employee_id.unique' => 'This employee ID is already registered.',
            'employment_type.enum' => 'Please select a valid employment type.',
        ];
    }
}
