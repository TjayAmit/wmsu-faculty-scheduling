<?php

namespace Database\Seeders;

use App\Enums\HolidayType;
use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            // AY 2025-2026 First Semester Holidays
            [
                'name' => 'Ninoy Aquino Day',
                'date' => '2025-08-21',
                'type' => HolidayType::SPECIAL->value,
                'description' => 'Special Non-Working Holiday commemorating the martyrdom of Senator Benigno Aquino Jr.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'National Heroes Day',
                'date' => '2025-08-25',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday honoring Philippine national heroes.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'WMSU University Palaro & Foundation Week',
                'date' => '2025-09-15',
                'type' => HolidayType::SUSPENSION->value,
                'description' => 'Official campus activity and class suspension for WMSU University Palaro opening.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Zamboanga City Charter Day (Dia de Zamboanga)',
                'date' => '2025-10-12',
                'type' => HolidayType::SPECIAL->value,
                'description' => 'Fiesta Pilar and local special non-working holiday in Zamboanga City.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'All Saints\' Day',
                'date' => '2025-11-01',
                'type' => HolidayType::SPECIAL->value,
                'description' => 'Special Non-Working Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Bonifacio Day',
                'date' => '2025-11-30',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday celebrating the birth of Andres Bonifacio.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Feast of the Immaculate Conception',
                'date' => '2025-12-08',
                'type' => HolidayType::SPECIAL->value,
                'description' => 'Special Non-Working Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Christmas Day',
                'date' => '2025-12-25',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Rizal Day',
                'date' => '2025-12-30',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday in honor of Dr. Jose Rizal.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],

            // AY 2025-2026 Second Semester Holidays
            [
                'name' => 'New Year\'s Day',
                'date' => '2026-01-01',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday welcoming the new calendar year.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'EDSA People Power Revolution Anniversary',
                'date' => '2026-02-25',
                'type' => HolidayType::SPECIAL->value,
                'description' => 'Special Non-Working Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Maundy Thursday',
                'date' => '2026-04-02',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Holy Week Regular Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Good Friday',
                'date' => '2026-04-03',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Holy Week Regular Holiday.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Araw ng Kagitingan (Day of Valor)',
                'date' => '2026-04-09',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday commemorating the Fall of Bataan.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Labor Day',
                'date' => '2026-05-01',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday celebrating worker contributions.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
            [
                'name' => 'Independence Day',
                'date' => '2026-06-12',
                'type' => HolidayType::REGULAR->value,
                'description' => 'Regular Holiday celebrating Philippine Independence.',
                'affects_schedules' => true,
                'academic_year' => '2025-2026',
            ],
        ];

        foreach ($holidays as $holiday) {
            Holiday::updateOrCreate(
                ['date' => $holiday['date']],
                $holiday
            );
        }

        $this->command->info('Holidays seeded: '.count($holidays).' official holidays for AY 2025-2026.');
    }
}
