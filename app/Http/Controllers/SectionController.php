<?php

namespace App\Http\Controllers;

use App\Http\Requests\SectionRequest;
use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Teacher;
use App\Services\SectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function __construct(
        protected SectionService $service
    ) {}

    public function index(Request $request)
    {
        $query = Section::with(['program', 'semester', 'adviser']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('section_code', 'like', '%'.$search.'%')
                ->orWhereHas('program', function ($q) use ($search) {
                    $q->where('name', 'like', '%'.$search.'%');
                });
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->has('year_level')) {
            $query->where('year_level', $request->year_level);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        return Inertia::render('sections/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'program_id', 'semester_id', 'year_level', 'is_active', 'per_page']),
            'programs' => Program::all(['id', 'name']),
            'semesters' => Semester::all(['id', 'name', 'year']),
        ]);
    }

    public function create()
    {
        return Inertia::render('sections/create', [
            'programs' => Program::all(['id', 'name']),
            'semesters' => Semester::all(['id', 'name', 'year']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(SectionRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('sections.index')->with('success', 'Section created successfully');
    }

    public function show(Section $section)
    {
        $section->load(['program', 'semester', 'adviser', 'teacherSchedules']);

        return Inertia::render('sections/show', [
            'section' => $section,
        ]);
    }

    public function edit(Section $section)
    {
        $section->load(['program', 'semester', 'adviser']);

        return Inertia::render('sections/edit', [
            'section' => $section,
            'programs' => Program::all(['id', 'name']),
            'semesters' => Semester::all(['id', 'name', 'year']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function update(SectionRequest $request, Section $section)
    {
        $this->service->updateFromRequest($section->id, $request);

        return redirect()->route('sections.index')->with('success', 'Section updated successfully');
    }

    public function destroy(Section $section)
    {
        $this->service->delete($section);

        return redirect()->route('sections.index')->with('success', 'Section deleted successfully');
    }

    public function toggleStatus(Section $section)
    {
        $this->service->toggleStatus($section);

        return redirect()->route('sections.index')->with('success', 'Section status updated successfully');
    }

    public function assignAdviser(Request $request, Section $section)
    {
        $request->validate([
            'adviser_id' => 'nullable|exists:teachers,id',
        ]);

        $this->service->assignAdviser($section, $request->adviser_id);

        return redirect()->route('sections.index')->with('success', 'Adviser assigned successfully');
    }
}
