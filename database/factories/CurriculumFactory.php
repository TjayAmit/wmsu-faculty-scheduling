<?php

namespace Database\Factories;

use App\Enums\CurriculumSemesterType;
use App\Models\Curriculum;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Curriculum>
 */
class CurriculumFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Curriculum::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_id' => \App\Models\Program::factory(),
            'subject_id' => \App\Models\Subject::factory(),
            'year_level' => fake()->numberBetween(1, 4),
            'semester_type' => fake()->randomElement(CurriculumSemesterType::values()),
            'is_required' => fake()->boolean(80), // 80% chance of being required
            'prerequisite_subjects' => fake()->optional()->randomElements([
                [1, 2, 3],
                [4, 5],
                [6],
                [],
            ]),
            'units_override' => fake()->optional()->randomFloat(1, 5, 1),
        ];
    }

    /**
     * Indicate that the curriculum item is required.
     */
    public function required(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_required' => true,
        ]));
    }

    /**
     * Indicate that the curriculum item is an elective.
     */
    public function elective(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'is_required' => false,
        ]));
    }

    /**
     * Indicate that the curriculum item has prerequisites.
     */
    public function withPrerequisites(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'prerequisite_subjects' => [1, 2, 3],
        ]));
    }

    /**
     * Indicate that the curriculum item has units override.
     */
    public function withUnitsOverride(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'units_override' => fake()->randomFloat(1, 5, 1),
        ]));
    }
}
