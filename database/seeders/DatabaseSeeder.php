<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            AdminUserSeeder::class,
            UsersSeeder::class,
            FeatureFlagSeeder::class,

            // WMSU institutional data (order matters for FK constraints)
            DepartmentSeeder::class,     // no deps
            SubjectSeeder::class,        // no deps
            SemesterSeeder::class,       // no deps
            ClassroomSeeder::class,      // no deps
            WorkloadRuleSeeder::class,   // no deps
            ProgramSeeder::class,        // depends on: departments
            CurriculumSeeder::class,     // depends on: programs, subjects
            SectionSeeder::class,        // depends on: programs, semesters
        ]);
    }
}
