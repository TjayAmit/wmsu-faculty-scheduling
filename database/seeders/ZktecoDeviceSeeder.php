<?php

namespace Database\Seeders;

use App\Enums\ZktecoDeviceStatus;
use App\Models\Classroom;
use App\Models\ZktecoDevice;
use Illuminate\Database\Seeder;

class ZktecoDeviceSeeder extends Seeder
{
    public function run(): void
    {
        $devices = [
            [
                'building' => 'Education Building',
                'room_number' => '101',
                'device_name' => 'COEd ED-101 Biometric Scanner',
                'ip_address' => '192.168.10.101',
                'port' => 4370,
                'comm_key' => '0',
                'serial_number' => 'ZKT-COED-101',
                'model_name' => 'iClock 880',
                'connection_type' => 'tcp',
                'status' => ZktecoDeviceStatus::ONLINE->value,
                'notes' => 'Wall-mounted biometric terminal by Room 101 doorway for faculty attendance.',
            ],
            [
                'building' => 'Education Building',
                'room_number' => '102',
                'device_name' => 'COEd ED-102 Biometric Scanner',
                'ip_address' => '192.168.10.102',
                'port' => 4370,
                'comm_key' => '0',
                'serial_number' => 'ZKT-COED-102',
                'model_name' => 'iClock 880',
                'connection_type' => 'tcp',
                'status' => ZktecoDeviceStatus::ONLINE->value,
                'notes' => 'Wall-mounted biometric terminal by Room 102 doorway.',
            ],
            [
                'building' => 'Education Building',
                'room_number' => '201',
                'device_name' => 'Micro-Teaching Lab Terminal',
                'ip_address' => '192.168.10.201',
                'port' => 4370,
                'comm_key' => '0',
                'serial_number' => 'ZKT-COED-201',
                'model_name' => 'uFace 800 (Face & Fingerprint)',
                'connection_type' => 'tcp',
                'status' => ZktecoDeviceStatus::ONLINE->value,
                'notes' => 'Facial recognition & biometric scanner for Micro-Teaching lab.',
            ],
            [
                'building' => 'Education Building',
                'room_number' => '203',
                'device_name' => 'EdTech Multimedia Lab Terminal',
                'ip_address' => '192.168.10.203',
                'port' => 4370,
                'comm_key' => '0',
                'serial_number' => 'ZKT-COED-203',
                'model_name' => 'MB2000',
                'connection_type' => 'tcp',
                'status' => ZktecoDeviceStatus::ONLINE->value,
                'notes' => 'Biometric scanner for EdTech computer laboratory.',
            ],
            [
                'building' => 'Education Building',
                'room_number' => '301',
                'device_name' => 'COEd Audio-Visual Hall Terminal',
                'ip_address' => '192.168.10.301',
                'port' => 4370,
                'comm_key' => '0',
                'serial_number' => 'ZKT-COED-301',
                'model_name' => 'SilkBio-101TC',
                'connection_type' => 'tcp',
                'status' => ZktecoDeviceStatus::ONLINE->value,
                'notes' => 'Entrance terminal for COEd AV Hall.',
            ],
        ];

        $count = 0;
        foreach ($devices as $d) {
            $classroom = Classroom::where('building', $d['building'])
                ->where('room_number', $d['room_number'])
                ->first();

            if (! $classroom) {
                continue;
            }

            ZktecoDevice::updateOrCreate(
                ['classroom_id' => $classroom->id],
                [
                    'classroom_id' => $classroom->id,
                    'device_name' => $d['device_name'],
                    'ip_address' => $d['ip_address'],
                    'port' => $d['port'],
                    'comm_key' => $d['comm_key'],
                    'serial_number' => $d['serial_number'],
                    'model_name' => $d['model_name'],
                    'connection_type' => $d['connection_type'],
                    'status' => $d['status'],
                    'last_sync_at' => now()->subMinutes(rand(5, 30)),
                    'last_heartbeat_at' => now()->subMinutes(rand(1, 5)),
                    'is_active' => true,
                    'notes' => $d['notes'],
                ]
            );
            $count++;
        }

        $this->command->info("ZKTeco devices seeded: {$count} biometric terminals linked to Education Building classrooms.");
    }
}
