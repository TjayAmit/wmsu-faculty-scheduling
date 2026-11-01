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
        $this->seedBEEdCurriculum();
        $this->seedBECEdCurriculum();
        $this->seedBSNEdCurriculum();
        $this->seedBCAEdCurriculum();
        $this->seedBSEdEnglishCurriculum();
        $this->seedBSEdFilipinoCurriculum();
        $this->seedBSEdScienceCurriculum();
        $this->seedBSEdMathCurriculum();
        $this->seedBSEdSocialStudiesCurriculum();
        $this->seedBSEdValuesEdCurriculum();
        $this->seedPECCurriculum();

        $this->command->info('Curriculum seeded: Western Mindanao State University College of Education curriculum mapping complete.');
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

            Curriculum::updateOrCreate(
                [
                    'program_id' => $programId,
                    'subject_id' => $subjectId,
                ],
                [
                    'program_id' => $programId,
                    'subject_id' => $subjectId,
                    'year_level' => $item['year_level'],
                    'semester_type' => $item['semester_type'],
                    'is_required' => $item['is_required'] ?? true,
                    'prerequisite_subjects' => $item['prerequisites'] ?? null,
                ]
            );
        }
    }

    /**
     * Bachelor of Elementary Education (BEEd)
     */
    private function seedBEEdCurriculum(): void
    {
        $programId = $this->programId('BEEd');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'FIL 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 107',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EED 101',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EED 104',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'GEC 108',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EED 102',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EED 103',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EED 106',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 3 - First Semester
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 106', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 108', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EED 105',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // Year 3 - Second Semester
            ['subject_code' => 'EDUC 109', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 110', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - First Semester (Field Study)
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],

            // Year 4 - Second Semester (Practice Teaching)
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Early Childhood Education (BECEd)
     */
    private function seedBECEdCurriculum(): void
    {
        $programId = $this->programId('BECEd');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ECED 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'ECED 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ECED 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ECED 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'GEC 108',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'ECED 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'ECED 106', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 3 - First Semester
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 106', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 108', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 110', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // Year 3 - Second Semester
            ['subject_code' => 'EDUC 109', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Special Needs Education (BSNEd)
     */
    private function seedBSNEdCurriculum(): void
    {
        $programId = $this->programId('BSNEd');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SNED 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SNED 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SNED 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SNED 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'GEC 108',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SNED 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SNED 106', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 3 - First Semester
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 106', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 108', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 110', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // Year 3 - Second Semester
            ['subject_code' => 'EDUC 109', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Culture and Arts Education (BCAEd)
     */
    private function seedBCAEdCurriculum(): void
    {
        $programId = $this->programId('BCAEd');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 106',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CAED 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CAED 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 105',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CAED 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'CAED 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 3','year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'GEC 108',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CAED 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'CAED 106', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 4','year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 3 - First Semester
            ['subject_code' => 'GEC 109',  'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 106', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 108', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 110', 'year_level' => 3, 'semester_type' => 'first',  'is_required' => true],

            // Year 3 - Second Semester
            ['subject_code' => 'EDUC 109', 'year_level' => 3, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in English (BSEd-Eng)
     */
    private function seedBSEdEnglishCurriculum(): void
    {
        $programId = $this->programId('BSEd-Eng');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ENG 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'ENG 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ENG 103',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'ENG 104',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in Filipino (BSEd-Fil)
     */
    private function seedBSEdFilipinoCurriculum(): void
    {
        $programId = $this->programId('BSEd-Fil');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'FIL 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'FIL 103',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'FIL 104',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 105',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'FIL 106',  'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in Science (BSEd-Sci)
     */
    private function seedBSEdScienceCurriculum(): void
    {
        $programId = $this->programId('BSEd-Sci');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SCI 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SCI 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 107',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SCI 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SCI 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in Mathematics (BSEd-Math)
     */
    private function seedBSEdMathCurriculum(): void
    {
        $programId = $this->programId('BSEd-Math');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'MATH 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'MATH 102', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'MATH 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'MATH 104', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in Social Studies (BSEd-SS)
     */
    private function seedBSEdSocialStudiesCurriculum(): void
    {
        $programId = $this->programId('BSEd-SS');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SOCS 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'SOCS 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SOCS 103', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'SOCS 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Bachelor of Secondary Education Major in Values Education (BSEd-Val)
     */
    private function seedBSEdValuesEdCurriculum(): void
    {
        $programId = $this->programId('BSEd-Val');
        if (! $programId) return;

        $items = [
            // Year 1 - First Semester
            ['subject_code' => 'GEC 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 102',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'GEC 105',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'VAL 101',  'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'PATHFIT 1','year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'NSTP 1',   'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Year 1 - Second Semester
            ['subject_code' => 'GEC 103',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'GEC 104',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'VAL 102',  'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'PATHFIT 2','year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'NSTP 2',   'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],

            // Year 2 - First Semester
            ['subject_code' => 'GEC 106',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 104', 'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'VAL 103',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'VAL 104',  'year_level' => 2, 'semester_type' => 'first',  'is_required' => true],

            // Year 2 - Second Semester
            ['subject_code' => 'EDUC 105', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 2, 'semester_type' => 'second', 'is_required' => true],

            // Year 4 - Field Study & Internship
            ['subject_code' => 'EDUC 111', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 112', 'year_level' => 4, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 113', 'year_level' => 4, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }

    /**
     * Professional Education Certificate (PEC)
     * Post-baccalaureate program (18 units for PRC Licensure Examination for Teachers)
     */
    private function seedPECCurriculum(): void
    {
        $programId = $this->programId('PEC');
        if (! $programId) return;

        $items = [
            // Semester 1 (9 units)
            ['subject_code' => 'EDUC 101', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 102', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],
            ['subject_code' => 'EDUC 103', 'year_level' => 1, 'semester_type' => 'first',  'is_required' => true],

            // Semester 2 (9 units)
            ['subject_code' => 'EDUC 104', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 105', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
            ['subject_code' => 'EDUC 107', 'year_level' => 1, 'semester_type' => 'second', 'is_required' => true],
        ];

        $this->seedCurriculum($programId, $items);
    }
}
