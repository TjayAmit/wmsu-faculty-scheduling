<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AssignScheduleController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DraftScheduleController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomScheduleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SubstituteRequestController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeachingHistoryController;
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

    // Room Schedules Routes
    Route::get('room-schedules', [RoomScheduleController::class, 'index'])->name('room-schedules.index');
    Route::get('room-schedules/create', [RoomScheduleController::class, 'create'])->name('room-schedules.create');
    Route::post('room-schedules', [RoomScheduleController::class, 'store'])->name('room-schedules.store');
    Route::get('room-schedules/{room_schedule}', [RoomScheduleController::class, 'show'])->name('room-schedules.show');
    Route::get('room-schedules/{room_schedule}/edit', [RoomScheduleController::class, 'edit'])->name('room-schedules.edit');
    Route::put('room-schedules/{room_schedule}', [RoomScheduleController::class, 'update'])->name('room-schedules.update');
    Route::delete('room-schedules/{room_schedule}', [RoomScheduleController::class, 'destroy'])->name('room-schedules.destroy');
    Route::get('room-schedules/calendar', [RoomScheduleController::class, 'calendar'])->name('room-schedules.calendar');

    // Curriculum Routes
    Route::get('curricula', [CurriculumController::class, 'index'])->name('curricula.index');
    Route::get('curricula/create', [CurriculumController::class, 'create'])->name('curricula.create');
    Route::post('curricula', [CurriculumController::class, 'store'])->name('curricula.store');
    Route::get('curricula/{curriculum}', [CurriculumController::class, 'show'])->name('curricula.show');
    Route::get('curricula/{curriculum}/edit', [CurriculumController::class, 'edit'])->name('curricula.edit');
    Route::put('curricula/{curriculum}', [CurriculumController::class, 'update'])->name('curricula.update');
    Route::delete('curricula/{curriculum}', [CurriculumController::class, 'destroy'])->name('curricula.destroy');

    // Departments Routes
    Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::get('departments/create', [DepartmentController::class, 'create'])->name('departments.create');
    Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::get('departments/{department}/edit', [DepartmentController::class, 'edit'])->name('departments.edit');
    Route::put('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

    // Programs Routes
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');
    Route::get('programs/create', [ProgramController::class, 'create'])->name('programs.create');
    Route::post('programs', [ProgramController::class, 'store'])->name('programs.store');
    Route::get('programs/{program}', [ProgramController::class, 'show'])->name('programs.show');
    Route::get('programs/{program}/edit', [ProgramController::class, 'edit'])->name('programs.edit');
    Route::put('programs/{program}', [ProgramController::class, 'update'])->name('programs.update');
    Route::delete('programs/{program}', [ProgramController::class, 'destroy'])->name('programs.destroy');

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

    // Teaching Histories Routes
    Route::get('teaching-histories', [TeachingHistoryController::class, 'index'])->name('teaching-histories.index');
    Route::get('teaching-histories/create', [TeachingHistoryController::class, 'create'])->name('teaching-histories.create');
    Route::post('teaching-histories', [TeachingHistoryController::class, 'store'])->name('teaching-histories.store');
    Route::get('teaching-histories/{teaching_history}', [TeachingHistoryController::class, 'show'])->name('teaching-histories.show');
    Route::get('teaching-histories/{teaching_history}/edit', [TeachingHistoryController::class, 'edit'])->name('teaching-histories.edit');
    Route::put('teaching-histories/{teaching_history}', [TeachingHistoryController::class, 'update'])->name('teaching-histories.update');
    Route::delete('teaching-histories/{teaching_history}', [TeachingHistoryController::class, 'destroy'])->name('teaching-histories.destroy');
    Route::post('teaching-histories/{teaching_history}/archive', [TeachingHistoryController::class, 'archive'])->name('teaching-histories.archive');
    Route::get('teaching-histories/teacher/{teacherId}', [TeachingHistoryController::class, 'teacherHistory'])->name('teaching-histories.teacher-history');

    // Substitute Requests Routes
    Route::get('substitute-requests', [SubstituteRequestController::class, 'index'])->name('substitute-requests.index');
    Route::get('substitute-requests/create', [SubstituteRequestController::class, 'create'])->name('substitute-requests.create');
    Route::post('substitute-requests', [SubstituteRequestController::class, 'store'])->name('substitute-requests.store');
    Route::get('substitute-requests/{substitute_request}', [SubstituteRequestController::class, 'show'])->name('substitute-requests.show');
    Route::get('substitute-requests/{substitute_request}/edit', [SubstituteRequestController::class, 'edit'])->name('substitute-requests.edit');
    Route::put('substitute-requests/{substitute_request}', [SubstituteRequestController::class, 'update'])->name('substitute-requests.update');
    Route::delete('substitute-requests/{substitute_request}', [SubstituteRequestController::class, 'destroy'])->name('substitute-requests.destroy');
    Route::post('substitute-requests/{substitute_request}/approve', [SubstituteRequestController::class, 'approve'])->name('substitute-requests.approve');
    Route::post('substitute-requests/{substitute_request}/reject', [SubstituteRequestController::class, 'reject'])->name('substitute-requests.reject');
    Route::post('substitute-requests/{substitute_request}/cancel', [SubstituteRequestController::class, 'cancel'])->name('substitute-requests.cancel');
    Route::get('substitute-requests/my-requests', [SubstituteRequestController::class, 'myRequests'])->name('substitute-requests.my-requests');

    // Leave Requests Routes
    Route::get('leave-requests', [LeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::get('leave-requests/create', [LeaveRequestController::class, 'create'])->name('leave-requests.create');
    Route::post('leave-requests', [LeaveRequestController::class, 'store'])->name('leave-requests.store');
    Route::get('leave-requests/{leave_request}', [LeaveRequestController::class, 'show'])->name('leave-requests.show');
    Route::get('leave-requests/{leave_request}/edit', [LeaveRequestController::class, 'edit'])->name('leave-requests.edit');
    Route::put('leave-requests/{leave_request}', [LeaveRequestController::class, 'update'])->name('leave-requests.update');
    Route::delete('leave-requests/{leave_request}', [LeaveRequestController::class, 'destroy'])->name('leave-requests.destroy');
    Route::post('leave-requests/{leave_request}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::post('leave-requests/{leave_request}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    Route::post('leave-requests/{leave_request}/cancel', [LeaveRequestController::class, 'cancel'])->name('leave-requests.cancel');
    Route::get('leave-requests/my-requests', [LeaveRequestController::class, 'myRequests'])->name('leave-requests.my-requests');

    // Sections Routes
    Route::get('sections', [SectionController::class, 'index'])->name('sections.index');
    Route::get('sections/create', [SectionController::class, 'create'])->name('sections.create');
    Route::post('sections', [SectionController::class, 'store'])->name('sections.store');
    Route::get('sections/{section}', [SectionController::class, 'show'])->name('sections.show');
    Route::get('sections/{section}/edit', [SectionController::class, 'edit'])->name('sections.edit');
    Route::put('sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::delete('sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::post('sections/{section}/toggle-status', [SectionController::class, 'toggleStatus'])->name('sections.toggle-status');
    Route::post('sections/{section}/assign-adviser', [SectionController::class, 'assignAdviser'])->name('sections.assign-adviser');

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
