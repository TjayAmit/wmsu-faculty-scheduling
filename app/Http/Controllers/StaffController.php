<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Faculty Staff');
            })
            ->with('department');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhereHas('department', function ($dq) use ($request) {
                        $dq->where('name', 'like', '%'.$request->search.'%')
                            ->orWhere('code', 'like', '%'.$request->search.'%');
                    });
            });
        }

        return Inertia::render('staff/index', [
            'data' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('staff/create', [
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'department_id' => $validated['department_id'] ?? null,
        ]);

        $facultyStaffRole = Role::where('name', 'Faculty Staff')->first();
        if ($facultyStaffRole) {
            $user->assignRole($facultyStaffRole);
        }

        return redirect()->route('staff.index')->with('success', 'Faculty Staff member created successfully');
    }

    public function show(User $user)
    {
        $user->load(['roles', 'department']);

        return Inertia::render('staff/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'department']);

        return Inertia::render('staff/edit', [
            'user' => $user,
            'departments' => Department::active()->orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'department_id' => $validated['department_id'] ?? null,
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        return redirect()->route('staff.index')->with('success', 'Faculty Staff member updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('staff.index')->with('success', 'Faculty Staff member deleted successfully');
    }
}
