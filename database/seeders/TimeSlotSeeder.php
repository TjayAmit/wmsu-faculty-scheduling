<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    public function run(): void
    {
        $timeSlots = [
            // ==========================================
            // 1-HOUR LECTURE PERIODS (MWF & Daily)
            // ==========================================
            [
                'name' => 'Period 1 (07:30 - 08:30)',
                'start_time' => '07:30',
                'end_time' => '08:30',
                'is_active' => true,
            ],
            [
                'name' => 'Period 2 (08:30 - 09:30)',
                'start_time' => '08:30',
                'end_time' => '09:30',
                'is_active' => true,
            ],
            [
                'name' => 'Period 3 (09:30 - 10:30)',
                'start_time' => '09:30',
                'end_time' => '10:30',
                'is_active' => true,
            ],
            [
                'name' => 'Period 4 (10:30 - 11:30)',
                'start_time' => '10:30',
                'end_time' => '11:30',
                'is_active' => true,
            ],
            [
                'name' => 'Period 5 (11:30 - 12:30)',
                'start_time' => '11:30',
                'end_time' => '12:30',
                'is_active' => true,
            ],
            [
                'name' => 'Period 6 (13:00 - 14:00)',
                'start_time' => '13:00',
                'end_time' => '14:00',
                'is_active' => true,
            ],
            [
                'name' => 'Period 7 (14:00 - 15:00)',
                'start_time' => '14:00',
                'end_time' => '15:00',
                'is_active' => true,
            ],
            [
                'name' => 'Period 8 (15:00 - 16:00)',
                'start_time' => '15:00',
                'end_time' => '16:00',
                'is_active' => true,
            ],
            [
                'name' => 'Period 9 (16:00 - 17:00)',
                'start_time' => '16:00',
                'end_time' => '17:00',
                'is_active' => true,
            ],
            [
                'name' => 'Period 10 (17:30 - 18:30)',
                'start_time' => '17:30',
                'end_time' => '18:30',
                'is_active' => true,
            ],

            // ==========================================
            // 1.5-HOUR ACADEMIC BLOCKS (Tuesday & Thursday)
            // ==========================================
            [
                'name' => 'TTh Block 1 (07:30 - 09:00)',
                'start_time' => '07:30',
                'end_time' => '09:00',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 2 (09:00 - 10:30)',
                'start_time' => '09:00',
                'end_time' => '10:30',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 3 (10:30 - 12:00)',
                'start_time' => '10:30',
                'end_time' => '12:00',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 4 (13:00 - 14:30)',
                'start_time' => '13:00',
                'end_time' => '14:30',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 5 (14:30 - 16:00)',
                'start_time' => '14:30',
                'end_time' => '16:00',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 6 (16:00 - 17:30)',
                'start_time' => '16:00',
                'end_time' => '17:30',
                'is_active' => true,
            ],
            [
                'name' => 'TTh Block 7 (17:30 - 19:00)',
                'start_time' => '17:30',
                'end_time' => '19:00',
                'is_active' => true,
            ],

            // ==========================================
            // 2-HOUR BLOCKS (PATHFIT / NSTP / Practicum)
            // ==========================================
            [
                'name' => '2-Hour Block (08:00 - 10:00)',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'is_active' => true,
            ],
            [
                'name' => '2-Hour Block (10:00 - 12:00)',
                'start_time' => '10:00',
                'end_time' => '12:00',
                'is_active' => true,
            ],
            [
                'name' => '2-Hour Block (13:00 - 15:00)',
                'start_time' => '13:00',
                'end_time' => '15:00',
                'is_active' => true,
            ],
            [
                'name' => '2-Hour Block (15:00 - 17:00)',
                'start_time' => '15:00',
                'end_time' => '17:00',
                'is_active' => true,
            ],

            // ==========================================
            // 3-HOUR EXTENDED BLOCKS (Lab / Micro-Teaching / Saturday)
            // ==========================================
            [
                'name' => '3-Hour Morning Lab (07:30 - 10:30)',
                'start_time' => '07:30',
                'end_time' => '10:30',
                'is_active' => true,
            ],
            [
                'name' => '3-Hour Morning Lab (08:00 - 11:00)',
                'start_time' => '08:00',
                'end_time' => '11:00',
                'is_active' => true,
            ],
            [
                'name' => '3-Hour Mid-Day Lab (09:00 - 12:00)',
                'start_time' => '09:00',
                'end_time' => '12:00',
                'is_active' => true,
            ],
            [
                'name' => '3-Hour Afternoon Lab (13:00 - 16:00)',
                'start_time' => '13:00',
                'end_time' => '16:00',
                'is_active' => true,
            ],
            [
                'name' => '3-Hour Late Afternoon (14:00 - 17:00)',
                'start_time' => '14:00',
                'end_time' => '17:00',
                'is_active' => true,
            ],
            [
                'name' => '3-Hour Evening Seminar (17:30 - 20:30)',
                'start_time' => '17:30',
                'end_time' => '20:30',
                'is_active' => true,
            ],
        ];

        foreach ($timeSlots as $slot) {
            TimeSlot::updateOrCreate(
                ['name' => $slot['name']],
                $slot
            );
        }

        $this->command->info('Time slots seeded: '.count($timeSlots).' active academic time slots.');
    }
}
