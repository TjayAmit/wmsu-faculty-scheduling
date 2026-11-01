<?php

namespace App\Http\Controllers;

use App\Enums\CurriculumSemesterType;
use App\Http\Requests\CurriculumRequest;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Program;
use App\Models\Subject;
use App\Services\CurriculumService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function __construct(
        protected CurriculumService $service
    ) {}

    public function index(Request $request)
    {
        $query = Curriculum::query()
            ->with(['program.department', 'subject']);

        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->whereHas('program', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('program', function ($pq) use ($search) {
                    $pq->where('name', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%')
                        ->orWhereHas('department', function ($dq) use ($search) {
                            $dq->where('name', 'like', '%'.$search.'%')
                                ->orWhere('code', 'like', '%'.$search.'%');
                        });
                })
                ->orWhereHas('subject', function ($sq) use ($search) {
                    $sq->where('title', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%');
                });
            });
        }

        $totalCurricula = Curriculum::count();
        $requiredCurricula = Curriculum::where('is_required', true)->count();
        $electiveCurricula = $totalCurricula - $requiredCurricula;
        $programsCount = Curriculum::distinct('program_id')->count('program_id');
        $subjectsCount = Curriculum::distinct('subject_id')->count('subject_id');
        $withPrerequisites = Curriculum::whereNotNull('prerequisite_subjects')
            ->where('prerequisite_subjects', '!=', '[]')
            ->count();

        return Inertia::render('curricula/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => [
                'search' => $request->search ?? '',
                'department_id' => $request->department_id ?? 'all',
                'per_page' => (int) ($request->per_page ?? 10),
            ],
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
            'programs' => Program::active()->with('department:id,code,name')->select('id', 'code', 'name', 'degree_level', 'department_id')->get(),
            'subjects' => Subject::active()->select('id', 'code', 'title', 'units')->get(),
            'stats' => [
                'total' => $totalCurricula,
                'required' => $requiredCurricula,
                'elective' => $electiveCurricula,
                'programs_count' => $programsCount,
                'subjects_count' => $subjectsCount,
                'has_prerequisites' => $withPrerequisites,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('curricula/create', [
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
            'programs' => Program::active()->with('department:id,code,name')->select('id', 'code', 'name', 'degree_level', 'department_id')->get(),
            'subjects' => Subject::active()->select('id', 'code', 'title', 'units')->get(),
            'semesterTypes' => array_map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ], CurriculumSemesterType::cases()),
        ]);
    }

    public function store(CurriculumRequest $request)
    {
        $this->service->create($request);

        return redirect()->route('curricula.index')->with('success', 'Curriculum entry created successfully');
    }

    public function show(Curriculum $curriculum)
    {
        $curriculum->load(['program.department', 'subject']);

        return Inertia::render('curricula/show', [
            'curriculum' => $curriculum,
        ]);
    }

    public function edit(Curriculum $curriculum)
    {
        $curriculum->load(['program.department', 'subject']);

        return Inertia::render('curricula/edit', [
            'curriculum' => $curriculum,
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
            'programs' => Program::active()->with('department:id,code,name')->select('id', 'code', 'name', 'degree_level', 'department_id')->get(),
            'subjects' => Subject::active()->select('id', 'code', 'title', 'units')->get(),
            'semesterTypes' => array_map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ], CurriculumSemesterType::cases()),
        ]);
    }

    public function update(CurriculumRequest $request, Curriculum $curriculum)
    {
        $this->service->update($request, $curriculum);

        return redirect()->route('curricula.index')->with('success', 'Curriculum entry updated successfully');
    }

    public function destroy(Curriculum $curriculum)
    {
        $this->service->delete($curriculum);

        return redirect()->route('curricula.index')->with('success', 'Curriculum entry deleted successfully');
    }
}
