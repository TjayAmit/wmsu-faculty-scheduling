<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use App\Services\TimeSlotService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    public function __construct(
        protected TimeSlotService $service
    ) {}

    public function index(Request $request)
    {
        $query = TimeSlot::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%'.$search.'%');
        }

        return Inertia::render('time-slots/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('time-slots/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean',
        ]);

        $this->service->createFromRequest($request);

        return redirect()->route('time-slots.index')->with('success', 'Time slot created successfully');
    }

    public function show(TimeSlot $timeSlot)
    {
        $timeSlot->load('schedules');

        return Inertia::render('time-slots/show', [
            'timeSlot' => $timeSlot,
        ]);
    }

    public function edit(TimeSlot $timeSlot)
    {
        return Inertia::render('time-slots/edit', [
            'timeSlot' => $timeSlot,
        ]);
    }

    public function update(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean',
        ]);

        $this->service->updateFromRequest($timeSlot->id, $request);

        return redirect()->route('time-slots.index')->with('success', 'Time slot updated successfully');
    }

    public function destroy(TimeSlot $timeSlot)
    {
        $this->service->delete($timeSlot->id);

        return redirect()->route('time-slots.index')->with('success', 'Time slot deleted successfully');
    }
}
