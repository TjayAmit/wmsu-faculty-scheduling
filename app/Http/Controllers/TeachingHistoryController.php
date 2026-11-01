<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeachingHistoryRequest;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingHistory;
use App\Services\TeachingHistoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeachingHistoryController extends Controller
{
    public function __construct(
        protected TeachingHistoryService $service
    ) {}

    protected function isTeacherUser(?Request $request = null): bool
    {
        $user = ($request ?? request())->user();
        if (! $user) {
            return false;
        }

        if ($user->hasAnyRole(['Admin', 'Faculty Admin'])) {
            return false;
        }

        return $user->hasAnyRole(['Teacher', 'teacher', 'Instructor', 'instructor'])
            || Teacher::where('user_id', $user->id)->exists()
            || ($user->email && Teacher::where('email', $user->email)->exists());
    }

    public function index(Request $request)
    {
        // Auto-sync actual assignments to teaching history records
        $this->service->syncFromAssignments();

        $user = $request->user();
        $isTeacherRole = $this->isTeacherUser($request);
        $currentTeacher = null;

        if ($user) {
            $currentTeacher = Teacher::where('user_id', $user->id)->first();
            if (! $currentTeacher && $user->email) {
                $currentTeacher = Teacher::where('email', $user->email)->first();
            }
        }

        $query = TeachingHistory::with(['teacher.department', 'semester', 'subject', 'schedule']);

        // Teacher role is strictly scoped to their own records
        if ($isTeacherRole && $currentTeacher) {
            $query->where('teacher_id', $currentTeacher->id);
        } elseif ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($sub) use ($search) {
                $sub->whereHas('teacher', function ($q) use ($search) {
                    $q->where('first_name', 'like', '%'.$search.'%')
                        ->orWhere('last_name', 'like', '%'.$search.'%');
                })->orWhereHas('subject', function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%');
                });
            });
        }

        return Inertia::render('teaching-histories/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'teacher_id', 'semester_id', 'status', 'per_page']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'academic_year']),
            'isTeacherRole' => $isTeacherRole,
            'canCreate' => ! $isTeacherRole,
            'canManage' => ! $isTeacherRole,
        ]);
    }

    public function create(Request $request)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history is an archival academic record generated from completed terms and cannot be manually created by teachers.');
        }

        return Inertia::render('teaching-histories/create', [
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'academic_year']),
            'subjects' => Subject::all(['id', 'title', 'code']),
        ]);
    }

    public function store(TeachingHistoryRequest $request)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history is an archival academic record generated from completed terms and cannot be manually created by teachers.');
        }

        $this->service->createFromRequest($request);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history created successfully');
    }

    public function show(Request $request, TeachingHistory $teachingHistory)
    {
        $isTeacherRole = $this->isTeacherUser($request);

        $teachingHistory->load(['teacher.department', 'semester', 'subject', 'schedule']);

        return Inertia::render('teaching-histories/show', [
            'teachingHistory' => $teachingHistory,
            'isTeacherRole' => $isTeacherRole,
            'canManage' => ! $isTeacherRole,
        ]);
    }

    public function edit(Request $request, TeachingHistory $teachingHistory)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history records cannot be modified by teachers.');
        }

        $teachingHistory->load(['teacher', 'semester', 'subject', 'schedule']);

        return Inertia::render('teaching-histories/edit', [
            'teachingHistory' => $teachingHistory,
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'academic_year']),
            'subjects' => Subject::all(['id', 'title', 'code']),
        ]);
    }

    public function update(TeachingHistoryRequest $request, TeachingHistory $teachingHistory)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history records cannot be modified by teachers.');
        }

        $this->service->updateFromRequest($teachingHistory->id, $request);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history updated successfully');
    }

    public function destroy(Request $request, TeachingHistory $teachingHistory)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history records cannot be deleted by teachers.');
        }

        $this->service->delete($teachingHistory);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history deleted successfully');
    }

    public function archive(Request $request, TeachingHistory $teachingHistory)
    {
        if ($this->isTeacherUser($request)) {
            abort(403, 'Teaching history records cannot be archived by teachers.');
        }

        $this->service->archive($teachingHistory);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history archived successfully');
    }
}
