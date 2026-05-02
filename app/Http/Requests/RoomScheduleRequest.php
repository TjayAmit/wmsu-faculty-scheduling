<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roomScheduleId = $this->route('room_schedule')?->id;

        return [
            'classroom_id' => 'required|exists:classrooms,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'classroom_id.exists' => 'The selected classroom does not exist.',
            'schedule_id.exists' => 'The selected schedule does not exist.',
            'date.after_or_equal' => 'The date must be today or in the future.',
            'end_time.after' => 'The end time must be after the start time.',
        ];
    }
}
