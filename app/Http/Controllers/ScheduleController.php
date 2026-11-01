<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Models\Classroom;
use App\Models\DraftSchedule;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function __construct(
        protected ScheduleService $service
    ) {}

    public function index(Request $request)
    {
        $tab = $request->query('tab', 'schedules');

        // Course Schedules query
        $schedulesQuery = Schedule::query()
            ->with(['subject', 'semester', 'classroom.zktecoDevice', 'teacherAssignment.teacher.user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $schedulesQuery->where(function ($q) use ($search) {
                $q->whereHas('subject', function ($sq) use ($search) {
                    $sq->where('code', 'like', '%'.$search.'%')
                        ->orWhere('title', 'like', '%'.$search.'%');
                })
                ->orWhere('room', 'like', '%'.$search.'%')
                ->orWhere('section', 'like', '%'.$search.'%');
            });
        }

        // Draft Schedules query
        $draftsQuery = DraftSchedule::query()
            ->with(['teacher.user', 'schedule.subject', 'schedule.semester', 'reviewer']);

        if ($request->filled('draft_status') && $request->draft_status !== '_all') {
            $draftsQuery->where('status', $request->draft_status);
        }

        if ($request->filled('draft_search')) {
            $draftSearch = $request->draft_search;
            $draftsQuery->where(function ($q) use ($draftSearch) {
                $q->whereHas('teacher.user', function ($uq) use ($draftSearch) {
                    $uq->where('name', 'like', '%'.$draftSearch.'%');
                })
                ->orWhereHas('schedule.subject', function ($sq) use ($draftSearch) {
                    $sq->where('code', 'like', '%'.$draftSearch.'%')
                        ->orWhere('title', 'like', '%'.$draftSearch.'%');
                });
            });
        }

        $pendingDraftsCount = DraftSchedule::where('status', 'pending_review')->count();
        $approvedDraftsCount = DraftSchedule::where('status', 'approved')->count();
        $rejectedDraftsCount = DraftSchedule::where('status', 'rejected')->count();
        $totalSchedulesCount = Schedule::count();
        $assignedSchedulesCount = Schedule::has('teacherAssignment')->count();
        $unassignedSchedulesCount = Schedule::doesntHave('teacherAssignment')->count();
        $totalDraftsCount = DraftSchedule::count();

        return Inertia::render('schedules/index', [
            'activeTab' => $tab,
            'data' => $schedulesQuery->latest()->paginate($request->per_page ?? 10, ['*'], 'page')->withQueryString(),
            'drafts' => $draftsQuery->latest()->paginate($request->per_page ?? 10, ['*'], 'drafts_page')->withQueryString(),
            'counts' => [
                'schedules' => $totalSchedulesCount,
                'drafts' => $totalDraftsCount,
                'pending_drafts' => $pendingDraftsCount,
            ],
            'stats' => [
                'total_schedules' => $totalSchedulesCount,
                'assigned_schedules' => $assignedSchedulesCount,
                'unassigned_schedules' => $unassignedSchedulesCount,
                'total_drafts' => $totalDraftsCount,
                'pending_drafts' => $pendingDraftsCount,
                'approved_drafts' => $approvedDraftsCount,
                'rejected_drafts' => $rejectedDraftsCount,
            ],
            'filters' => [
                'tab' => $tab,
                'search' => $request->search ?? '',
                'draft_status' => $request->draft_status ?? '_all',
                'draft_search' => $request->draft_search ?? '',
                'per_page' => (int) ($request->per_page ?? 10),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('schedules/create', [
            'subjects' => Subject::active()->select('id', 'code', 'title', 'units')->get(),
            'semesters' => Semester::select('id', 'name', 'academic_year', 'is_current')->get(),
            'classrooms' => Classroom::active()->with('zktecoDevice')->orderBy('building')->orderBy('room_number')->get(),
            'timeSlots' => TimeSlot::active()->select('id', 'name', 'start_time', 'end_time')->get(),
            'sections' => Section::active()->with('program:id,code,name')->orderBy('section_code')->get(),
            'daysOfWeek' => [
                ['value' => 'monday', 'label' => 'Monday'],
                ['value' => 'tuesday', 'label' => 'Tuesday'],
                ['value' => 'wednesday', 'label' => 'Wednesday'],
                ['value' => 'thursday', 'label' => 'Thursday'],
                ['value' => 'friday', 'label' => 'Friday'],
                ['value' => 'saturday', 'label' => 'Saturday'],
            ],
        ]);
    }

    public function store(ScheduleRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('schedules.index')->with('success', 'Schedule created successfully');
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['subject', 'semester', 'classroom.zktecoDevice', 'teacherAssignment.teacher.user', 'teacherAssignment.teacher.department']);

        return Inertia::render('schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(Schedule $schedule)
    {
        $schedule->load(['subject', 'semester', 'classroom.zktecoDevice']);

        return Inertia::render('schedules/edit', [
            'schedule' => $schedule,
            'subjects' => Subject::active()->select('id', 'code', 'title', 'units')->get(),
            'semesters' => Semester::select('id', 'name', 'academic_year', 'is_current')->get(),
            'classrooms' => Classroom::active()->with('zktecoDevice')->orderBy('building')->orderBy('room_number')->get(),
            'timeSlots' => TimeSlot::active()->select('id', 'name', 'start_time', 'end_time')->get(),
            'sections' => Section::active()->with('program:id,code,name')->orderBy('section_code')->get(),
            'daysOfWeek' => [
                ['value' => 'monday', 'label' => 'Monday'],
                ['value' => 'tuesday', 'label' => 'Tuesday'],
                ['value' => 'wednesday', 'label' => 'Wednesday'],
                ['value' => 'thursday', 'label' => 'Thursday'],
                ['value' => 'friday', 'label' => 'Friday'],
                ['value' => 'saturday', 'label' => 'Saturday'],
            ],
        ]);
    }

    public function update(ScheduleRequest $request, Schedule $schedule)
    {
        $this->service->updateFromRequest($schedule->id, $request);

        return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully');
    }

    public function destroy(Schedule $schedule)
    {
        $this->service->delete($schedule->id);

        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully');
    }
}
