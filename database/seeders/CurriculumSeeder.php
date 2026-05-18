<?php

namespace Database\Seeders;

use App\Models\Curriculum;
use App\Models\Program;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBSCSCurriculum();
        $this->seedBSITCurriculum();

        $this->command->info('Curriculum seeded: BSCS and BSIT 4-year curriculum mapping complete.');
    }

    private function subjectId(string $code): ?int
    {
        return Subject::where('code', $code)->value('id');
    }

    private function programId(string $code): ?int
    {
        return Program::where('code', $code)->value('id');
    }

    private function seedCurriculum(int $programId, array $items): void
    {
        foreach ($items as $item) {
            $subjectId = $this->subjectId($item['subject_code']);

            if (! $subjectId) {
                $this->command->warn("Subject not found: {$item['subject_code']}, skipping.");
                continue;
            }

            Curriculum::firstOrCreate(
                [
                    'program_id' => $programId,
                    'subject_id' => $subjectId,
                ],
                [
                    'program_id'            => $programId,
                    'subject_id'            => $subjectId,
                    'year_level'            => $item['year_level'],
                    'semester_type'         => $item['semester_type'],
                    'is_required'           => $item['is_required'],
                    'prerequisite_subjects' => $item['prerequisites'] ?? null,
                ]
            );
        }
    }

    private function seedBSCSCurriculum(): void
    {
        $programId = $this->programId('BSCS');

        if (! $programId) {
            $this->command->warn('BSCS program not found, skipping curriculum seed.');
            return;
        }

        $curriculum = [
            // ==========================================
            // YEAR 1 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'MATH 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 1 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 101',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true,
                'prerequisites' => null],
            ['subject_code' => 'CS 101',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // ==========================================
            // YEAR 2 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 103',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 107',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CS 102',   'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 2 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 104',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 102',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 103',   'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 104',   'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // ==========================================
            // YEAR 3 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 106',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 108',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 106', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CS 105',   'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CS 107',   'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 3 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 107', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 106',   'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 108',   'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 109',   'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],

            // ==========================================
            // YEAR 4 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'COSC 108', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 109', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CS 111',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CS 201',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => false],
            ['subject_code' => 'CS 203',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => false],

            // ==========================================
            // YEAR 4 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'CS 112',   'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 113',   'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CS 202',   'year_level' => 4, 'semester_type' => 'second', 'is_required' => false],
        ];

        $this->seedCurriculum($programId, $curriculum);

        $this->command->info('  - BSCS curriculum: ' . count($curriculum) . ' subjects mapped.');
    }

    private function seedBSITCurriculum(): void
    {
        $programId = $this->programId('BSIT');

        if (! $programId) {
            $this->command->warn('BSIT program not found, skipping curriculum seed.');
            return;
        }

        $curriculum = [
            // ==========================================
            // YEAR 1 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'IT 103',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 1 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 101',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'IT 101',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // ==========================================
            // YEAR 2 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 103',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 107',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'IT 104',   'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 2 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 104',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 102',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'IT 102',   'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 106', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // ==========================================
            // YEAR 3 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 106',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 108',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'COSC 107', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'IT 105',   'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'IT 106',   'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // ==========================================
            // YEAR 3 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 108', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'COSC 109', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'IT 107',   'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'IT 201',   'year_level' => 3, 'semester_type' => 'second', 'is_required' => false],

            // ==========================================
            // YEAR 4 - FIRST SEMESTER
            // ==========================================
            ['subject_code' => 'IT 108',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'IT 202',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => false],
            ['subject_code' => 'IT 203',   'year_level' => 4, 'semester_type' => 'first',  'is_required' => false],

            // ==========================================
            // YEAR 4 - SECOND SEMESTER
            // ==========================================
            ['subject_code' => 'IT 109',   'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'IT 110',   'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $curriculum);

        $this->command->info('  - BSIT curriculum: ' . count($curriculum) . ' subjects mapped.');
    }
}
