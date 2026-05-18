<?php

namespace Database\Seeders;

use App\Models\WorkloadRule;
use Illuminate\Database\Seeder;

class WorkloadRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [
                'employment_type' => 'full_time',
                'max_teaching_hours' => 24.0,
                'max_units' => 24.0,
                'min_units' => 15.0,
                'max_preparation_hours' => 8.0,
                'overtime_rate' => 1.25,
                'description' => 'Full-time faculty workload rule per WMSU policy. Regular teaching load is 18–24 units per semester. Subject to dean\'s approval for overload.',
                'is_active' => true,
                'effective_date' => '2024-08-01',
            ],
            [
                'employment_type' => 'part_time',
                'max_teaching_hours' => 18.0,
                'max_units' => 18.0,
                'min_units' => 6.0,
                'max_preparation_hours' => 4.0,
                'overtime_rate' => null,
                'description' => 'Part-time faculty workload rule per WMSU policy. Maximum of 18 units per semester. No overtime entitlement.',
                'is_active' => true,
                'effective_date' => '2024-08-01',
            ],
            [
                'employment_type' => 'casual',
                'max_teaching_hours' => 12.0,
                'max_units' => 12.0,
                'min_units' => 3.0,
                'max_preparation_hours' => 2.0,
                'overtime_rate' => null,
                'description' => 'Casual faculty workload rule per WMSU policy. Maximum of 12 units per semester. Subject to contract terms.',
                'is_active' => true,
                'effective_date' => '2024-08-01',
            ],
        ];

        foreach ($rules as $rule) {
            WorkloadRule::firstOrCreate(
                [
                    'employment_type' => $rule['employment_type'],
                    'effective_date' => $rule['effective_date'],
                ],
                $rule
            );
        }

        $this->command->info('Workload rules seeded: ' . count($rules) . ' rules (full_time, part_time, casual).');
    }
}
