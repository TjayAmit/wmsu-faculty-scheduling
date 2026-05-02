<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->date();
        $endDate = fake()->dateTimeBetween($startDate, '+7 days')->format('Y-m-d');

        return [
            'teacher_id' => Teacher::factory(),
            'leave_type' => fake()->randomElement(['sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity', 'other']),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'cancelled']),
            'approved_by' => null,
            'approved_at' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the leave request is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the leave request is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_by' => 1,
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the leave request is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'approved_by' => 1,
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the leave request is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Indicate that the leave request is for sick leave.
     */
    public function sick(): static
    {
        return $this->state(fn (array $attributes) => [
            'leave_type' => 'sick',
        ]);
    }

    /**
     * Indicate that the leave request is for vacation.
     */
    public function vacation(): static
    {
        return $this->state(fn (array $attributes) => [
            'leave_type' => 'vacation',
        ]);
    }

    /**
     * Indicate that the leave request is for a specific date range.
     */
    public function forDateRange(string $startDate, string $endDate): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }
}
