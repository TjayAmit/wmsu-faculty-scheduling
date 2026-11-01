<?php

use App\Models\Teacher;
use App\Models\TeachingHistory;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Teacher']);
    Role::firstOrCreate(['name' => 'Admin']);
});

test('teacher cannot access create teaching history route', function () {
    $user = User::factory()->create();
    $user->assignRole('Teacher');

    Teacher::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('teaching-histories.create'));

    $response->assertForbidden();
});

test('teacher cannot store manual teaching history record', function () {
    $user = User::factory()->create();
    $user->assignRole('Teacher');

    $teacher = Teacher::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('teaching-histories.store'), [
        'teacher_id' => $teacher->id,
        'semester_id' => 1,
        'subject_id' => 1,
        'hours_assigned' => 54,
        'hours_completed' => 54,
        'status' => 'completed',
    ]);

    $response->assertForbidden();
});

test('teacher visiting teaching history sees isTeacherRole true and canCreate false', function () {
    $user = User::factory()->create();
    $user->assignRole('Teacher');

    $teacher = Teacher::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('teaching-histories.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('teaching-histories/index')
        ->where('isTeacherRole', true)
        ->where('canCreate', false)
    );
});
