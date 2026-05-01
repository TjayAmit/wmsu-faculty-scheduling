<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class SubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $subjectId = $this->route('subject')?->id;

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subjectId)],
            'title' => 'required|string|max:255',
            'units' => 'required|numeric|min:0|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
