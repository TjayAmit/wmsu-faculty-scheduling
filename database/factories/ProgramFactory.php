<?php

namespace Database\Factories;

use App\Enums\DegreeLevel;
use App\Models\Program;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Program::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('alpha', 4),
            'name' => fake()->jobTitle(),
            'degree_level' => fake()->randomElement(DegreeLevel::values()),
            'department_id' => \App\Models\Department::factory(),
            'description' => fake()->paragraph(),
            'duration_years' => fake()->randomFloat(2, 5, 1),
            'total_units' => fake()->randomFloat(100, 200, 1),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the program is a bachelor's degree.
     */
    public function bachelor(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'degree_level' => DegreeLevel::BACHELOR->value,
            'duration_years' => 4.0,
        ]));
    }

    /**
     * Indicate that the program is a master's degree.
     */
    public function master(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'degree_level' => DegreeLevel::MASTER->value,
            'duration_years' => 2.0,
        ]));
    }

    /**
     * Indicate that the program is a doctoral degree.
     */
    public function doctoral(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'degree_level' => DegreeLevel::DOCTORAL->value,
            'duration_years' => 3.0,
        ]));
    }

    /**
     * Indicate that the program is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_active' => false,
        ]));
    }
}
