<?php

namespace App\Http\Controllers;

use App\Enums\DegreeLevel;
use App\Http\Requests\ProgramRequest;
use App\Models\Department;
use App\Models\Program;
use App\Services\ProgramService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function __construct(
        protected ProgramService $service
    ) {}

    public function index(Request $request)
    {
        $query = Program::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('programs/index', [
            'data' => $query->with('department')->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('programs/create', [
            'departments' => Department::select('id', 'code', 'name')->active()->get(),
            'degreeLevels' => DegreeLevel::cases(),
        ]);
    }

    public function store(ProgramRequest $request)
    {
        $this->service->create($request);

        return redirect()->route('programs.index')->with('success', 'Program created successfully');
    }

    public function show(Program $program)
    {
        $program->load(['department', 'sections', 'curriculum']);

        return Inertia::render('programs/show', [
            'program' => $program,
        ]);
    }

    public function edit(Program $program)
    {
        return Inertia::render('programs/edit', [
            'program' => $program,
            'departments' => Department::select('id', 'code', 'name')->active()->get(),
            'degreeLevels' => DegreeLevel::cases(),
        ]);
    }

    public function update(ProgramRequest $request, Program $program)
    {
        $this->service->update($request, $program);

        return redirect()->route('programs.index')->with('success', 'Program updated successfully');
    }

    public function destroy(Program $program)
    {
        $this->service->delete($program);

        return redirect()->route('programs.index')->with('success', 'Program deleted successfully');
    }
}
