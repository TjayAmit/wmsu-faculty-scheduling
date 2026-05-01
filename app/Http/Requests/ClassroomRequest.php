<?php

namespace App\Http\Requests;

use App\Enums\RoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $classroomId = $this->route('classroom')?->id;

        return [
            'building' => 'required|string|max:100',
            'room_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('classrooms', 'room_number')
                    ->where('building', $this->building)
                    ->ignore($classroomId),
            ],
            'room_name' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:500',
            'room_type' => ['required', 'string', Rule::in(RoomType::values())],
            'equipment' => 'nullable|array',
            'equipment.*' => 'string|max:100',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'room_number.unique' => 'This room number already exists in the specified building.',
        ];
    }
}
