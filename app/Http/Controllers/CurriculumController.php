<?php

namespace App\Http\Controllers;

use App\Enums\CurriculumSemesterType;
use App\Http\Requests\CurriculumRequest;
use App\Models\Curriculum;
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
            ->with(['program', 'subject']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('program', function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('code', 'like', '%'.$search.'%');
            })
                ->orWhereHas('subject', function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%');
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
            'filters' => $request->only(['search', 'per_page']),
            'programs' => Program::active()->select('id', 'code', 'name', 'degree_level')->get(),
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
            'programs' => Program::active()->select('id', 'code', 'name', 'degree_level')->get(),
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
        $curriculum->load(['program', 'subject']);

        return Inertia::render('curricula/show', [
            'curriculum' => $curriculum,
        ]);
    }

    public function edit(Curriculum $curriculum)
    {
        $curriculum->load(['program', 'subject']);

        return Inertia::render('curricula/edit', [
            'curriculum' => $curriculum,
            'programs' => Program::active()->select('id', 'code', 'name', 'degree_level')->get(),
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
