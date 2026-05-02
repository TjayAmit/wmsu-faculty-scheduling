<?php

namespace Database\Factories;

use App\Models\FeatureFlag;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeatureFlag>
 */
class FeatureFlagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'key' => fake()->unique()->regexify('[a-z0-9_]{8,12}'),
            'description' => fake()->sentence(10),
            'is_enabled' => fake()->boolean(30), // 30% chance of being enabled
            'enabled_by' => User::factory(),
            'enabled_at' => fake()->optional()->dateTime(),
        ];
    }

    /**
     * Indicate that the feature flag is enabled.
     */
    public function enabled(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_enabled' => true,
            'enabled_at' => now(),
        ]));
    }

    /**
     * Indicate that the feature flag is disabled.
     */
    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_enabled' => false,
            'enabled_at' => null,
            'enabled_by' => null,
        ]));
    }

    /**
     * Create a feature flag with a specific key.
     */
    public function withKey(string $key): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'key' => $key,
        ]));
    }

    /**
     * Create a feature flag enabled by a specific user.
     */
    public function enabledBy(User $user): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_enabled' => true,
            'enabled_by' => $user->id,
            'enabled_at' => now(),
        ]));
    }
}
