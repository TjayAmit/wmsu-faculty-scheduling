<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Teacher::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();

        return [
            'user_id' => null,
            'email' => strtolower($firstName.'.'.$lastName.'@wmsu.edu.ph'),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'employee_id' => 'EMP'.$this->faker->unique()->numerify('######'),
            'department' => $this->faker->randomElement([
                'College of Computer Studies',
                'College of Engineering',
                'College of Arts and Sciences',
                'College of Business Administration',
                'College of Education',
                'College of Nursing',
            ]),
            'rank' => $this->faker->randomElement([
                'Instructor',
                'Assistant Professor',
                'Associate Professor',
                'Professor',
            ]),
            'employment_type' => $this->faker->randomElement(EmploymentType::cases()),
            'date_hired' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the teacher is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the teacher has a linked user account.
     */
    public function withUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => User::factory()->create()->id,
        ]);
    }

    /**
     * Indicate that the teacher is full-time.
     */
    public function fullTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_type' => EmploymentType::FULL_TIME,
        ]);
    }

    /**
     * Indicate that the teacher is part-time.
     */
    public function partTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_type' => EmploymentType::PART_TIME,
        ]);
    }

    /**
     * Indicate that the teacher is casual.
     */
    public function casual(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_type' => EmploymentType::CASUAL,
        ]);
    }
}
