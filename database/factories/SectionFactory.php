<?php

namespace Database\Factories;

use App\Models\Section;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Section::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section_code' => fake()->unique()->bothify('alphaNumeric'),
            'program_id' => \App\Models\Program::factory(),
            'semester_id' => \App\Models\Semester::factory(),
            'year_level' => fake()->numberBetween(1, 4),
            'max_students' => fake()->numberBetween(30, 50),
            'current_students' => fake()->numberBetween(0, 30),
            'adviser_id' => null,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the section has an adviser assigned.
     */
    public function withAdviser(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'adviser_id' => \App\Models\Teacher::factory(),
        ]));
    }

    /**
     * Indicate that the section is at full capacity.
     */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'current_students' => fn ($attr) => $attr['max_students'],
        ]));
    }

    /**
     * Indicate that the section is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_active' => false,
        ]));
    }

    /**
     * Indicate that the section is for first year.
     */
    public function firstYear(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'year_level' => 1,
        ]));
    }

    /**
     * Indicate that the section is for second year.
     */
    public function secondYear(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'year_level' => 2,
        ]));
    }

    /**
     * Indicate that the section is for third year.
     */
    public function thirdYear(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'year_level' => 3,
        ]));
    }

    /**
     * Indicate that the section is for fourth year.
     */
    public function fourthYear(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'year_level' => 4,
        ]));
    }
}
