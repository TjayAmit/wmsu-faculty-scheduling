<?php

namespace App\Http\Controllers;

use App\Enums\EmploymentType;
use App\Http\Requests\TeacherRequest;
use App\Models\Department;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Services\TeacherService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherService $service
    ) {}

    public function index(Request $request)
    {
        $query = Teacher::with('user')
            ->withCount(['assignments as active_assignments_count' => function ($q) {
                $q->where('is_active', true);
            }])
            ->when($request->boolean('without_user'), function ($q) {
                return $q->withoutUser();
            });

        if ($request->has('workload')) {
            if ($request->workload === 'assigned') {
                $query->has('activeAssignments');
            } elseif ($request->workload === 'unassigned') {
                $query->doesntHave('activeAssignments');
            }
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('employee_id', 'like', '%'.$search.'%')
                    ->orWhere('department', 'like', '%'.$search.'%');
            });
        }

        $totalTeachers = Teacher::count();
        $assignedTeachers = Teacher::has('activeAssignments')->count();
        $unassignedTeachers = Teacher::doesntHave('activeAssignments')->count();
        $totalCourseOfferings = Schedule::where('is_active', true)->count();

        return Inertia::render('teachers/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page', 'without_user', 'workload', 'employment_type']),
            'stats' => [
                'total_teachers' => $totalTeachers,
                'assigned_teachers' => $assignedTeachers,
                'unassigned_teachers' => $unassignedTeachers,
                'total_course_offerings' => $totalCourseOfferings,
            ],
            'employmentTypes' => collect(EmploymentType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $userDepartment = $user?->department ?? ($user?->teacher?->department ? Department::where('name', $user->teacher->department)->first() : null);

        return Inertia::render('teachers/create', [
            'employmentTypes' => collect(EmploymentType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
            'userDepartment' => $userDepartment ? [
                'id' => $userDepartment->id,
                'code' => $userDepartment->code,
                'name' => $userDepartment->name,
            ] : null,
        ]);
    }

    public function store(TeacherRequest $request)
    {
        $user = $request->user();
        $userDepartment = $user?->department ?? ($user?->teacher?->department ? Department::where('name', $user->teacher->department)->first() : null);

        // If the authenticated staff member has an assigned department, enforce it
        if ($userDepartment) {
            $request->merge(['department' => $userDepartment->name]);
        }

        $this->service->createFromRequest($request);

        return redirect()->route('teachers.index')->with('success', 'Teacher created successfully');
    }

    public function show(Teacher $teacher)
    {
        $teacher->load([
            'user.roles',
            'assignments' => function ($q) {
                $q->where('is_active', true)
                    ->with(['schedule.subject', 'schedule.semester', 'schedule.classroom']);
            },
            'draftSchedules' => function ($q) {
                $q->where('status', 'approved')
                    ->with(['schedule.subject', 'schedule.semester', 'reviewer'])
                    ->latest();
            },
        ]);

        // Build weekly schedule grid (Monday to Sunday)
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $weeklySchedule = array_fill_keys($days, []);

        $totalWeeklyHours = 0;
        $totalUnits = 0;
        $activeAssignmentsList = [];

        foreach ($teacher->assignments as $assignment) {
            $schedule = $assignment->schedule;
            if (! $schedule) {
                continue;
            }

            $subject = $schedule->subject;
            $semester = $schedule->semester;
            $classroom = $schedule->classroom;
            $roomLabel = $classroom ? "{$classroom->building} {$classroom->room_number}" : ($schedule->room ?? 'TBA');
            $timeSlots = $schedule->time_slots ?? [];

            $totalUnits += (float) ($subject->units ?? 0);

            // Find matching approved draft schedule for removal action if needed
            $draftSchedule = $teacher->draftSchedules->firstWhere('schedule_id', $schedule->id);

            $assignmentItem = [
                'id' => $assignment->id,
                'draft_schedule_id' => $draftSchedule?->id,
                'schedule_id' => $schedule->id,
                'subject_code' => $subject->code ?? '',
                'subject_title' => $subject->title ?? '',
                'units' => $subject->units ?? 0,
                'section' => $schedule->section ?? '',
                'room' => $roomLabel,
                'semester' => $semester?->name ?? '',
                'time_slots' => $timeSlots,
                'assigned_at' => $assignment->assigned_at,
            ];
            $activeAssignmentsList[] = $assignmentItem;

            foreach ($timeSlots as $slot) {
                $dayKey = strtolower($slot['day'] ?? '');
                if (! array_key_exists($dayKey, $weeklySchedule)) {
                    continue;
                }

                $startTime = $slot['start'] ?? $slot['start_time'] ?? '';
                $endTime = $slot['end'] ?? $slot['end_time'] ?? '';

                if ($startTime && $endTime) {
                    try {
                        $start = Carbon::parse($startTime);
                        $end = Carbon::parse($endTime);
                        $totalWeeklyHours += round($end->diffInMinutes($start) / 60, 2);
                    } catch (\Exception $e) {
                    }
                }

                $weeklySchedule[$dayKey][] = [
                    'assignment_id' => $assignment->id,
                    'draft_schedule_id' => $draftSchedule?->id,
                    'schedule_id' => $schedule->id,
                    'subject_code' => $subject->code ?? '',
                    'subject_title' => $subject->title ?? '',
                    'section' => $schedule->section ?? '',
                    'room' => $roomLabel,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'semester' => $semester?->name ?? '',
                ];
            }
        }

        // Sort each day's sessions by start time
        foreach ($weeklySchedule as $day => &$sessions) {
            usort($sessions, fn ($a, $b) => strcmp($a['start_time'], $b['start_time']));
        }

        // Available unassigned schedules for fast assignment
        $availableSchedules = Schedule::with(['subject', 'semester', 'classroom'])
            ->where('is_active', true)
            ->whereDoesntHave('teacherAssignment', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => ($s->subject->code ?? '').' - '.($s->subject->title ?? '').' ('.($s->section ?? '').')',
                'subject_code' => $s->subject->code ?? '',
                'subject_title' => $s->subject->title ?? '',
                'units' => $s->subject->units ?? 0,
                'section' => $s->section,
                'room' => $s->room,
                'time_slots' => $s->time_slots ?? [],
                'semester' => $s->semester->name ?? '',
            ]);

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
            'activeAssignments' => $activeAssignmentsList,
            'weeklySchedule' => $weeklySchedule,
            'workload' => [
                'total_courses' => count($activeAssignmentsList),
                'total_units' => $totalUnits,
                'total_weekly_hours' => round($totalWeeklyHours, 1),
            ],
            'availableSchedules' => $availableSchedules,
            'availableRoles' => Role::all()->pluck('name')->toArray(),
        ]);
    }

    public function edit(Teacher $teacher, Request $request)
    {
        $teacher->load('user');
        $users = User::whereDoesntHave('teacher')
            ->orWhere('id', $teacher->user_id)
            ->get(['id', 'name', 'email']);

        $user = $request->user();
        $userDepartment = $user?->department ?? ($user?->teacher?->department ? Department::where('name', $user->teacher->department)->first() : null);

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
            'users' => $users,
            'employmentTypes' => collect(EmploymentType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
            'userDepartment' => $userDepartment ? [
                'id' => $userDepartment->id,
                'code' => $userDepartment->code,
                'name' => $userDepartment->name,
            ] : null,
        ]);
    }

    public function update(TeacherRequest $request, Teacher $teacher)
    {
        $this->service->updateFromRequest($teacher->id, $request);

        return redirect()->route('teachers.index')->with('success', 'Teacher updated successfully');
    }

    public function destroy(Teacher $teacher)
    {
        $this->service->delete($teacher->id);

        return redirect()->route('teachers.index')->with('success', 'Teacher deleted successfully');
    }

    /**
     * Create user account for existing teacher.
     */
    public function createUserAccount(Request $request, Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher already has a user account');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ]);

        try {
            DB::beginTransaction();

            $email = $request->input('email', $teacher->email) ?: $teacher->email;

            // Check if email is already taken by another user
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                return redirect()->back()->with('error', 'A user account with email "'.$email.'" already exists.');
            }

            // If teacher email was updated in the form, sync it with teacher record
            if ($email !== $teacher->email) {
                $teacher->email = $email;
            }

            $user = User::create([
                'name' => $request->input('name', $teacher->full_name),
                'email' => $email,
                'password' => Hash::make($request->input('password')),
            ]);

            // Assign Teacher role automatically
            $roles = $request->input('roles', []);
            if (empty($roles)) {
                $roles = ['Teacher'];
            } elseif (!in_array('Teacher', $roles)) {
                $roles[] = 'Teacher';
            }
            $user->assignRole($roles);

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account created successfully with Teacher role');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to create user account: '.$e->getMessage());
        }
    }

    /**
     * Link existing user to teacher.
     */
    public function linkUserAccount(Request $request, Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher already has a user account');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id|unique:teachers,user_id',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($request->input('user_id'));

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            // Assign roles if provided
            if ($request->has('roles')) {
                $user->assignRole($request->input('roles'));
            }

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account linked successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to link user account: '.$e->getMessage());
        }
    }

    /**
     * Unlink user account from teacher.
     */
    public function unlinkUserAccount(Teacher $teacher)
    {
        if (! $teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher does not have a user account');
        }

        try {
            DB::beginTransaction();

            $teacher->user_id = null;
            $teacher->save();

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account unlinked successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to unlink user account: '.$e->getMessage());
        }
    }

    /**
     * Show user account creation form for teacher.
     */
    public function showCreateUserAccountForm(Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->route('teachers.show', $teacher)->with('error', 'Teacher already has a user account');
        }

        return Inertia::render('teachers/create-user-account', [
            'teacher' => $teacher,
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Self-service: Teacher-role user claims an unlinked teacher profile.
     */
    public function claimProfile(Request $request)
    {
        $request->validate(['teacher_id' => 'required|exists:teachers,id']);

        $teacher = Teacher::findOrFail($request->teacher_id);

        if ($teacher->hasUserAccount()) {
            return back()->with('error', 'This teacher profile is already linked to another account.');
        }

        $user = auth()->user();

        if ($user->teacher) {
            return back()->with('error', 'Your account is already linked to a teacher profile.');
        }

        $teacher->user_id = $user->id;
        $teacher->save();

        return redirect()->route('dashboard');
    }

    /**
     * Show user account linking form for teacher.
     */
    public function showLinkUserAccountForm(Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->route('teachers.show', $teacher)->with('error', 'Teacher already has a user account');
        }

        $availableUsers = User::whereDoesntHave('teacher')->get(['id', 'name', 'email']);

        return Inertia::render('teachers/link-user-account', [
            'teacher' => $teacher,
            'availableUsers' => $availableUsers,
            'roles' => Role::all()->pluck('name'),
        ]);
    }
}
