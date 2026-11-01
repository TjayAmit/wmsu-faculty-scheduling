<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemesterId = Semester::where('is_current', true)->value('id');

        if (! $currentSemesterId) {
            $this->command->warn('No current semester found. Skipping section seeder.');
            return;
        }

        $programs = [
            'BEEd' => [
                1 => ['A', 'B'],
                2 => ['A', 'B'],
                3 => ['A', 'B'],
                4 => ['A'],
            ],
            'BSEd-Eng' => [
                1 => ['A', 'B'],
                2 => ['A'],
                3 => ['A'],
                4 => ['A'],
            ],
            'BSEd-Math' => [
                1 => ['A', 'B'],
                2 => ['A'],
                3 => ['A'],
                4 => ['A'],
            ],
            'BSEd-Sci' => [
                1 => ['A'],
                2 => ['A'],
                3 => ['A'],
                4 => ['A'],
            ],
            'BECEd' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'BSNEd' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'BCAEd' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'BSEd-Fil' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'BSEd-SS' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'BSEd-Val' => [
                1 => ['A'],
                2 => ['A'],
            ],
            'PEC' => [
                1 => ['A'],
            ],
        ];

        $totalSeeded = 0;

        foreach ($programs as $progCode => $yearSections) {
            $programId = Program::where('code', $progCode)->value('id');
            if (! $programId) {
                continue;
            }

            foreach ($yearSections as $year => $sections) {
                foreach ($sections as $sectionLetter) {
                    $sectionCode = "{$progCode}-{$year}{$sectionLetter}";

                    Section::updateOrCreate(
                        [
                            'section_code' => $sectionCode,
                            'semester_id' => $currentSemesterId,
                        ],
                        [
                            'section_code' => $sectionCode,
                            'program_id' => $programId,
                            'semester_id' => $currentSemesterId,
                            'year_level' => $year,
                            'max_students' => 40,
                            'current_students' => 0,
                            'adviser_id' => null,
                            'is_active' => true,
                        ]
                    );

                    $totalSeeded++;
                }
            }
        }

        $this->command->info("Sections seeded: {$totalSeeded} College of Education active sections for current semester.");
    }
}
