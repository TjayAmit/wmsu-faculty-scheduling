<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Users Routes
    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [App\Http\Controllers\UserController::class, 'create'])->name('users.create');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [App\Http\Controllers\UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    // Teachers Routes
    Route::get('teachers', [App\Http\Controllers\TeacherController::class, 'index'])->name('teachers.index');
    Route::get('teachers/create', [App\Http\Controllers\TeacherController::class, 'create'])->name('teachers.create');
    Route::post('teachers', [App\Http\Controllers\TeacherController::class, 'store'])->name('teachers.store');
    Route::get('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'show'])->name('teachers.show');
    Route::get('teachers/{teacher}/edit', [App\Http\Controllers\TeacherController::class, 'edit'])->name('teachers.edit');
    Route::put('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'destroy'])->name('teachers.destroy');

    // Subjects Routes
    Route::get('subjects', [App\Http\Controllers\SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/create', [App\Http\Controllers\SubjectController::class, 'create'])->name('subjects.create');
    Route::post('subjects', [App\Http\Controllers\SubjectController::class, 'store'])->name('subjects.store');
    Route::get('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'show'])->name('subjects.show');
    Route::get('subjects/{subject}/edit', [App\Http\Controllers\SubjectController::class, 'edit'])->name('subjects.edit');
    Route::put('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Schedules Routes
    Route::get('schedules', [App\Http\Controllers\ScheduleController::class, 'index'])->name('schedules.index');
    Route::get('schedules/create', [App\Http\Controllers\ScheduleController::class, 'create'])->name('schedules.create');
    Route::post('schedules', [App\Http\Controllers\ScheduleController::class, 'store'])->name('schedules.store');
    Route::get('schedules/{schedule}', [App\Http\Controllers\ScheduleController::class, 'show'])->name('schedules.show');
    Route::get('schedules/{schedule}/edit', [App\Http\Controllers\ScheduleController::class, 'edit'])->name('schedules.edit');
    Route::put('schedules/{schedule}', [App\Http\Controllers\ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('schedules/{schedule}', [App\Http\Controllers\ScheduleController::class, 'destroy'])->name('schedules.destroy');

    // Semesters Routes
    Route::get('semesters', [App\Http\Controllers\SemesterController::class, 'index'])->name('semesters.index');
    Route::get('semesters/create', [App\Http\Controllers\SemesterController::class, 'create'])->name('semesters.create');
    Route::post('semesters', [App\Http\Controllers\SemesterController::class, 'store'])->name('semesters.store');
    Route::get('semesters/{semester}', [App\Http\Controllers\SemesterController::class, 'show'])->name('semesters.show');
    Route::get('semesters/{semester}/edit', [App\Http\Controllers\SemesterController::class, 'edit'])->name('semesters.edit');
    Route::put('semesters/{semester}', [App\Http\Controllers\SemesterController::class, 'update'])->name('semesters.update');
    Route::delete('semesters/{semester}', [App\Http\Controllers\SemesterController::class, 'destroy'])->name('semesters.destroy');

    // TimeSlots Routes
    Route::get('timeSlots', [App\Http\Controllers\TimeSlotController::class, 'index'])->name('timeSlots.index');
    Route::get('timeSlots/create', [App\Http\Controllers\TimeSlotController::class, 'create'])->name('timeSlots.create');
    Route::post('timeSlots', [App\Http\Controllers\TimeSlotController::class, 'store'])->name('timeSlots.store');
    Route::get('timeSlots/{timeSlot}', [App\Http\Controllers\TimeSlotController::class, 'show'])->name('timeSlots.show');
    Route::get('timeSlots/{timeSlot}/edit', [App\Http\Controllers\TimeSlotController::class, 'edit'])->name('timeSlots.edit');
    Route::put('timeSlots/{timeSlot}', [App\Http\Controllers\TimeSlotController::class, 'update'])->name('timeSlots.update');
    Route::delete('timeSlots/{timeSlot}', [App\Http\Controllers\TimeSlotController::class, 'destroy'])->name('timeSlots.destroy');

    // Activity Logs Routes (Read-only)
    Route::get('activityLogs', [App\Http\Controllers\ActivityLogController::class, 'index'])->name('activityLogs.index');
    Route::get('activityLogs/{activityLog}', [App\Http\Controllers\ActivityLogController::class, 'show'])->name('activityLogs.show');
    Route::delete('activityLogs/{activityLog}', [App\Http\Controllers\ActivityLogController::class, 'destroy'])->name('activityLogs.destroy');

    // Roles Routes
    Route::get('roles', [App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [App\Http\Controllers\RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [App\Http\Controllers\RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}', [App\Http\Controllers\RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [App\Http\Controllers\RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [App\Http\Controllers\RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy');

    // Draft Schedules Routes
    Route::get('draft-schedules', [App\Http\Controllers\DraftScheduleController::class, 'index'])->name('draft-schedules.index');
    Route::get('draft-schedules/create', [App\Http\Controllers\DraftScheduleController::class, 'create'])->name('draft-schedules.create');
    Route::post('draft-schedules', [App\Http\Controllers\DraftScheduleController::class, 'store'])->name('draft-schedules.store');
    Route::get('draft-schedules/{draftSchedule}', [App\Http\Controllers\DraftScheduleController::class, 'show'])->name('draft-schedules.show');
    Route::get('draft-schedules/{draftSchedule}/edit', [App\Http\Controllers\DraftScheduleController::class, 'edit'])->name('draft-schedules.edit');
    Route::put('draft-schedules/{draftSchedule}', [App\Http\Controllers\DraftScheduleController::class, 'update'])->name('draft-schedules.update');
    Route::delete('draft-schedules/{draftSchedule}', [App\Http\Controllers\DraftScheduleController::class, 'destroy'])->name('draft-schedules.destroy');
    Route::post('draft-schedules/{draftSchedule}/submit', [App\Http\Controllers\DraftScheduleController::class, 'submit'])->name('draft-schedules.submit');
    Route::post('draft-schedules/{draftSchedule}/approve', [App\Http\Controllers\DraftScheduleController::class, 'approve'])->name('draft-schedules.approve');
    Route::post('draft-schedules/{draftSchedule}/reject', [App\Http\Controllers\DraftScheduleController::class, 'reject'])->name('draft-schedules.reject');
    Route::get('my-drafts', [App\Http\Controllers\DraftScheduleController::class, 'myDrafts'])->name('draft-schedules.my-drafts');

    // Faculty Draft Schedules Routes (for faculty/admin review)
    Route::get('faculty-draft-schedules', [App\Http\Controllers\DraftScheduleController::class, 'facultyIndex'])->name('faculty-draft-schedules.index');
    Route::get('faculty-draft-schedules/{draftSchedule}', [App\Http\Controllers\DraftScheduleController::class, 'show'])->name('faculty-draft-schedules.show');
    Route::post('faculty-draft-schedules/{draftSchedule}/approve', [App\Http\Controllers\DraftScheduleController::class, 'approve'])->name('faculty-draft-schedules.approve');
    Route::post('faculty-draft-schedules/{draftSchedule}/reject', [App\Http\Controllers\DraftScheduleController::class, 'reject'])->name('faculty-draft-schedules.reject');

    // Teacher Schedules Routes
    Route::get('teacher-schedules', [App\Http\Controllers\TeacherScheduleController::class, 'index'])->name('teacher-schedules.index');
    Route::get('teacher-schedules/create', [App\Http\Controllers\TeacherScheduleController::class, 'create'])->name('teacher-schedules.create');
    Route::post('teacher-schedules', [App\Http\Controllers\TeacherScheduleController::class, 'store'])->name('teacher-schedules.store');
    Route::get('teacher-schedules/{teacherSchedule}', [App\Http\Controllers\TeacherScheduleController::class, 'show'])->name('teacher-schedules.show');
    Route::get('teacher-schedules/{teacherSchedule}/edit', [App\Http\Controllers\TeacherScheduleController::class, 'edit'])->name('teacher-schedules.edit');
    Route::put('teacher-schedules/{teacherSchedule}', [App\Http\Controllers\TeacherScheduleController::class, 'update'])->name('teacher-schedules.update');
    Route::delete('teacher-schedules/{teacherSchedule}', [App\Http\Controllers\TeacherScheduleController::class, 'destroy'])->name('teacher-schedules.destroy');
    Route::post('teacher-schedules/{teacherSchedule}/cancel', [App\Http\Controllers\TeacherScheduleController::class, 'cancel'])->name('teacher-schedules.cancel');
    Route::post('teacher-schedules/{teacherSchedule}/complete', [App\Http\Controllers\TeacherScheduleController::class, 'complete'])->name('teacher-schedules.complete');
    Route::post('teacher-schedules/regenerate/{draftScheduleId}', [App\Http\Controllers\TeacherScheduleController::class, 'regenerateFromDraft'])->name('teacher-schedules.regenerate');
    Route::get('teacher-schedules/teacher/{teacherId}/semester/{semesterId}', [App\Http\Controllers\TeacherScheduleController::class, 'teacherSemesterSchedules'])->name('teacher-schedules.teacher-semester');
});

require __DIR__.'/settings.php';
