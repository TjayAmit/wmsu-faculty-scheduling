<?php

namespace App\Http\Controllers\Api;

use App\Enums\ZktecoDeviceStatus;
use App\Http\Controllers\Controller;
use App\Models\ZktecoDevice;
use App\Services\Zkteco\ZktecoAttendanceService;
use App\Services\Zkteco\ZktecoProtocolService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ZktecoPushController extends Controller
{
    public function __construct(
        protected ZktecoProtocolService $protocolService,
        protected ZktecoAttendanceService $attendanceService
    ) {}

    /**
     * Handle ZKTeco ADMS / ICLOCK push handshake & attendance data stream.
     * Endpoint: /iclock/cdata
     */
    public function handlePush(Request $request): Response
    {
        $serialNumber = $request->query('SN');
        $ipAddress = $request->ip();

        $device = null;
        if ($serialNumber) {
            $device = ZktecoDevice::where('serial_number', $serialNumber)->first();
        }
        if (! $device && $ipAddress) {
            $device = ZktecoDevice::where('ip_address', $ipAddress)->first();
        }

        if (! $device || ! $device->is_active) {
            return response('ERROR: Unregistered or disabled ZKTeco device', 404)
                ->header('Content-Type', 'text/plain');
        }

        // Update device heartbeat and status
        $device->update([
            'status' => ZktecoDeviceStatus::ONLINE,
            'last_heartbeat_at' => now(),
        ]);

        // GET handshake request from ZKTeco terminal
        if ($request->isMethod('GET')) {
            $configResponse = implode("\r\n", [
                "GET OPTION FROM: {$serialNumber}",
                'ATTLOGStamp=None',
                'OPERLOGStamp=9999',
                'ATTPHOTOStamp=None',
                'ErrorDelay=30',
                'Delay=10',
                'TransTimes=00:00;14:05',
                'TransInterval=1',
                'TransFlag=TransData AttLog',
                'TimeZone=8',
                'Realtime=1',
                'Encrypt=None',
            ]);

            return response($configResponse, 200)->header('Content-Type', 'text/plain');
        }

        // POST attendance log push from ZKTeco terminal
        $table = strtoupper((string) $request->query('table', 'ATTLOG'));
        if ($table === 'ATTLOG') {
            $records = $this->protocolService->parseAdmsPayload($request->getContent());

            foreach ($records as $record) {
                $this->attendanceService->processPunch(
                    device: $device,
                    biometricPin: $record['biometric_pin'],
                    punchTime: Carbon::parse($record['punch_time']),
                    verifyType: $record['verify_type'],
                    punchType: $record['punch_type'],
                    rawPayload: $record
                );
            }

            $device->update(['last_sync_at' => now()]);

            return response('OK: '.count($records), 200)->header('Content-Type', 'text/plain');
        }

        return response('OK', 200)->header('Content-Type', 'text/plain');
    }
}
