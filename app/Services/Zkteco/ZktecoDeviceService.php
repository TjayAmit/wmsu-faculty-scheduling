<?php

namespace App\Services\Zkteco;

use App\Enums\ZktecoDeviceStatus;
use App\Models\ZktecoAttendanceLog;
use App\Models\ZktecoDevice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ZktecoDeviceService
{
    public function __construct(
        protected ZktecoProtocolService $protocolService,
        protected ZktecoAttendanceService $attendanceService
    ) {}

    /**
     * Create a new ZKTeco device bound to a single classroom.
     */
    public function create(array $data): ZktecoDevice
    {
        return DB::transaction(function () use ($data) {
            $device = ZktecoDevice::create([
                'classroom_id' => $data['classroom_id'],
                'device_name' => $data['device_name'],
                'ip_address' => $data['ip_address'],
                'port' => $data['port'] ?? 4370,
                'comm_key' => $data['comm_key'] ?? null,
                'serial_number' => ($data['serial_number'] ?? null) ?: null,
                'model_name' => ($data['model_name'] ?? null) ?: null,
                'connection_type' => $data['connection_type'] ?? 'tcp',
                'status' => ($data['is_active'] ?? true) ? ZktecoDeviceStatus::OFFLINE : ZktecoDeviceStatus::DISABLED,
                'is_active' => $data['is_active'] ?? true,
                'notes' => $data['notes'] ?? null,
            ]);

            if (function_exists('activity')) {
                activity('zkteco_devices')
                    ->performedOn($device)
                    ->causedBy(auth()->user())
                    ->withProperties(['attributes' => $device->toArray()])
                    ->log("Registered ZKTeco device '{$device->device_name}' for classroom ID {$device->classroom_id}");
            }

            return $device;
        });
    }

    /**
     * Update an existing ZKTeco device.
     */
    public function update(ZktecoDevice $device, array $data): ZktecoDevice
    {
        return DB::transaction(function () use ($device, $data) {
            $oldAttributes = $device->toArray();

            $isActive = (bool) ($data['is_active'] ?? $device->is_active);
            $newStatus = ! $isActive
                ? ZktecoDeviceStatus::DISABLED
                : ($device->status === ZktecoDeviceStatus::DISABLED ? ZktecoDeviceStatus::OFFLINE : $device->status);

            $device->update([
                'classroom_id' => $data['classroom_id'],
                'device_name' => $data['device_name'],
                'ip_address' => $data['ip_address'],
                'port' => $data['port'] ?? 4370,
                'comm_key' => $data['comm_key'] ?? null,
                'serial_number' => ($data['serial_number'] ?? null) ?: null,
                'model_name' => ($data['model_name'] ?? null) ?: null,
                'connection_type' => $data['connection_type'] ?? 'tcp',
                'status' => $newStatus,
                'is_active' => $isActive,
                'notes' => $data['notes'] ?? null,
            ]);

            if (function_exists('activity')) {
                activity('zkteco_devices')
                    ->performedOn($device)
                    ->causedBy(auth()->user())
                    ->withProperties(['old' => $oldAttributes, 'attributes' => $device->fresh()->toArray()])
                    ->log("Updated ZKTeco device '{$device->device_name}'");
            }

            return $device->fresh();
        });
    }

    /**
     * Delete a ZKTeco device so its classroom can be reassigned if needed.
     */
    public function delete(ZktecoDevice $device): bool
    {
        return DB::transaction(function () use ($device) {
            $name = $device->device_name;
            $result = (bool) $device->forceDelete();

            if (function_exists('activity')) {
                activity('zkteco_devices')
                    ->causedBy(auth()->user())
                    ->withProperties(['device_name' => $name])
                    ->log("Deleted ZKTeco device '{$name}'");
            }

            return $result;
        });
    }

    /**
     * Test connection to a device and update its status and heartbeat.
     *
     * @return array{reachable: bool, latency_ms: ?int, status: ZktecoDeviceStatus, message: string}
     */
    public function testConnection(ZktecoDevice $device): array
    {
        $result = $this->protocolService->pingDevice($device);

        $device->update([
            'status' => $result['status'],
            'last_heartbeat_at' => $result['reachable'] ? now() : $device->last_heartbeat_at,
        ]);

        return $result;
    }

    /**
     * Synchronize attendance logs from a ZKTeco device and run them through the Room-Subject Matching Engine.
     *
     * @return array{pulled: int, matched: int, mismatched_room: int, message: string}
     */
    public function syncDeviceLogs(ZktecoDevice $device): array
    {
        $ping = $this->testConnection($device);
        $rawRecords = $this->protocolService->pullAttendanceLogs($device);

        $matched = 0;
        $mismatchedRoom = 0;

        foreach ($rawRecords as $record) {
            $log = $this->attendanceService->processPunch(
                device: $device,
                biometricPin: $record['biometric_pin'],
                punchTime: Carbon::parse($record['punch_time']),
                verifyType: $record['verify_type'] ?? 'fingerprint',
                punchType: $record['punch_type'] ?? 'auto',
                rawPayload: $record
            );

            if ($log->match_status->value === 'matched') {
                $matched++;
            } elseif ($log->match_status->value === 'mismatched_room') {
                $mismatchedRoom++;
            }
        }

        $device->update([
            'last_sync_at' => now(),
        ]);

        return [
            'pulled' => count($rawRecords),
            'matched' => $matched,
            'mismatched_room' => $mismatchedRoom,
            'message' => $ping['reachable']
                ? 'Device synchronized successfully ('.count($rawRecords).' new punch records processed).'
                : "Device offline during sync ({$ping['message']}). Timestamp updated.",
        ];
    }

    /**
     * Simulate or record a punch on a specific ZKTeco device (for testing and manual punch verification).
     */
    public function simulatePunch(
        ZktecoDevice $device,
        string $biometricPin,
        ?string $punchTime = null,
        string $verifyType = 'fingerprint',
        string $punchType = 'auto'
    ): ZktecoAttendanceLog {
        $device->update([
            'status' => ZktecoDeviceStatus::ONLINE,
            'last_heartbeat_at' => now(),
            'last_sync_at' => now(),
        ]);

        return $this->attendanceService->processPunch(
            device: $device,
            biometricPin: $biometricPin,
            punchTime: $punchTime ? Carbon::parse($punchTime) : now(),
            verifyType: $verifyType,
            punchType: $punchType,
            rawPayload: [
                'source' => 'terminal_punch',
                'device_id' => $device->id,
                'device_ip' => $device->ip_address,
                'classroom_id' => $device->classroom_id,
                'timestamp' => ($punchTime ? Carbon::parse($punchTime) : now())->toIso8601String(),
            ]
        );
    }
}
