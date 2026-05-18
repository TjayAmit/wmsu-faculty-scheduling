<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $ccs   = Department::where('code', 'CCS')->value('id');
        $coe   = Department::where('code', 'COE')->value('id');
        $cas   = Department::where('code', 'CAS')->value('id');
        $cba   = Department::where('code', 'CBA')->value('id');
        $coed  = Department::where('code', 'COEd')->value('id');
        $con   = Department::where('code', 'CON')->value('id');
        $col   = Department::where('code', 'COL')->value('id');
        $ca    = Department::where('code', 'CA')->value('id');
        $chehm = Department::where('code', 'CHEHM')->value('id');
        $ipesr = Department::where('code', 'IPESR')->value('id');

        $programs = [
            // ==========================================
            // COLLEGE OF COMPUTING STUDIES (CCS)
            // ==========================================
            [
                'code' => 'BSCS',
                'name' => 'Bachelor of Science in Computer Science',
                'degree_level' => 'bachelor',
                'department_id' => $ccs,
                'description' => 'Program focused on theoretical foundations of computing, algorithm design, software development, and research.',
                'duration_years' => 4.0,
                'total_units' => 160.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSIT',
                'name' => 'Bachelor of Science in Information Technology',
                'degree_level' => 'bachelor',
                'department_id' => $ccs,
                'description' => 'Program focused on the application, integration, and management of information technology in organizations.',
                'duration_years' => 4.0,
                'total_units' => 160.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSISM',
                'name' => 'BS in Information Systems Management',
                'degree_level' => 'bachelor',
                'department_id' => $ccs,
                'description' => 'Interdisciplinary program combining information technology with business management and organizational studies.',
                'duration_years' => 4.0,
                'total_units' => 155.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF ENGINEERING (COE)
            // ==========================================
            [
                'code' => 'BSEE',
                'name' => 'Bachelor of Science in Electrical Engineering',
                'degree_level' => 'bachelor',
                'department_id' => $coe,
                'description' => 'Engineering program focusing on electrical systems, power electronics, and control engineering.',
                'duration_years' => 5.0,
                'total_units' => 180.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSCE',
                'name' => 'Bachelor of Science in Civil Engineering',
                'degree_level' => 'bachelor',
                'department_id' => $coe,
                'description' => 'Engineering program covering structural, geotechnical, transportation, and environmental engineering.',
                'duration_years' => 5.0,
                'total_units' => 182.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSME',
                'name' => 'Bachelor of Science in Mechanical Engineering',
                'degree_level' => 'bachelor',
                'department_id' => $coe,
                'description' => 'Engineering program focused on thermodynamics, fluid mechanics, machine design, and manufacturing processes.',
                'duration_years' => 5.0,
                'total_units' => 178.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSECE',
                'name' => 'BS in Electronics and Communications Engineering',
                'degree_level' => 'bachelor',
                'department_id' => $coe,
                'description' => 'Engineering program covering electronic circuits, telecommunications systems, and signal processing.',
                'duration_years' => 5.0,
                'total_units' => 180.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF ARTS AND SCIENCES (CAS)
            // ==========================================
            [
                'code' => 'BSMATH',
                'name' => 'Bachelor of Science in Mathematics',
                'degree_level' => 'bachelor',
                'department_id' => $cas,
                'description' => 'Program providing rigorous training in pure and applied mathematics, statistics, and actuarial science.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'ABENG',
                'name' => 'Bachelor of Arts in English',
                'degree_level' => 'bachelor',
                'department_id' => $cas,
                'description' => 'Liberal arts program focusing on English language, literature, linguistics, and communication.',
                'duration_years' => 4.0,
                'total_units' => 145.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF BUSINESS ADMINISTRATION (CBA)
            // ==========================================
            [
                'code' => 'BSBA-FM',
                'name' => 'BSBA Major in Financial Management',
                'degree_level' => 'bachelor',
                'department_id' => $cba,
                'description' => 'Business program specializing in corporate finance, investment management, and financial planning.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSBA-MM',
                'name' => 'BSBA Major in Marketing Management',
                'degree_level' => 'bachelor',
                'department_id' => $cba,
                'description' => 'Business program focusing on marketing strategy, consumer behavior, and brand management.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSA',
                'name' => 'Bachelor of Science in Accountancy',
                'degree_level' => 'bachelor',
                'department_id' => $cba,
                'description' => 'Professional accountancy program preparing students for the Philippine CPA Licensure Examination.',
                'duration_years' => 5.0,
                'total_units' => 175.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF EDUCATION (COEd)
            // ==========================================
            [
                'code' => 'BEEd',
                'name' => 'Bachelor of Elementary Education',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Teacher education program preparing graduates to teach at the elementary level.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Math',
                'name' => 'BSEd Major in Mathematics',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program with specialization in Mathematics.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Eng',
                'name' => 'BSEd Major in English',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program with specialization in English language and literature.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSEd-Sci',
                'name' => 'BSEd Major in Science',
                'degree_level' => 'bachelor',
                'department_id' => $coed,
                'description' => 'Secondary teacher education program with specialization in General Science.',
                'duration_years' => 4.0,
                'total_units' => 152.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF NURSING (CON)
            // ==========================================
            [
                'code' => 'BSN',
                'name' => 'Bachelor of Science in Nursing',
                'degree_level' => 'bachelor',
                'department_id' => $con,
                'description' => 'Nursing program preparing graduates for the Philippine Nurse Licensure Examination (NLE).',
                'duration_years' => 4.0,
                'total_units' => 170.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF LAW (COL)
            // ==========================================
            [
                'code' => 'JD',
                'name' => 'Juris Doctor',
                'degree_level' => 'master',
                'department_id' => $col,
                'description' => 'Professional law degree preparing students for the Philippine Bar Examination.',
                'duration_years' => 4.0,
                'total_units' => 120.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF AGRICULTURE (CA)
            // ==========================================
            [
                'code' => 'BSAgri',
                'name' => 'Bachelor of Science in Agriculture',
                'degree_level' => 'bachelor',
                'department_id' => $ca,
                'description' => 'Program covering crop science, animal science, soil science, and agri-business for sustainable agriculture.',
                'duration_years' => 4.0,
                'total_units' => 155.0,
                'is_active' => true,
            ],

            // ==========================================
            // COLLEGE OF HOME ECONOMICS AND HOSPITALITY MANAGEMENT (CHEHM)
            // ==========================================
            [
                'code' => 'BSHRM',
                'name' => 'BS in Hotel and Restaurant Management',
                'degree_level' => 'bachelor',
                'department_id' => $chehm,
                'description' => 'Program preparing students for careers in hotel, restaurant, and hospitality industry management.',
                'duration_years' => 4.0,
                'total_units' => 150.0,
                'is_active' => true,
            ],
            [
                'code' => 'BSFST',
                'name' => 'BS in Food Science and Technology',
                'degree_level' => 'bachelor',
                'department_id' => $chehm,
                'description' => 'Program focusing on food processing, food safety, nutrition science, and food product development.',
                'duration_years' => 4.0,
                'total_units' => 155.0,
                'is_active' => true,
            ],

            // ==========================================
            // INSTITUTE OF PHYSICAL EDUCATION, SPORTS AND RECREATION (IPESR)
            // ==========================================
            [
                'code' => 'BSPE',
                'name' => 'Bachelor of Science in Physical Education',
                'degree_level' => 'bachelor',
                'department_id' => $ipesr,
                'description' => 'Program preparing PE teachers and sports coaches for schools, athletic organizations, and fitness centers.',
                'duration_years' => 4.0,
                'total_units' => 145.0,
                'is_active' => true,
            ],
        ];

        foreach ($programs as $program) {
            Program::firstOrCreate(
                ['code' => $program['code']],
                $program
            );
        }

        $this->command->info('Programs seeded: ' . count($programs) . ' WMSU academic programs created.');
    }
}
