<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Models\WorkloadRule;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkloadRule>
 */
class WorkloadRuleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WorkloadRule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employment_type' => fake()->randomElement(EmploymentType::values()),
            'max_teaching_hours' => fake()->randomFloat(15, 30, 1),
            'max_units' => fake()->randomFloat(18, 30, 1),
            'min_units' => fake()->optional()->randomFloat(6, 15, 1),
            'max_preparation_hours' => fake()->optional()->randomFloat(2, 8, 1),
            'overtime_rate' => fake()->optional()->randomFloat(1.25, 2.0, 2),
            'description' => fake()->sentence(),
            'is_active' => true,
            'effective_date' => fake()->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
        ];
    }

    /**
     * Indicate that the rule is for full-time employment.
     */
    public function fullTime(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'employment_type' => EmploymentType::FULL_TIME->value,
            'max_teaching_hours' => 24.0,
            'max_units' => 24.0,
        ]));
    }

    /**
     * Indicate that the rule is for part-time employment.
     */
    public function partTime(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'employment_type' => EmploymentType::PART_TIME->value,
            'max_teaching_hours' => 18.0,
            'max_units' => 18.0,
        ]));
    }

    /**
     * Indicate that the rule is for casual employment.
     */
    public function casual(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'employment_type' => EmploymentType::CASUAL->value,
            'max_teaching_hours' => 12.0,
            'max_units' => 12.0,
        ]));
    }

    /**
     * Indicate that the rule is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_active' => false,
        ]));
    }

    /**
     * Indicate that the rule is effective from today.
     */
    public function effectiveFromToday(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'effective_date' => now()->format('Y-m-d'),
        ]));
    }
}
