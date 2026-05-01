<?php

namespace Database\Factories;

use App\Models\Department;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Department::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('alpha', 3),
            'name' => fake()->company(),
            'description' => fake()->sentence(),
            'head_id' => null,
            'office_location' => fake()->streetAddress(),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->companyEmail(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the department has a head assigned.
     */
    public function withHead(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'head_id' => \App\Models\Teacher::factory(),
        ]));
    }

    /**
     * Indicate that the department is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_active' => false,
        ]));
    }
}
