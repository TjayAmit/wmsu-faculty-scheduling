<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $coed = Department::where('code', 'COEd')->value('id');

        if (! $coed) {
            $this->command->error('College of Education (COEd) not found. Skipping program seeder.');
            return;
        }

        $programs = [
            [
                'code' => 'BEEd',
                'name' => 'Bachelor of Elementary Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Focuses on general foundational education, content courses, and pedagogical competencies for elementary-level teaching.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BECEd',
                'name' => 'Bachelor of Early Childhood Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Concentrates on the development, learning, and care of young children from early childhood through the early grades.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSNEd',
                'name' => 'Bachelor of Special Needs Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Prepares teachers to handle inclusive education, special learners, and specialized instructional strategies.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BCAEd',
                'name' => 'Bachelor of Culture and Arts Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Integrates arts, cultural heritage, and creative expression with teaching methodologies.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Eng',
                'name' => 'Bachelor of Secondary Education Major in English',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program specializing in English language instruction, applied linguistics, and world literature.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Fil',
                'name' => 'Bachelor of Secondary Education Major in Filipino',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program preparing teachers with mastery in Filipino language, linguistics, and literature.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Sci',
                'name' => 'Bachelor of Secondary Education Major in Science',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program specializing in general science, biological science, chemistry, and physical sciences pedagogy.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Math',
                'name' => 'Bachelor of Secondary Education Major in Mathematics',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program specializing in mathematics, algebra, trigonometry, geometry, and calculus pedagogy.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-SS',
                'name' => 'Bachelor of Secondary Education Major in Social Studies',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program focusing on Philippine history, world history, geography, economics, and sociology pedagogy.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Val',
                'name' => 'Bachelor of Secondary Education Major in Values Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program focusing on moral development, ethical decision-making, personhood, and values integration.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'PEC',
                'name' => 'Professional Education Certificate',
                'degree_level' => 'certificate',
                'department_id' => $coed,
                'description' => 'A post-baccalaureate certification program for graduates looking to earn professional education units required for licensure.',
                'duration_years' => 1.0,
                'total_units' => 18.0,
                'is_active' => true,
            ],
        ];

        foreach ($programs as $program) {
            Program::updateOrCreate(
                ['code' => $program['code']],
                $program
            );
        }

        $this->command->info('Programs seeded: '.count($programs).' Western Mindanao State University College of Education degree and certificate programs.');
    }
}
