<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AssignScheduleController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DraftScheduleController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeacherScheduleController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Users Routes
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Staff Routes (Faculty Staff Management)
    Route::get('staff', [StaffController::class, 'index'])->name('staff.index');
    Route::get('staff/create', [StaffController::class, 'create'])->name('staff.create');
    Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
    Route::get('staff/{user}', [StaffController::class, 'show'])->name('staff.show');
    Route::get('staff/{user}/edit', [StaffController::class, 'edit'])->name('staff.edit');
    Route::put('staff/{user}', [StaffController::class, 'update'])->name('staff.update');
    Route::delete('staff/{user}', [StaffController::class, 'destroy'])->name('staff.destroy');

    // Classrooms Routes
    Route::get('classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::get('classrooms/create', [ClassroomController::class, 'create'])->name('classrooms.create');
    Route::post('classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::get('classrooms/{classroom}', [ClassroomController::class, 'show'])->name('classrooms.show');
    Route::get('classrooms/{classroom}/edit', [ClassroomController::class, 'edit'])->name('classrooms.edit');
    Route::put('classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    // Curriculum Routes
    Route::get('curricula', [CurriculumController::class, 'index'])->name('curricula.index');
    Route::get('curricula/create', [CurriculumController::class, 'create'])->name('curricula.create');
    Route::post('curricula', [CurriculumController::class, 'store'])->name('curricula.store');
    Route::get('curricula/{curriculum}', [CurriculumController::class, 'show'])->name('curricula.show');
    Route::get('curricula/{curriculum}/edit', [CurriculumController::class, 'edit'])->name('curricula.edit');
    Route::put('curricula/{curriculum}', [CurriculumController::class, 'update'])->name('curricula.update');
    Route::delete('curricula/{curriculum}', [CurriculumController::class, 'destroy'])->name('curricula.destroy');

    // Teachers Routes
    Route::get('teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::get('teachers/create', [TeacherController::class, 'create'])->name('teachers.create');
    Route::post('teachers', [TeacherController::class, 'store'])->name('teachers.store');
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');
    Route::get('teachers/{teacher}/edit', [TeacherController::class, 'edit'])->name('teachers.edit');
    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');

    // Teacher User Account Linking Routes
    Route::prefix('teachers/{teacher}')->group(function () {
        Route::get('create-user-account', [TeacherController::class, 'showCreateUserAccountForm'])->name('teachers.create-user-account');
        Route::post('create-user-account', [TeacherController::class, 'createUserAccount']);
        Route::get('link-user-account', [TeacherController::class, 'showLinkUserAccountForm'])->name('teachers.link-user-account');
        Route::post('link-user-account', [TeacherController::class, 'linkUserAccount']);
        Route::delete('unlink-user-account', [TeacherController::class, 'unlinkUserAccount']);
    });

    // Subjects Routes
    Route::get('subjects', [SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/create', [SubjectController::class, 'create'])->name('subjects.create');
    Route::post('subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::get('subjects/{subject}', [SubjectController::class, 'show'])->name('subjects.show');
    Route::get('subjects/{subject}/edit', [SubjectController::class, 'edit'])->name('subjects.edit');
    Route::put('subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Schedules Routes
    Route::get('schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::get('schedules/create', [ScheduleController::class, 'create'])->name('schedules.create');
    Route::post('schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::get('schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
    Route::get('schedules/{schedule}/edit', [ScheduleController::class, 'edit'])->name('schedules.edit');
    Route::put('schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');

    // Semesters Routes
    Route::get('semesters', [SemesterController::class, 'index'])->name('semesters.index');
    Route::get('semesters/create', [SemesterController::class, 'create'])->name('semesters.create');
    Route::post('semesters', [SemesterController::class, 'store'])->name('semesters.store');
    Route::get('semesters/{semester}', [SemesterController::class, 'show'])->name('semesters.show');
    Route::get('semesters/{semester}/edit', [SemesterController::class, 'edit'])->name('semesters.edit');
    Route::put('semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
    Route::delete('semesters/{semester}', [SemesterController::class, 'destroy'])->name('semesters.destroy');

    // Time Slots Routes
    Route::get('time-slots', [TimeSlotController::class, 'index'])->name('time-slots.index');
    Route::get('time-slots/create', [TimeSlotController::class, 'create'])->name('time-slots.create');
    Route::post('time-slots', [TimeSlotController::class, 'store'])->name('time-slots.store');
    Route::get('time-slots/{timeSlot}', [TimeSlotController::class, 'show'])->name('time-slots.show');
    Route::get('time-slots/{timeSlot}/edit', [TimeSlotController::class, 'edit'])->name('time-slots.edit');
    Route::put('time-slots/{timeSlot}', [TimeSlotController::class, 'update'])->name('time-slots.update');
    Route::delete('time-slots/{timeSlot}', [TimeSlotController::class, 'destroy'])->name('time-slots.destroy');

    // Activity Logs Routes (Read-only)
    Route::get('activityLogs', [ActivityLogController::class, 'index'])->name('activityLogs.index');
    Route::get('activityLogs/{activityLog}', [ActivityLogController::class, 'show'])->name('activityLogs.show');
    Route::delete('activityLogs/{activityLog}', [ActivityLogController::class, 'destroy'])->name('activityLogs.destroy');

    // Roles Routes
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    // Draft Schedules Routes
    Route::get('draft-schedules', [DraftScheduleController::class, 'index'])->name('draft-schedules.index');
    Route::get('draft-schedules/create', [DraftScheduleController::class, 'create'])->name('draft-schedules.create');
    Route::post('draft-schedules', [DraftScheduleController::class, 'store'])->name('draft-schedules.store');
    Route::get('draft-schedules/{draftSchedule}', [DraftScheduleController::class, 'show'])->name('draft-schedules.show');
    Route::get('draft-schedules/{draftSchedule}/edit', [DraftScheduleController::class, 'edit'])->name('draft-schedules.edit');
    Route::put('draft-schedules/{draftSchedule}', [DraftScheduleController::class, 'update'])->name('draft-schedules.update');
    Route::delete('draft-schedules/{draftSchedule}', [DraftScheduleController::class, 'destroy'])->name('draft-schedules.destroy');
    Route::post('draft-schedules/{draftSchedule}/submit', [DraftScheduleController::class, 'submit'])->name('draft-schedules.submit');
    Route::post('draft-schedules/{draftSchedule}/approve', [DraftScheduleController::class, 'approve'])->name('draft-schedules.approve');
    Route::post('draft-schedules/{draftSchedule}/reject', [DraftScheduleController::class, 'reject'])->name('draft-schedules.reject');
    Route::get('my-drafts', [DraftScheduleController::class, 'myDrafts'])->name('draft-schedules.my-drafts');

    // Faculty Draft Schedules Routes (for faculty/admin review)
    Route::get('faculty-draft-schedules', [DraftScheduleController::class, 'facultyIndex'])->name('faculty-draft-schedules.index');
    Route::get('faculty-draft-schedules/{draftSchedule}', [DraftScheduleController::class, 'show'])->name('faculty-draft-schedules.show');
    Route::post('faculty-draft-schedules/{draftSchedule}/approve', [DraftScheduleController::class, 'approve'])->name('faculty-draft-schedules.approve');
    Route::post('faculty-draft-schedules/{draftSchedule}/reject', [DraftScheduleController::class, 'reject'])->name('faculty-draft-schedules.reject');

    // Teacher Schedules Routes
    Route::get('teacher-schedules', [TeacherScheduleController::class, 'index'])->name('teacher-schedules.index');
    Route::get('teacher-schedules/create', [TeacherScheduleController::class, 'create'])->name('teacher-schedules.create');
    Route::post('teacher-schedules', [TeacherScheduleController::class, 'store'])->name('teacher-schedules.store');
    Route::get('teacher-schedules/{teacherSchedule}', [TeacherScheduleController::class, 'show'])->name('teacher-schedules.show');
    Route::get('teacher-schedules/{teacherSchedule}/edit', [TeacherScheduleController::class, 'edit'])->name('teacher-schedules.edit');
    Route::put('teacher-schedules/{teacherSchedule}', [TeacherScheduleController::class, 'update'])->name('teacher-schedules.update');
    Route::delete('teacher-schedules/{teacherSchedule}', [TeacherScheduleController::class, 'destroy'])->name('teacher-schedules.destroy');
    Route::post('teacher-schedules/{teacherSchedule}/cancel', [TeacherScheduleController::class, 'cancel'])->name('teacher-schedules.cancel');
    Route::post('teacher-schedules/{teacherSchedule}/complete', [TeacherScheduleController::class, 'complete'])->name('teacher-schedules.complete');
    Route::post('teacher-schedules/regenerate/{draftScheduleId}', [TeacherScheduleController::class, 'regenerateFromDraft'])->name('teacher-schedules.regenerate');
    Route::get('teacher-schedules/teacher/{teacherId}/semester/{semesterId}', [TeacherScheduleController::class, 'teacherSemesterSchedules'])->name('teacher-schedules.teacher-semester');

    // Assign Schedules Routes (Admin direct assignment with auto-approval)
    Route::get('assign-schedules', [AssignScheduleController::class, 'index'])->name('assign-schedules.index');
    Route::get('assign-schedules/create', [AssignScheduleController::class, 'create'])->name('assign-schedules.create');
    Route::post('assign-schedules', [AssignScheduleController::class, 'store'])->name('assign-schedules.store');
    Route::get('assign-schedules/{draftSchedule}', [AssignScheduleController::class, 'show'])->name('assign-schedules.show');
    Route::delete('assign-schedules/{draftSchedule}', [AssignScheduleController::class, 'destroy'])->name('assign-schedules.destroy');
});

if (app()->environment('local')) {
    Route::middleware('auth')
        ->post('/dev/switch-user/{user}', [\App\Http\Controllers\Dev\SwitchUserController::class, '__invoke'])
        ->name('dev.switch-user');
}

require __DIR__.'/settings.php';
