<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'required|exists:semesters,id',
            'time_slots' => 'required|array|min:1|max:3',
            'time_slots.*.day' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'time_slots.*.time_slot_id' => 'required|exists:time_slots,id',
            'room' => 'required|string|max:50',
            'section' => 'required|string|max:20',
            'is_active' => 'boolean',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $timeSlots = $this->input('time_slots', []);
            
            // Check for duplicate (day, time_slot_id) combinations
            $combinations = [];
            foreach ($timeSlots as $index => $slot) {
                $key = $slot['day'] . '-' . $slot['time_slot_id'];
                if (isset($combinations[$key])) {
                    $validator->errors()->add("time_slots.{$index}", "Duplicate time slot: {$slot['day']} with time slot ID {$slot['time_slot_id']} already exists.");
                }
                $combinations[$key] = true;
            }
        });
    }
}
