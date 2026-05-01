<?php

namespace Database\Factories;

use App\Enums\DraftScheduleStatus;
use App\Models\DraftSchedule;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;

/**
 * @extends Factory<DraftSchedule>
 */
class DraftScheduleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Model>
     */
    protected $model = DraftSchedule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'teacher_assignment_id' => 1,
            'schedule_id' => 1,
            'status' => DraftScheduleStatus::DRAFT->value,
            'submitted_at' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_comments' => null,
        ];
    }

    /**
     * Indicate that the draft schedule is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DraftScheduleStatus::APPROVED->value,
            'submitted_at' => now(),
            'reviewed_by' => 1,
            'reviewed_at' => now(),
            'review_comments' => 'Approved for testing',
        ]);
    }
}
