<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $featureFlags = [
            [
                'name' => 'Navigation Group Collapsible',
                'key' => 'nav-group-collapsable',
                'description' => 'Enable/disable collapsible navigation groups in sidebar',
                'is_enabled' => false,
            ],
        ];

        foreach ($featureFlags as $featureFlag) {
            FeatureFlag::create($featureFlag);
        }
    }
}
