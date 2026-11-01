<?php

namespace App\Http\Controllers;

use App\Models\DraftSchedule;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Services\TeacherScheduleGenerationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignScheduleController extends Controller
{
    public function __construct(
        private TeacherScheduleGenerationService $generationService
    ) {}

    /**
     * Display a listing of assigned schedules.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['teacher_id', 'schedule_id', 'per_page']);

        $query = DraftSchedule::query()
            ->with(['teacher.user', 'schedule.subject', 'schedule.semester'])
            ->where('status', 'approved');

        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (isset($filters['schedule_id'])) {
            $query->where('schedule_id', $filters['schedule_id']);
        }

        $schedules = $query->latest()->paginate($filters['per_page'] ?? 10)->withQueryString();

        return Inertia::render('assign-schedules/index', [
            'data' => $schedules,
            'filters' => $filters,
            'teachers' => Teacher::with('user')->get()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->user?->name ?? $t->full_name,
            ]),
            'availableSchedules' => Schedule::with(['subject', 'semester'])
                ->where('is_active', true)
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->subject->code.' - '.$s->subject->title.' ('.$s->semester->name.')',
                ]),
        ]);
    }

    /**
     * Show the form for creating a new assigned schedule.
     */
    public function create(Request $request): Response
    {
        $selectedTeacherId = $request->query('teacher_id');
        $selectedScheduleId = $request->query('schedule_id');

        $teachers = Teacher::with('user')
            ->withCount(['assignments as active_assignments_count' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('active_assignments_count', 'asc')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->user?->name ?? $t->full_name,
                'rank' => $t->rank,
                'department' => $t->department,
                'employment_type' => $t->employment_type,
                'active_assignments_count' => $t->active_assignments_count,
            ]);

        $schedules = Schedule::with(['subject', 'semester', 'classroom', 'teacherAssignment.teacher.user'])
            ->where('is_active', true)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->subject->code.' - '.$s->subject->title,
                'subject_code' => $s->subject->code,
                'subject_title' => $s->subject->title,
                'units' => $s->subject->units,
                'section' => $s->section,
                'room' => $s->classroom ? "{$s->classroom->building} {$s->classroom->room_number}" : ($s->room ?? 'TBA'),
                'semester' => $s->semester->name,
                'timeSlots' => $s->time_slots ?? [],
                'is_assigned' => $s->teacherAssignment !== null && $s->teacherAssignment->is_active,
                'assigned_teacher' => $s->teacherAssignment?->teacher?->full_name,
            ]);

        return Inertia::render('assign-schedules/create', [
            'teachers' => $teachers,
            'schedules' => $schedules,
            'selectedTeacherId' => $selectedTeacherId,
            'selectedScheduleId' => $selectedScheduleId,
        ]);
    }

    /**
     * Store a newly assigned schedule with automatic approval.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'schedule_id' => 'required|exists:schedules,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Create draft schedule with approved status immediately
        $draftSchedule = DraftSchedule::create([
            'teacher_id' => $validated['teacher_id'],
            'schedule_id' => $validated['schedule_id'],
            'status' => 'approved',
            'notes' => $validated['notes'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'review_comments' => 'Auto-approved by faculty admin assignment',
        ]);

        // Immediately generate teacher schedules
        try {
            $this->generationService->generateFromDraft($draftSchedule);

            return redirect()->route('teachers.show', $validated['teacher_id'])
                ->with('success', 'Course schedule assigned successfully to teacher.');
        } catch (\Exception $e) {
            return redirect()->route('teachers.show', $validated['teacher_id'])
                ->with('warning', 'Schedule assigned but session generation had issues: '.$e->getMessage());
        }
    }

    /**
     * Display the specified assigned schedule.
     */
    public function show(DraftSchedule $draftSchedule): Response
    {
        return Inertia::render('assign-schedules/show', [
            'assignment' => $draftSchedule->load([
                'teacher.user',
                'schedule.subject',
                'schedule.semester',
                'reviewer',
            ]),
        ]);
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(DraftSchedule $draftSchedule): RedirectResponse
    {
        $teacherId = $draftSchedule->teacher_id;
        if ($draftSchedule->teacher_assignment_id) {
            \App\Models\TeacherAssignment::where('id', $draftSchedule->teacher_assignment_id)->delete();
            \App\Models\TeacherSchedule::where('draft_schedule_id', $draftSchedule->id)->delete();
        }
        $draftSchedule->delete();

        return redirect()->back()
            ->with('success', 'Schedule assignment removed successfully.');
    }
}
