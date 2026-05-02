<?php

namespace Database\Factories;

use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeachingHistory>
 */
class TeachingHistoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TeachingHistory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hoursAssigned = fake()->numberBetween(30, 90);
        $status = fake()->randomElement(['completed', 'incomplete', 'dropped']);
        $hoursCompleted = $status === 'completed' ? $hoursAssigned : fake()->numberBetween(0, $hoursAssigned - 1);

        return [
            'teacher_id' => Teacher::factory(),
            'semester_id' => Semester::factory(),
            'subject_id' => Subject::factory(),
            'schedule_id' => null,
            'hours_assigned' => $hoursAssigned,
            'hours_completed' => $hoursCompleted,
            'status' => $status,
            'notes' => fake()->optional()->sentence(),
            'archived_at' => fake()->optional(0.7)->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the teaching history is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'hours_completed' => $attributes['hours_assigned'],
        ]);
    }

    /**
     * Indicate that the teaching history is incomplete.
     */
    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'incomplete',
            'hours_completed' => fake()->numberBetween(0, $attributes['hours_assigned'] - 1),
        ]);
    }

    /**
     * Indicate that the teaching history is dropped.
     */
    public function dropped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'dropped',
            'hours_completed' => fake()->numberBetween(0, $attributes['hours_assigned'] / 2),
        ]);
    }

    /**
     * Indicate that the teaching history is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'archived_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    /**
     * Indicate that the teaching history is for a specific teacher.
     */
    public function forTeacher(int $teacherId): static
    {
        return $this->state(fn (array $attributes) => [
            'teacher_id' => $teacherId,
        ]);
    }

    /**
     * Indicate that the teaching history is for a specific semester.
     */
    public function forSemester(int $semesterId): static
    {
        return $this->state(fn (array $attributes) => [
            'semester_id' => $semesterId,
        ]);
    }
}
