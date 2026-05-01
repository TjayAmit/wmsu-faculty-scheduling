<?php

namespace Database\Factories;

use App\Enums\RoomType;
use App\Models\Classroom;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Classroom::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'building' => fake()->buildingNumber(),
            'room_number' => fake()->bothify('number'),
            'room_name' => fake()->optional()->word(),
            'capacity' => fake()->numberBetween(20, 100),
            'room_type' => fake()->randomElement(RoomType::values()),
            'equipment' => fake()->optional()->randomElements([
                ['projector', 'whiteboard', 'computer', 'sound_system'],
                ['projector', 'computer', 'internet'],
                ['projector', 'whiteboard'],
            ]),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the classroom is a laboratory.
     */
    public function laboratory(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'room_type' => RoomType::LAB->value,
            'equipment' => ['computer', 'projector', 'internet'],
        ]));
    }

    /**
     * Indicate that the classroom is a lecture hall.
     */
    public function lectureHall(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'room_type' => RoomType::LECTURE_HALL->value,
            'capacity' => fake()->numberBetween(100, 300),
            'equipment' => ['projector', 'sound_system', 'microphone'],
        ]));
    }

    /**
     * Indicate that the classroom is an office.
     */
    public function office(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'room_type' => RoomType::OFFICE->value,
            'capacity' => fake()->numberBetween(1, 10),
        ]));
    }
}
