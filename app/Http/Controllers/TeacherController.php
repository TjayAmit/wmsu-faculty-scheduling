<?php

namespace App\Http\Controllers;

use App\Enums\EmploymentType;
use App\Http\Requests\TeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherService $service
    ) {}

    public function index(Request $request)
    {
        $query = Teacher::with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            })->orWhere('employee_id', 'like', '%' . $search . '%')
              ->orWhere('department', 'like', '%' . $search . '%');
        }

        return Inertia::render('teachers/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        $users = User::whereDoesntHave('teacher')->get(['id', 'name', 'email']);

        return Inertia::render('teachers/create', [
            'users' => $users,
            'employmentTypes' => collect(EmploymentType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ])->values(),
        ]);
    }

    public function store(TeacherRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('teachers.index')->with('success', 'Teacher created successfully');
    }

    public function show(Teacher $teacher)
    {
        $teacher->load('user');

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
        ]);
    }

    public function edit(Teacher $teacher)
    {
        $teacher->load('user');
        $users = User::whereDoesntHave('teacher')
            ->orWhere('id', $teacher->user_id)
            ->get(['id', 'name', 'email']);

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
            'users' => $users,
            'employmentTypes' => EmploymentType::cases(),
        ]);
    }

    public function update(TeacherRequest $request, Teacher $teacher)
    {
        $this->service->updateFromRequest($teacher->id, $request);

        return redirect()->route('teachers.index')->with('success', 'Teacher updated successfully');
    }

    public function destroy(Teacher $teacher)
    {
        $this->service->delete($teacher->id);

        return redirect()->route('teachers.index')->with('success', 'Teacher deleted successfully');
    }
}
