<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\Semester;
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
        $query = Schedule::query()
            ->with(['subject', 'semester', 'teacherAssignment.teacher.user']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('subject', function ($q) use ($search) {
                $q->where('code', 'like', '%' . $search . '%')
                  ->orWhere('title', 'like', '%' . $search . '%');
            })
            ->orWhere('room', 'like', '%' . $search . '%')
            ->orWhere('section', 'like', '%' . $search . '%');
        }

        return Inertia::render('schedules/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('schedules/create', [
            'subjects' => Subject::active()->select('id', 'code', 'title')->get(),
            'semesters' => Semester::select('id', 'name', 'academic_year', 'is_current')->get(),
            'timeSlots' => TimeSlot::active()->select('id', 'name', 'start_time', 'end_time')->get(),
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
        $schedule->load(['subject', 'semester', 'teacherAssignment.teacher.user']);

        return Inertia::render('schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(Schedule $schedule)
    {
        $schedule->load(['subject', 'semester']);

        return Inertia::render('schedules/edit', [
            'schedule' => $schedule,
            'subjects' => Subject::active()->select('id', 'code', 'title')->get(),
            'semesters' => Semester::select('id', 'name', 'academic_year', 'is_current')->get(),
            'timeSlots' => TimeSlot::active()->select('id', 'name', 'start_time', 'end_time')->get(),
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
