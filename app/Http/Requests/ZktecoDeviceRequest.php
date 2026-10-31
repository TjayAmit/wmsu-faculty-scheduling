<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ZktecoDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $deviceId = $this->route('zktecoDevice')?->id ?? $this->route('device')?->id ?? $this->route('id');

        return [
            'classroom_id' => [
                'required',
                'exists:classrooms,id',
                Rule::unique('zkteco_devices', 'classroom_id')
                    ->ignore($deviceId)
                    ->whereNull('deleted_at'),
            ],
            'device_name' => ['required', 'string', 'max:100'],
            'ip_address' => ['required', 'string', 'max:45'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'comm_key' => ['nullable', 'string', 'max:50'],
            'serial_number' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('zkteco_devices', 'serial_number')
                    ->ignore($deviceId)
                    ->whereNull('deleted_at'),
            ],
            'model_name' => ['nullable', 'string', 'max:100'],
            'connection_type' => ['required', Rule::in(['tcp', 'udp', 'push'])],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'classroom_id.unique' => 'This classroom already has a ZKTeco device assigned. Each device can only apply to one classroom.',
            'classroom_id.required' => 'Please select a classroom to bind this biometric device to.',
            'serial_number.unique' => 'A ZKTeco device with this serial number is already registered.',
        ];
    }
}
