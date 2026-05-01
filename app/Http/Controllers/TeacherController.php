<?php

namespace App\Http\Controllers;

use App\Enums\EmploymentType;
use App\Http\Requests\TeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherService $service
    ) {}

    public function index(Request $request)
    {
        $query = Teacher::with('user')
            ->when($request->boolean('without_user'), function ($q) {
                return $q->withoutUser();
            });

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('employee_id', 'like', '%'.$search.'%')
                    ->orWhere('department', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('teachers/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page', 'without_user']),
        ]);
    }

    public function create()
    {
        return Inertia::render('teachers/create', [
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

    /**
     * Create user account for existing teacher.
     */
    public function createUserAccount(Request $request, Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher already has a user account');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->input('name'),
                'email' => $teacher->email,
                'password' => Hash::make($request->input('password')),
            ]);

            // Assign roles if provided
            if ($request->has('roles')) {
                $user->assignRole($request->input('roles'));
            }

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to create user account: '.$e->getMessage());
        }
    }

    /**
     * Link existing user to teacher.
     */
    public function linkUserAccount(Request $request, Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher already has a user account');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id|unique:teachers,user_id',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($request->input('user_id'));

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            // Assign roles if provided
            if ($request->has('roles')) {
                $user->assignRole($request->input('roles'));
            }

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account linked successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to link user account: '.$e->getMessage());
        }
    }

    /**
     * Unlink user account from teacher.
     */
    public function unlinkUserAccount(Teacher $teacher)
    {
        if (! $teacher->hasUserAccount()) {
            return redirect()->back()->with('error', 'Teacher does not have a user account');
        }

        try {
            DB::beginTransaction();

            $teacher->user_id = null;
            $teacher->save();

            DB::commit();

            return redirect()->route('teachers.show', $teacher)->with('success', 'User account unlinked successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to unlink user account: '.$e->getMessage());
        }
    }

    /**
     * Show user account creation form for teacher.
     */
    public function showCreateUserAccountForm(Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->route('teachers.show', $teacher)->with('error', 'Teacher already has a user account');
        }

        return Inertia::render('teachers/create-user-account', [
            'teacher' => $teacher,
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Show user account linking form for teacher.
     */
    public function showLinkUserAccountForm(Teacher $teacher)
    {
        if ($teacher->hasUserAccount()) {
            return redirect()->route('teachers.show', $teacher)->with('error', 'Teacher already has a user account');
        }

        $availableUsers = User::whereDoesntHave('teacher')->get(['id', 'name', 'email']);

        return Inertia::render('teachers/link-user-account', [
            'teacher' => $teacher,
            'availableUsers' => $availableUsers,
            'roles' => Role::all()->pluck('name'),
        ]);
    }
}
