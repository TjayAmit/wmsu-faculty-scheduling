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
                'code' => 'COEd',
                'name' => 'College of Education',
                'description' => 'Dedicated to excellence in teacher education, preparing future educators across elementary, secondary, early childhood, and special needs education.',
                'office_location' => 'Education Building, WMSU Main Campus, Baliwasan, Zamboanga City',
                'contact_phone' => '(062) 991-1771',
                'contact_email' => 'coed@wmsu.edu.ph',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }

        $this->command->info('Departments seeded: '.count($departments).' college (College of Education).');
    }
}
