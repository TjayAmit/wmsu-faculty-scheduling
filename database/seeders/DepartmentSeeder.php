<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'code' => 'CCS',
                'name' => 'College of Computing Studies',
                'description' => 'Offers undergraduate programs in Computer Science, Information Technology, and Information Systems Management.',
                'office_location' => 'CCS Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'ccs@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'COE',
                'name' => 'College of Engineering',
                'description' => 'Offers programs in Electrical, Civil, Mechanical, and Electronics Engineering.',
                'office_location' => 'Engineering Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'coe@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'CAS',
                'name' => 'College of Arts and Sciences',
                'description' => 'Offers programs in natural sciences, social sciences, mathematics, and humanities.',
                'office_location' => 'CAS Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'cas@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'CBA',
                'name' => 'College of Business Administration',
                'description' => 'Offers programs in Business Administration, Accountancy, and related business disciplines.',
                'office_location' => 'CBA Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'cba@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'COEd',
                'name' => 'College of Education',
                'description' => 'Prepares future educators in elementary, secondary, and technical-vocational education.',
                'office_location' => 'Education Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'coed@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'CON',
                'name' => 'College of Nursing',
                'description' => 'Offers the Bachelor of Science in Nursing program aligned with PRC and CHED standards.',
                'office_location' => 'Nursing Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'con@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'COL',
                'name' => 'College of Law',
                'description' => 'Offers the Juris Doctor program preparing students for the Philippine Bar Examination.',
                'office_location' => 'Law Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'col@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'CA',
                'name' => 'College of Agriculture',
                'description' => 'Offers programs in agricultural sciences and agri-business management.',
                'office_location' => 'Agriculture Building, WMSU Ayala Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'ca@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'CHEHM',
                'name' => 'College of Home Economics and Hospitality Management',
                'description' => 'Offers programs in hospitality management, food technology, and family and consumer sciences.',
                'office_location' => 'CHEHM Building, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'chehm@wmsu.edu.ph',
                'is_active' => true,
            ],
            [
                'code' => 'IPESR',
                'name' => 'Institute of Physical Education, Sports and Recreation',
                'description' => 'Offers the BS Physical Education program and oversees university sports and wellness activities.',
                'office_location' => 'Sports Complex, WMSU Main Campus, Zamboanga City',
                'contact_phone' => '(062) 992-2955',
                'contact_email' => 'ipesr@wmsu.edu.ph',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['code' => $department['code']],
                $department
            );
        }

        $this->command->info('Departments seeded: ' . count($departments) . ' WMSU colleges/institutes.');
    }
}
