<?php

namespace Database\Factories;

use App\Enums\ConflictSeverity;
use App\Enums\ConflictStatus;
use App\Enums\ConflictType;
use App\Enums\DayOfWeek;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\ScheduleConflict;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\TimeSlot;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<ScheduleConflict>
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
            'primary_schedule_id' => Schedule::factory(),
            'secondary_schedule_id' => Schedule::factory(),
            'teacher_id' => Teacher::factory(),
            'classroom_id' => Classroom::factory(),
            'time_slot_id' => TimeSlot::factory(),
            'day_of_week' => fake()->randomElement(DayOfWeek::values()),
            'semester_id' => Semester::factory(),
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
            'resolved_by' => User::factory(),
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
