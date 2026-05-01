<?php

namespace App\Http\Controllers;

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
            });

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%');
            });
        }

        return Inertia::render('staff/index', [
            'data' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('staff/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $facultyStaffRole = Role::where('name', 'Faculty Staff')->first();
        if ($facultyStaffRole) {
            $user->assignRole($facultyStaffRole);
        }

        return redirect()->route('staff.index')->with('success', 'Faculty Staff member created successfully');
    }

    public function show(User $user)
    {
        $user->load('roles');

        return Inertia::render('staff/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('staff/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
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
