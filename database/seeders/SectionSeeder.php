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

        $bscs = Program::where('code', 'BSCS')->value('id');
        $bsit = Program::where('code', 'BSIT')->value('id');
        $bsee = Program::where('code', 'BSEE')->value('id');
        $bsn = Program::where('code', 'BSN')->value('id');
        $bsba = Program::where('code', 'BSBA-FM')->value('id');

        $sections = [];

        // BSCS – 4 year levels × 2 sections (A and B)
        if ($bscs) {
            foreach (range(1, 4) as $year) {
                foreach (['A', 'B'] as $section) {
                    $sections[] = [
                        'section_code' => "BSCS-{$year}{$section}",
                        'program_id' => $bscs,
                        'semester_id' => $currentSemesterId,
                        'year_level' => $year,
                        'max_students' => 40,
                        'current_students' => 0,
                        'adviser_id' => null,
                        'is_active' => true,
                    ];
                }
            }
        }

        // BSIT – 4 year levels × 2 sections (A and B)
        if ($bsit) {
            foreach (range(1, 4) as $year) {
                foreach (['A', 'B'] as $section) {
                    $sections[] = [
                        'section_code' => "BSIT-{$year}{$section}",
                        'program_id' => $bsit,
                        'semester_id' => $currentSemesterId,
                        'year_level' => $year,
                        'max_students' => 40,
                        'current_students' => 0,
                        'adviser_id' => null,
                        'is_active' => true,
                    ];
                }
            }
        }

        // BSEE – 5 year levels × 1 section
        if ($bsee) {
            foreach (range(1, 5) as $year) {
                $sections[] = [
                    'section_code' => "BSEE-{$year}A",
                    'program_id' => $bsee,
                    'semester_id' => $currentSemesterId,
                    'year_level' => $year,
                    'max_students' => 40,
                    'current_students' => 0,
                    'adviser_id' => null,
                    'is_active' => true,
                ];
            }
        }

        // BSN – 4 year levels × 2 sections (A and B)
        if ($bsn) {
            foreach (range(1, 4) as $year) {
                foreach (['A', 'B'] as $section) {
                    $sections[] = [
                        'section_code' => "BSN-{$year}{$section}",
                        'program_id' => $bsn,
                        'semester_id' => $currentSemesterId,
                        'year_level' => $year,
                        'max_students' => 45,
                        'current_students' => 0,
                        'adviser_id' => null,
                        'is_active' => true,
                    ];
                }
            }
        }

        // BSBA-FM – 4 year levels × 1 section
        if ($bsba) {
            foreach (range(1, 4) as $year) {
                $sections[] = [
                    'section_code' => "BSBA-FM-{$year}A",
                    'program_id' => $bsba,
                    'semester_id' => $currentSemesterId,
                    'year_level' => $year,
                    'max_students' => 40,
                    'current_students' => 0,
                    'adviser_id' => null,
                    'is_active' => true,
                ];
            }
        }

        foreach ($sections as $section) {
            Section::firstOrCreate(
                ['section_code' => $section['section_code']],
                $section
            );
        }

        $this->command->info('Sections seeded: '.count($sections).' sections for current semester (2nd Sem AY 2025-2026).');
    }
}
