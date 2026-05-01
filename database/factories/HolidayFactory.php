<?php

namespace Database\Factories;

use App\Enums\HolidayType;
use App\Models\Holiday;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Holiday>
 */
class HolidayFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Holiday::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->holiday(),
            'date' => fake()->dateTimeBetween('+1 month', '+2 years')->format('Y-m-d'),
            'type' => fake()->randomElement(HolidayType::values()),
            'description' => fake()->sentence(),
            'affects_schedules' => true,
            'academic_year' => fake()->year() . '-' . (fake()->year() + 1),
        ];
    }

    /**
     * Indicate that the holiday is a regular holiday.
     */
    public function regular(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'type' => HolidayType::REGULAR->value,
        ]));
    }

    /**
     * Indicate that the holiday is a special holiday.
     */
    public function special(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'type' => HolidayType::SPECIAL->value,
        ]));
    }

    /**
     * Indicate that the holiday is a class suspension.
     */
    public function suspension(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'type' => HolidayType::SUSPENSION->value,
        ]));
    }

    /**
     * Indicate that the holiday does not affect schedules.
     */
    public function doesNotAffectSchedules(): static
    {
        return $this->state(fn (array $attributes) => array_merge($attributes, [
            'affects_schedules' => false,
        ]));
    }
}
