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
                'name' => $t->user->name,
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
    public function create(): Response
    {
        return Inertia::render('assign-schedules/create', [
            'teachers' => Teacher::with('user')->get()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->user->name,
            ]),
            'schedules' => Schedule::with(['subject', 'semester'])
                ->where('is_active', true)
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->subject->code.' - '.$s->subject->title,
                    'semester' => $s->semester->name,
                    'timeSlots' => $s->time_slots,
                ]),
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

            return redirect()->route('assign-schedules.show', $draftSchedule->id)
                ->with('success', 'Schedule assigned successfully and teacher schedules generated.');
        } catch (\Exception $e) {
            return redirect()->route('assign-schedules.index')
                ->with('warning', 'Schedule assigned but teacher schedule generation failed: '.$e->getMessage());
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
        $draftSchedule->delete();

        return redirect()->route('assign-schedules.index')
            ->with('success', 'Schedule assignment removed successfully.');
    }
}
