<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for the College of Education (COEd) 1-year rollout.
     */
    public function run(): void
    {
        $this->call([
            // Foundational auth & system config
            RoleAndPermissionSeeder::class,
            AdminUserSeeder::class,
            FeatureFlagSeeder::class,

            // Core institutional parameters (order matters for FK constraints)
            DepartmentSeeder::class,    // College of Education (COEd)
            SubjectSeeder::class,       // GEC, ProfEd, Elementary & Secondary Major courses
            SemesterSeeder::class,      // AY 2025-2026 (1st, 2nd, Summer)
            ClassroomSeeder::class,     // Education Building rooms & university lecture halls
            TimeSlotSeeder::class,      // Standard MWF 1h, TTh 1.5h, 2h, and 3h lab slots
            HolidaySeeder::class,       // Official AY 2025-2026 academic calendar holidays
            WorkloadRuleSeeder::class,  // CHED/WMSU faculty workload rules

            // Academic structure & curriculum
            ProgramSeeder::class,       // BEEd, BSEd-Eng, BSEd-Math, BSEd-Sci, etc.
            UsersSeeder::class,         // COEd Dean, Dept Chairs, and Faculty Teachers
            CurriculumSeeder::class,    // 4-year curriculum mappings for COEd programs
            SectionSeeder::class,       // Active student cohort sections (BEEd, BSEd)

            // Facilities & scheduling operational seed data
            ZktecoDeviceSeeder::class,  // Biometric attendance devices in COEd rooms
            ScheduleSeeder::class,      // Baseline course schedules, assignments, and sessions
        ]);
    }
}
