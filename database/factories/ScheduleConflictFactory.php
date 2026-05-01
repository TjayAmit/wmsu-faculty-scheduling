<?php

namespace Database\Factories;

use App\Enums\ConflictType;
use App\Enums\ConflictSeverity;
use App\Enums\ConflictStatus;
use App\Enums\DayOfWeek;
use App\Models\ScheduleConflict;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScheduleConflict>
 */
class ScheduleConflictFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ScheduleConflict::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conflict_type' => fake()->randomElement(ConflictType::values()),
            'primary_schedule_id' => \App\Models\Schedule::factory(),
            'secondary_schedule_id' => \App\Models\Schedule::factory(),
            'teacher_id' => \App\Models\Teacher::factory(),
            'classroom_id' => \App\Models\Classroom::factory(),
            'time_slot_id' => \App\Models\TimeSlot::factory(),
            'day_of_week' => fake()->randomElement(DayOfWeek::values()),
            'semester_id' => \App\Models\Semester::factory(),
            'severity' => fake()->randomElement(ConflictSeverity::values()),
            'status' => ConflictStatus::PENDING->value,
            'resolved_by' => null,
            'resolution_notes' => null,
        ];
    }

    /**
     * Indicate that the conflict is a teacher overlap.
     */
    public function teacherOverlap(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'conflict_type' => ConflictType::TEACHER_OVERLAP->value,
            'severity' => ConflictSeverity::HIGH->value,
        ]));
    }

    /**
     * Indicate that the conflict is a room double booking.
     */
    public function roomDoubleBook(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'conflict_type' => ConflictType::ROOM_DOUBLE_BOOK->value,
            'severity' => ConflictSeverity::MEDIUM->value,
        ]));
    }

    /**
     * Indicate that the conflict is a time slot conflict.
     */
    public function timeSlotConflict(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'conflict_type' => ConflictType::TIME_SLOT_CONFLICT->value,
            'severity' => ConflictSeverity::LOW->value,
        ]));
    }

    /**
     * Indicate that the conflict has critical severity.
     */
    public function critical(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'severity' => ConflictSeverity::CRITICAL->value,
        ]));
    }

    /**
     * Indicate that the conflict is resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'status' => ConflictStatus::RESOLVED->value,
            'resolved_by' => \App\Models\User::factory(),
            'resolution_notes' => fake()->sentence(),
        ]));
    }

    /**
     * Indicate that the conflict is ignored.
     */
    public function ignored(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'status' => ConflictStatus::IGNORED->value,
            'resolution_notes' => fake()->sentence(),
        ]));
    }
}
