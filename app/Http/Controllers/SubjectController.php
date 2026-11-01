<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubjectRequest;
use App\Models\Subject;
use App\Services\SubjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function __construct(
        protected SubjectService $service
    ) {}

    public function index(Request $request)
    {
        $query = Subject::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('code', 'like', '%'.$search.'%')
                ->orWhere('title', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%');
        }

        $totalSubjects = Subject::count();
        $activeSubjects = Subject::where('is_active', true)->count();
        $inactiveSubjects = $totalSubjects - $activeSubjects;
        $totalUnits = (float) Subject::sum('units');
        $avgUnits = $totalSubjects > 0 ? round(Subject::avg('units'), 1) : 0;
        $scheduledSubjects = Subject::has('schedules')->count();
        $unscheduledSubjects = max(0, $totalSubjects - $scheduledSubjects);

        return Inertia::render('subjects/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
            'stats' => [
                'total' => $totalSubjects,
                'active' => $activeSubjects,
                'inactive' => $inactiveSubjects,
                'total_units' => round($totalUnits, 1),
                'avg_units' => $avgUnits,
                'scheduled_count' => $scheduledSubjects,
                'unscheduled_count' => $unscheduledSubjects,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('subjects/create');
    }

    public function store(SubjectRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('subjects.index')->with('success', 'Subject created successfully');
    }

    public function show(Subject $subject)
    {
        $subject->load([
            'schedules.semester',
            'schedules.classroom',
            'schedules.teacherAssignment.teacher.user',
            'curricula.program',
        ]);

        return Inertia::render('subjects/show', [
            'subject' => $subject,
        ]);
    }

    public function edit(Subject $subject)
    {
        return Inertia::render('subjects/edit', [
            'subject' => $subject,
        ]);
    }

    public function update(SubjectRequest $request, Subject $subject)
    {
        $this->service->updateFromRequest($subject->id, $request);

        return redirect()->route('subjects.index')->with('success', 'Subject updated successfully');
    }

    public function destroy(Subject $subject)
    {
        $this->service->delete($subject->id);

        return redirect()->route('subjects.index')->with('success', 'Subject deleted successfully');
    }
}
