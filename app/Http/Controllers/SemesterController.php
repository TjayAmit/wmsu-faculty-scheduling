<?php

namespace App\Http\Controllers;

use App\Enums\SemesterType;
use App\Models\Semester;
use App\Services\SemesterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterController extends Controller
{
    public function __construct(
        protected SemesterService $service
    ) {}

    public function index(Request $request)
    {
        $query = Semester::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%')
                  ->orWhere('academic_year', 'like', '%' . $search . '%');
        }

        return Inertia::render('semesters/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('semesters/create', [
            'semesterTypes' => collect(SemesterType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'academic_year' => 'required|string|max:20',
            'semester_type' => 'required|in:first,second,summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        // If setting as current, unset other current semesters
        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        $this->service->createFromRequest($request);

        return redirect()->route('semesters.index')->with('success', 'Semester created successfully');
    }

    public function show(Semester $semester)
    {
        $semester->load('schedules');

        return Inertia::render('semesters/show', [
            'semester' => $semester,
        ]);
    }

    public function edit(Semester $semester)
    {
        return Inertia::render('semesters/edit', [
            'semester' => $semester,
            'semesterTypes' => collect(SemesterType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
        ]);
    }

    public function update(Request $request, Semester $semester)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'academic_year' => 'required|string|max:20',
            'semester_type' => 'required|in:first,second,summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        // If setting as current, unset other current semesters
        if (($validated['is_current'] ?? false) && !$semester->is_current) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        $this->service->updateFromRequest($semester->id, $request);

        return redirect()->route('semesters.index')->with('success', 'Semester updated successfully');
    }

    public function destroy(Semester $semester)
    {
        $this->service->delete($semester->id);

        return redirect()->route('semesters.index')->with('success', 'Semester deleted successfully');
    }
}
