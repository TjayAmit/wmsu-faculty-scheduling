<?php

namespace App\Console\Commands;

use App\Models\ZktecoDevice;
use App\Services\Zkteco\ZktecoDeviceService;
use Illuminate\Console\Command;

class ZktecoSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zkteco:sync {--device= : Optional ZKTeco device ID to sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize attendance logs from active ZKTeco classroom biometric devices';

    /**
     * Execute the console command.
     */
    public function handle(ZktecoDeviceService $deviceService): int
    {
        $query = ZktecoDevice::active()->with('classroom');

        if ($this->option('device')) {
            $query->where('id', $this->option('device'));
        }

        $devices = $query->get();

        if ($devices->isEmpty()) {
            $this->info('No active ZKTeco devices found to synchronize.');

            return self::SUCCESS;
        }

        foreach ($devices as $device) {
            $roomName = $device->classroom ? "{$device->classroom->building} {$device->classroom->room_number}" : 'Unassigned';
            $this->line("Syncing {$device->device_name} [{$device->ip_address}:{$device->port}] ({$roomName})...");

            $result = $deviceService->syncDeviceLogs($device);
            $this->info(" -> {$result['message']}");
        }

        return self::SUCCESS;
    }
}
