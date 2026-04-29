<?php

namespace App\Http\Controllers;

use App\Enums\EmploymentType;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
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
            'employmentTypes' => EmploymentType::cases(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:teachers,user_id',
            'employee_id' => 'required|string|max:50|unique:teachers,employee_id',
            'department' => 'nullable|string|max:255',
            'rank' => 'nullable|string|max:100',
            'employment_type' => 'required|string|in:full_time,part_time,casual',
            'date_hired' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Teacher::create($validated);

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

    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:teachers,user_id,' . $teacher->id,
            'employee_id' => 'required|string|max:50|unique:teachers,employee_id,' . $teacher->id,
            'department' => 'nullable|string|max:255',
            'rank' => 'nullable|string|max:100',
            'employment_type' => 'required|string|in:full_time,part_time,casual',
            'date_hired' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $teacher->update($validated);

        return redirect()->route('teachers.index')->with('success', 'Teacher updated successfully');
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('teachers.index')->with('success', 'Teacher deleted successfully');
    }
}
