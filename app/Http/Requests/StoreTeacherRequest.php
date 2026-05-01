<?php

namespace App\Http\Requests;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create teachers');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return Teacher::getValidationRules();
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
