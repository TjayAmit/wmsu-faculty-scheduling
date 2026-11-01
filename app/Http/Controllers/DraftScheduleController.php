<?php

namespace App\Http\Controllers;

use App\Http\Requests\DraftScheduleRequest;
use App\Models\DraftSchedule;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Teacher;
use App\Services\DraftScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DraftScheduleController extends Controller
{
    public function __construct(
        protected DraftScheduleService $service
    ) {}

    protected function isTeacherUser(): bool
    {
        $user = auth()->user();
        if (! $user) {
            return false;
        }

        if ($user->hasAnyRole(['Admin', 'admin', 'Faculty Admin', 'faculty_admin'])) {
            return false;
        }

        return $user->hasRole('Teacher') || $user->hasRole('teacher') || $user->isTeacher();
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $isTeacher = $this->isTeacherUser();
        $currentTeacher = $user?->teacher;

        $query = DraftSchedule::query()
            ->with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer']);

        if ($isTeacher) {
            // A teacher can ONLY see their own schedule requests
            $query->where('teacher_id', $currentTeacher?->id ?? 0);
        } elseif ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $teachers = $isTeacher && $currentTeacher
            ? Teacher::where('id', $currentTeacher->id)->with('user')->get()
            : Teacher::active()->with('user')->get();

        $currentSemester = Semester::where('is_current', true)->first();

        $schedulesQuery = Schedule::with(['subject', 'semester', 'classroom', 'teacherAssignment.teacher.user'])
            ->where('is_active', true);

        if ($currentSemester) {
            $hasCurrentSemesterSchedules = (clone $schedulesQuery)->where('semester_id', $currentSemester->id)->exists();
            if ($hasCurrentSemesterSchedules) {
                $schedulesQuery->where('semester_id', $currentSemester->id);
            }
        }

        $existingDrafts = $currentTeacher
            ? DraftSchedule::where('teacher_id', $currentTeacher->id)->pluck('status', 'schedule_id')->toArray()
            : [];

        $schedules = $schedulesQuery->get()->map(function ($s) use ($currentTeacher, $existingDrafts, $isTeacher) {
            $isAssigned = $s->teacherAssignment !== null && $s->teacherAssignment->is_active;
            $assignedTeacherId = $s->teacherAssignment?->teacher_id;
            $assignedTeacherName = $s->teacherAssignment?->teacher?->full_name ?? $s->teacherAssignment?->teacher?->user?->name;

            $isAssignedToCurrent = $currentTeacher && $assignedTeacherId === $currentTeacher->id;
            $hasDraft = isset($existingDrafts[$s->id]);
            $rawDraftStatus = $hasDraft ? $existingDrafts[$s->id] : null;
            $draftStatus = is_object($rawDraftStatus) ? $rawDraftStatus->value : $rawDraftStatus;

            // A schedule is already taken by the current teacher if assigned to them or approved/pending draft exists
            $isAlreadyInUserSchedule = $isAssignedToCurrent || in_array($draftStatus, ['approved', 'pending_review']);

            return [
                'id' => $s->id,
                'subject_code' => $s->subject?->code ?? 'N/A',
                'subject_title' => $s->subject?->title ?? 'No title',
                'units' => $s->subject?->units,
                'section' => $s->section,
                'room' => $s->classroom ? ($s->classroom->full_identifier ?? $s->classroom->room_number) : ($s->room ?? 'TBA'),
                'semester_name' => $s->semester?->name,
                'is_assigned' => $isAssigned,
                'assigned_teacher_id' => $assignedTeacherId,
                'assigned_teacher_name' => $assignedTeacherName,
                'is_assigned_to_current' => $isAssignedToCurrent,
                'has_user_draft' => $hasDraft,
                'user_draft_status' => $draftStatus,
                'is_disabled_for_teacher' => (bool) ($isTeacher && ($isAlreadyInUserSchedule || ($isAssigned && ! $isAssignedToCurrent))),
                'subject' => $s->subject ? [
                    'id' => $s->subject->id,
                    'code' => $s->subject->code,
                    'title' => $s->subject->title,
                    'units' => $s->subject->units,
                ] : null,
                'semester' => $s->semester ? [
                    'id' => $s->semester->id,
                    'name' => $s->semester->name,
                    'academic_year' => $s->semester->academic_year,
                ] : null,
            ];
        });

        return Inertia::render('draft-schedules/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'teacher_id', 'per_page']),
            'teachers' => $teachers,
            'schedules' => $schedules,
            'isTeacherRole' => (bool) $isTeacher,
            'currentTeacher' => $currentTeacher ? [
                'id' => $currentTeacher->id,
                'name' => $currentTeacher->full_name || $currentTeacher->user?->name || "Teacher #{$currentTeacher->id}",
            ] : null,
        ]);
    }

    public function create()
    {
        return redirect()->route('draft-schedules.index', ['create' => 1]);
    }

    public function store(DraftScheduleRequest $request)
    {
        if ($this->isTeacherUser()) {
            $currentTeacher = auth()->user()->teacher;
            if (! $currentTeacher) {
                return back()->with('error', 'Teacher profile not found for this account.');
            }
            $request->merge(['teacher_id' => $currentTeacher->id]);

            $existing = DraftSchedule::where('teacher_id', $currentTeacher->id)
                ->where('schedule_id', $request->schedule_id)
                ->whereIn('status', ['draft', 'pending_review', 'approved'])
                ->first();

            if ($existing) {
                return back()->withErrors(['schedule_id' => 'You already have an active or approved request for this course schedule.']);
            }
        }

        $this->service->createFromRequest($request);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule created successfully');
    }

    public function show(DraftSchedule $draftSchedule)
    {
        $draftSchedule->load([
            'teacher.user',
            'schedule.subject',
            'schedule.semester',
            'schedule.classroom',
            'reviewer',
            'teacherAssignment.assignedBy',
        ]);

        $timeSlotIds = collect($draftSchedule->schedule?->time_slots ?? [])
            ->pluck('time_slot_id')
            ->filter()
            ->unique()
            ->values();

        $timeSlotsMap = \App\Models\TimeSlot::whereIn('id', $timeSlotIds)->get()->keyBy('id');

        $resolvedTimeSlots = collect($draftSchedule->schedule?->time_slots ?? [])->map(function ($slot) use ($timeSlotsMap) {
            $ts = isset($slot['time_slot_id']) ? $timeSlotsMap->get($slot['time_slot_id']) : null;

            return [
                'day' => $slot['day'] ?? null,
                'time_slot_id' => $slot['time_slot_id'] ?? null,
                'name' => $ts?->name,
                'start_time' => $ts?->start_time,
                'end_time' => $ts?->end_time,
            ];
        })->values();

        $generatedSessions = \App\Models\TeacherSchedule::where('draft_schedule_id', $draftSchedule->id)
            ->orderBy('scheduled_date')
            ->get();

        return Inertia::render('draft-schedules/show', [
            'draftSchedule' => $draftSchedule,
            'resolvedTimeSlots' => $resolvedTimeSlots,
            'generatedSessions' => $generatedSessions,
        ]);
    }

    public function edit(DraftSchedule $draftSchedule)
    {
        return redirect()->route('draft-schedules.index', ['edit' => $draftSchedule->id]);
    }

    public function update(DraftScheduleRequest $request, DraftSchedule $draftSchedule)
    {
        if ($this->isTeacherUser()) {
            $currentTeacher = auth()->user()->teacher;
            if (! $currentTeacher || $draftSchedule->teacher_id !== $currentTeacher->id) {
                abort(403, 'Unauthorized to modify this schedule request.');
            }
            $request->merge(['teacher_id' => $currentTeacher->id]);
        }

        $this->service->updateFromRequest($draftSchedule->id, $request);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule updated successfully');
    }

    public function destroy(DraftSchedule $draftSchedule)
    {
        if ($this->isTeacherUser()) {
            $currentTeacher = auth()->user()->teacher;
            if (! $currentTeacher || $draftSchedule->teacher_id !== $currentTeacher->id) {
                abort(403, 'Unauthorized to delete this schedule request.');
            }
        }

        $this->service->delete($draftSchedule->id);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule deleted successfully');
    }

    public function submit(DraftSchedule $draftSchedule)
    {
        if ($this->isTeacherUser()) {
            $currentTeacher = auth()->user()->teacher;
            if (! $currentTeacher || $draftSchedule->teacher_id !== $currentTeacher->id) {
                abort(403, 'Unauthorized action.');
            }
        }

        $this->service->submitForReview($draftSchedule->id);

        return redirect()->route('draft-schedules.show', $draftSchedule->id)->with('success', 'Draft schedule submitted for review');
    }

    public function approve(Request $request, DraftSchedule $draftSchedule)
    {
        if ($this->isTeacherUser()) {
            abort(403, 'Teachers cannot approve schedule requests.');
        }

        $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        $this->service->approve($draftSchedule->id, $request->comments);

        return redirect()->route('draft-schedules.show', $draftSchedule->id)->with('success', 'Draft schedule approved');
    }

    public function reject(Request $request, DraftSchedule $draftSchedule)
    {
        if ($this->isTeacherUser()) {
            abort(403, 'Teachers cannot reject schedule requests.');
        }

        $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        $this->service->reject($draftSchedule->id, $request->comments);

        return redirect()->route('draft-schedules.show', $draftSchedule->id)->with('success', 'Draft schedule rejected');
    }

    /**
     * Display all draft schedules for faculty/admin review.
     */
    public function facultyIndex(Request $request)
    {
        $query = DraftSchedule::query()
            ->with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('faculty-draft-schedules/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'per_page']),
        ]);
    }

    public function myDrafts(Request $request)
    {
        $teacher = auth()->user()->teacher;

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', 'Teacher profile not found');
        }

        $query = DraftSchedule::query()
            ->where('teacher_id', $teacher->id)
            ->with(['schedule.subject', 'schedule.semester', 'reviewer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('draft-schedules/my-drafts', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'per_page']),
        ]);
    }
}
