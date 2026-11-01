<?php

namespace Database\Seeders;

use App\Enums\SemesterType;
use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run(): void
    {
        $semesters = [
            [
                'name' => 'First Semester AY 2025-2026',
                'academic_year' => '2025-2026',
                'semester_type' => SemesterType::FIRST->value,
                'start_date' => '2025-08-11',
                'end_date' => '2025-12-19',
                'is_current' => false,
            ],
            [
                'name' => 'Second Semester AY 2025-2026',
                'academic_year' => '2025-2026',
                'semester_type' => SemesterType::SECOND->value,
                'start_date' => '2026-01-05',
                'end_date' => '2026-05-22',
                'is_current' => true,
            ],
            [
                'name' => 'Summer / Mid-Year 2026',
                'academic_year' => '2025-2026',
                'semester_type' => SemesterType::SUMMER->value,
                'start_date' => '2026-06-08',
                'end_date' => '2026-07-24',
                'is_current' => false,
            ],
        ];

        foreach ($semesters as $semester) {
            Semester::updateOrCreate(
                [
                    'academic_year' => $semester['academic_year'],
                    'semester_type' => $semester['semester_type'],
                ],
                $semester
            );
        }

        $this->command->info('Semesters seeded: '.count($semesters).' academic semesters (Current: Second Semester AY 2025-2026).');
    }
}
