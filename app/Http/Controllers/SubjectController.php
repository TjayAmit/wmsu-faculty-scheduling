<?php

namespace App\Http\Controllers;

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
            $query->where('code', 'like', '%' . $search . '%')
                  ->orWhere('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
        }

        return Inertia::render('subjects/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('subjects/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subjects,code',
            'title' => 'required|string|max:255',
            'units' => 'required|numeric|min:0|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $this->service->createFromRequest($request);

        return redirect()->route('subjects.index')->with('success', 'Subject created successfully');
    }

    public function show(Subject $subject)
    {
        $subject->load('schedules');

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

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'title' => 'required|string|max:255',
            'units' => 'required|numeric|min:0|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $this->service->updateFromRequest($subject->id, $request);

        return redirect()->route('subjects.index')->with('success', 'Subject updated successfully');
    }

    public function destroy(Subject $subject)
    {
        $this->service->delete($subject->id);

        return redirect()->route('subjects.index')->with('success', 'Subject deleted successfully');
    }
}
