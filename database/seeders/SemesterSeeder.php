<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run(): void
    {
        $semesters = [
            [
                'name' => 'First Semester AY 2024-2025',
                'academic_year' => '2024-2025',
                'semester_type' => 'first',
                'start_date' => '2024-08-12',
                'end_date' => '2024-12-20',
                'is_current' => false,
            ],
            [
                'name' => 'Second Semester AY 2024-2025',
                'academic_year' => '2024-2025',
                'semester_type' => 'second',
                'start_date' => '2025-01-06',
                'end_date' => '2025-05-23',
                'is_current' => false,
            ],
            [
                'name' => 'First Semester AY 2025-2026',
                'academic_year' => '2025-2026',
                'semester_type' => 'first',
                'start_date' => '2025-08-11',
                'end_date' => '2025-12-19',
                'is_current' => false,
            ],
            [
                'name' => 'Second Semester AY 2025-2026',
                'academic_year' => '2025-2026',
                'semester_type' => 'second',
                'start_date' => '2026-01-05',
                'end_date' => '2026-05-22',
                'is_current' => true,
            ],
        ];

        foreach ($semesters as $semester) {
            Semester::firstOrCreate(
                [
                    'academic_year' => $semester['academic_year'],
                    'semester_type' => $semester['semester_type'],
                ],
                $semester
            );
        }

        $this->command->info('Semesters seeded: ' . count($semesters) . ' academic semesters (current: Second Semester AY 2025-2026).');
    }
}
