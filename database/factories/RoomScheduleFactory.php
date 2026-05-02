<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\RoomSchedule;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoomSchedule>
 */
class RoomScheduleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = RoomSchedule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = fake()->time('H:i');
        $endTime = fake()->dateTimeBetween($startTime, '+3 hours')->format('H:i');

        return [
            'classroom_id' => Classroom::factory(),
            'schedule_id' => Schedule::factory(),
            'date' => fake()->date(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'notes' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the room schedule is for today.
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Indicate that the room schedule is for a specific date range.
     */
    public function forDateRange(string $startDate, string $endDate): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => fake()->dateTimeBetween($startDate, $endDate)->format('Y-m-d'),
        ]);
    }

    /**
     * Indicate that the room schedule is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
