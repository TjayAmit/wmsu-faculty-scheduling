<?php

namespace App\Http\Controllers;

use App\Http\Requests\DraftScheduleRequest;
use App\Models\DraftSchedule;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Services\DraftScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DraftScheduleController extends Controller
{
    public function __construct(
        protected DraftScheduleService $service
    ) {}

    public function index(Request $request)
    {
        $query = DraftSchedule::query()
            ->with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        return Inertia::render('draft-schedules/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'teacher_id', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('draft-schedules/create', [
            'teachers' => Teacher::active()->with('user')->get(),
            'schedules' => Schedule::with(['subject', 'semester'])->active()->get(),
        ]);
    }

    public function store(DraftScheduleRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule created successfully');
    }

    public function show(DraftSchedule $draftSchedule)
    {
        $draftSchedule->load(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer', 'teacherAssignment']);

        return Inertia::render('draft-schedules/show', [
            'draftSchedule' => $draftSchedule,
        ]);
    }

    public function edit(DraftSchedule $draftSchedule)
    {
        $draftSchedule->load(['teacher', 'schedule']);

        return Inertia::render('draft-schedules/edit', [
            'draftSchedule' => $draftSchedule,
            'teachers' => Teacher::active()->with('user')->get(),
            'schedules' => Schedule::with(['subject', 'semester'])->active()->get(),
        ]);
    }

    public function update(DraftScheduleRequest $request, DraftSchedule $draftSchedule)
    {
        $this->service->updateFromRequest($draftSchedule->id, $request);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule updated successfully');
    }

    public function destroy(DraftSchedule $draftSchedule)
    {
        $this->service->delete($draftSchedule->id);

        return redirect()->route('draft-schedules.index')->with('success', 'Draft schedule deleted successfully');
    }

    public function submit(DraftSchedule $draftSchedule)
    {
        $this->service->submitForReview($draftSchedule->id);

        return redirect()->route('draft-schedules.show', $draftSchedule->id)->with('success', 'Draft schedule submitted for review');
    }

    public function approve(Request $request, DraftSchedule $draftSchedule)
    {
        $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        $this->service->approve($draftSchedule->id, $request->comments);

        return redirect()->route('draft-schedules.show', $draftSchedule->id)->with('success', 'Draft schedule approved');
    }

    public function reject(Request $request, DraftSchedule $draftSchedule)
    {
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
