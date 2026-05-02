<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartmentRequest;
use App\Models\Department;
use App\Models\Teacher;
use App\Services\DepartmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function __construct(
        protected DepartmentService $service
    ) {}

    public function index(Request $request)
    {
        $query = Department::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('office_location', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('departments/index', [
            'data' => $query->with('head')->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('departments/create', [
            'teachers' => Teacher::select('id', 'first_name', 'last_name')->get(),
        ]);
    }

    public function store(DepartmentRequest $request)
    {
        $this->service->create($request);

        return redirect()->route('departments.index')->with('success', 'Department created successfully');
    }

    public function show(Department $department)
    {
        $department->load(['head', 'teachers', 'programs']);

        return Inertia::render('departments/show', [
            'department' => $department,
        ]);
    }

    public function edit(Department $department)
    {
        return Inertia::render('departments/edit', [
            'department' => $department,
            'teachers' => Teacher::select('id', 'first_name', 'last_name')->get(),
        ]);
    }

    public function update(DepartmentRequest $request, Department $department)
    {
        $this->service->update($request, $department);

        return redirect()->route('departments.index')->with('success', 'Department updated successfully');
    }

    public function destroy(Department $department)
    {
        $this->service->delete($department);

        return redirect()->route('departments.index')->with('success', 'Department deleted successfully');
    }
}
