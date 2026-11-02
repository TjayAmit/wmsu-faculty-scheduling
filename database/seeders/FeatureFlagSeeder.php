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
            [
                'name' => 'DEV User Switcher',
                'key' => 'dev-user-switcher',
                'description' => 'Enable/disable the quick DEV user switcher dropdown in the navigation header',
                'is_enabled' => true,
            ],
        ];

        foreach ($featureFlags as $featureFlag) {
            FeatureFlag::firstOrCreate(
                ['key' => $featureFlag['key']],
                $featureFlag
            );
        }
    }
}
