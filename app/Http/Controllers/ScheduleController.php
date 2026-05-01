<?php

namespace App\Http\Controllers;

use App\Enums\DayOfWeek;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\Semester;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::query()
            ->with(['subject', 'semester', 'timeSlot', 'teacherAssignment.teacher.user']);

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
            'daysOfWeek' => DayOfWeek::cases(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'required|exists:semesters,id',
            'time_slot_id' => 'required|exists:time_slots,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'room' => 'required|string|max:50',
            'section' => 'required|string|max:20',
            'is_active' => 'boolean',
        ]);

        Schedule::create($validated);

        return redirect()->route('schedules.index')->with('success', 'Schedule created successfully');
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['subject', 'semester', 'timeSlot', 'teacherAssignment.teacher.user']);

        return Inertia::render('schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(Schedule $schedule)
    {
        $schedule->load(['subject', 'semester', 'timeSlot']);

        return Inertia::render('schedules/edit', [
            'schedule' => $schedule,
            'subjects' => Subject::active()->select('id', 'code', 'title')->get(),
            'semesters' => Semester::select('id', 'name', 'academic_year', 'is_current')->get(),
            'timeSlots' => TimeSlot::active()->select('id', 'name', 'start_time', 'end_time')->get(),
            'daysOfWeek' => DayOfWeek::cases(),
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'required|exists:semesters,id',
            'time_slot_id' => 'required|exists:time_slots,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'room' => 'required|string|max:50',
            'section' => 'required|string|max:20',
            'is_active' => 'boolean',
        ]);

        $schedule->update($validated);

        return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully');
    }
}
