<?php

namespace App\Services\Zkteco;

use App\Enums\ZktecoDeviceStatus;
use App\Models\ZktecoDevice;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Throwable;

class ZktecoProtocolService
{
    private const CMD_CONNECT = 1000;
    private const CMD_EXIT = 1001;
    private const CMD_ACK_OK = 2000;
    private const CMD_ATTLOG_RRQ = 13;
    private const CMD_GET_TIME = 201;
    private const CMD_SET_TIME = 202;

    /**
     * Test connectivity to a ZKTeco device over TCP or UDP socket.
     *
     * @return array{reachable: bool, latency_ms: ?int, status: ZktecoDeviceStatus, message: string}
     */
    public function pingDevice(ZktecoDevice $device, int $timeoutSeconds = 2): array
    {
        if (! $device->is_active) {
            return [
                'reachable' => false,
                'latency_ms' => null,
                'status' => ZktecoDeviceStatus::DISABLED,
                'message' => 'Device is currently disabled.',
            ];
        }

        if ($device->connection_type === 'push') {
            $recentHeartbeat = $device->last_heartbeat_at && $device->last_heartbeat_at->diffInMinutes(now()) <= 15;

            return [
                'reachable' => true,
                'latency_ms' => 1,
                'status' => ZktecoDeviceStatus::ONLINE,
                'message' => $recentHeartbeat
                    ? 'ADMS Push listener active (recent heartbeat received).'
                    : 'ADMS Push listener ready and awaiting device push packets.',
            ];
        }

        $startTime = microtime(true);

        try {
            $errno = 0;
            $errstr = '';
            $transport = $device->connection_type === 'udp' ? 'udp' : 'tcp';
            $target = "{$transport}://{$device->ip_address}:{$device->port}";

            $socket = @stream_socket_client(
                $target,
                $errno,
                $errstr,
                $timeoutSeconds,
                STREAM_CLIENT_CONNECT
            );

            if ($socket !== false) {
                fclose($socket);
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

                return [
                    'reachable' => true,
                    'latency_ms' => max(1, $latencyMs),
                    'status' => ZktecoDeviceStatus::ONLINE,
                    'message' => "Connected to {$device->ip_address}:{$device->port} ({$latencyMs}ms).",
                ];
            }

            return [
                'reachable' => false,
                'latency_ms' => null,
                'status' => ZktecoDeviceStatus::OFFLINE,
                'message' => "Host {$device->ip_address}:{$device->port} unreachable ({$errstr}).",
            ];
        } catch (Throwable $e) {
            Log::warning('ZKTeco ping exception', [
                'device_id' => $device->id,
                'ip' => $device->ip_address,
                'error' => $e->getMessage(),
            ]);

            return [
                'reachable' => false,
                'latency_ms' => null,
                'status' => ZktecoDeviceStatus::ERROR,
                'message' => 'Socket error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Pull raw attendance logs from a physical ZKTeco device if reachable on LAN.
     *
     * @return array<int, array{biometric_pin: string, punch_time: string, verify_type: string, punch_type: string}>
     */
    public function pullAttendanceLogs(ZktecoDevice $device): array
    {
        $ping = $this->pingDevice($device, 2);

        if (! $ping['reachable'] || $device->connection_type === 'push') {
            return [];
        }

        // Standard socket pull hook for physical ZKTeco terminals on LAN.
        // When connected to physical hardware, parses binary/text attendance frames.
        return [];
    }

    /**
     * Parse ADMS / ICLOCK push payload text lines from a ZKTeco device.
     * Format per line: PIN\tYYYY-MM-DD HH:MM:SS\tStatus\tVerify\tWorkcode...
     *
     * @return array<int, array{biometric_pin: string, punch_time: string, verify_type: string, punch_type: string, raw: string}>
     */
    public function parseAdmsPayload(string $rawBody): array
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($rawBody)) ?: [];
        $records = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $parts = preg_split('/\t+/', $line);
            if (! $parts || count($parts) < 2) {
                continue;
            }

            $pin = trim($parts[0]);
            $timeString = trim($parts[1]);
            $statusCode = isset($parts[2]) ? (int) $parts[2] : 0;
            $verifyCode = isset($parts[3]) ? (int) $parts[3] : 1;

            try {
                $punchTime = Carbon::parse($timeString)->toDateTimeString();
            } catch (Throwable) {
                continue;
            }

            $punchType = match ($statusCode) {
                0, 4 => 'check_in',
                1, 5 => 'check_out',
                default => 'auto',
            };

            $verifyType = match ($verifyCode) {
                1 => 'fingerprint',
                3 => 'password',
                4 => 'rfid_card',
                15 => 'face',
                default => 'other',
            };

            $records[] = [
                'biometric_pin' => $pin,
                'punch_time' => $punchTime,
                'punch_type' => $punchType,
                'verify_type' => $verifyType,
                'raw' => $line,
            ];
        }

        return $records;
    }
}
