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

        $this->command->info('Semesters seeded: '.count($semesters).' academic semesters (current: Second Semester AY 2025-2026).');
    }
}
