<?php

use App\Enums\SemesterType;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Teacher']);
    Role::firstOrCreate(['name' => 'Admin']);
});

test('instructor dashboard loads successfully for teacher', function () {
    $user = User::factory()->create();
    $user->assignRole('Teacher');

    $teacher = Teacher::factory()->create([
        'user_id' => $user->id,
        'biometric_pin' => '1001',
    ]);

    Semester::create([
        'name' => 'First Semester 2026-2027',
        'academic_year' => '2026-2027',
        'semester_type' => SemesterType::FIRST,
        'start_date' => now()->startOfMonth(),
        'end_date' => now()->addMonths(4)->endOfMonth(),
        'is_current' => true,
    ]);

    $response = $this->actingAs($user)->get(route('instructor.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('instructor-dashboard')
        ->has('teacher')
        ->has('stats')
        ->has('today_classes')
        ->has('weekly_schedule')
        ->has('assigned_courses')
        ->where('teacher.id', $teacher->id)
    );
});

test('general dashboard route redirects teacher to instructor dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('Teacher');

    $teacher = Teacher::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('instructor.dashboard'));
});
