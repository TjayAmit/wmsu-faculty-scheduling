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

    public function index(Request $request)
    {
        $query = TeachingHistory::with(['teacher', 'semester', 'subject', 'schedule']);

        if ($request->has('teacher_id')) {
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
            $query->whereHas('teacher', function ($q) use ($search) {
                $q->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%');
            })->orWhereHas('subject', function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('code', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('teaching-histories/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'teacher_id', 'semester_id', 'status', 'per_page']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'academic_year']),
        ]);
    }

    public function create()
    {
        return Inertia::render('teaching-histories/create', [
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'academic_year']),
            'subjects' => Subject::all(['id', 'title', 'code']),
        ]);
    }

    public function store(TeachingHistoryRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history created successfully');
    }

    public function show(TeachingHistory $teachingHistory)
    {
        $teachingHistory->load(['teacher', 'semester', 'subject', 'schedule']);

        return Inertia::render('teaching-histories/show', [
            'teachingHistory' => $teachingHistory,
        ]);
    }

    public function edit(TeachingHistory $teachingHistory)
    {
        $teachingHistory->load(['teacher', 'semester', 'subject', 'schedule']);

        return Inertia::render('teaching-histories/edit', [
            'teachingHistory' => $teachingHistory,
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
            'semesters' => Semester::all(['id', 'name', 'year']),
            'subjects' => Subject::all(['id', 'name', 'code']),
        ]);
    }

    public function update(TeachingHistoryRequest $request, TeachingHistory $teachingHistory)
    {
        $this->service->updateFromRequest($teachingHistory->id, $request);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history updated successfully');
    }

    public function destroy(TeachingHistory $teachingHistory)
    {
        $this->service->delete($teachingHistory);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history deleted successfully');
    }

    public function archive(TeachingHistory $teachingHistory)
    {
        $this->service->archive($teachingHistory);

        return redirect()->route('teaching-histories.index')->with('success', 'Teaching history archived successfully');
    }

    public function teacherHistory(Request $request, int $teacherId)
    {
        $query = TeachingHistory::with(['semester', 'subject', 'schedule'])
            ->where('teacher_id', $teacherId);

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        return Inertia::render('teaching-histories/teacher-history', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'teacher' => Teacher::findOrFail($teacherId),
            'filters' => $request->only(['semester_id', 'per_page']),
            'semesters' => Semester::all(['id', 'name', 'year']),
        ]);
    }
}
