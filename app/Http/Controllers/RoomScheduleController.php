<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoomScheduleRequest;
use App\Models\Classroom;
use App\Models\RoomSchedule;
use App\Services\RoomScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomScheduleController extends Controller
{
    public function __construct(
        protected RoomScheduleService $service
    ) {}

    public function index(Request $request)
    {
        $query = RoomSchedule::with(['classroom', 'schedule']);

        if ($request->has('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('classroom', function ($q) use ($search) {
                $q->where('building', 'like', '%'.$search.'%')
                    ->orWhere('room_number', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('room-schedules/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'classroom_id', 'date_from', 'date_to', 'per_page']),
            'classrooms' => Classroom::active()->get(['id', 'building', 'room_number']),
        ]);
    }

    public function create()
    {
        return Inertia::render('room-schedules/create', [
            'classrooms' => Classroom::active()->get(['id', 'building', 'room_number', 'room_name']),
        ]);
    }

    public function store(RoomScheduleRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('room-schedules.index')->with('success', 'Room schedule created successfully');
    }

    public function show(RoomSchedule $roomSchedule)
    {
        $roomSchedule->load(['classroom', 'schedule']);

        return Inertia::render('room-schedules/show', [
            'roomSchedule' => $roomSchedule,
        ]);
    }

    public function edit(RoomSchedule $roomSchedule)
    {
        $roomSchedule->load(['classroom', 'schedule']);

        return Inertia::render('room-schedules/edit', [
            'roomSchedule' => $roomSchedule,
            'classrooms' => Classroom::active()->get(['id', 'building', 'room_number', 'room_name']),
        ]);
    }

    public function update(RoomScheduleRequest $request, RoomSchedule $roomSchedule)
    {
        $this->service->updateFromRequest($roomSchedule->id, $request);

        return redirect()->route('room-schedules.index')->with('success', 'Room schedule updated successfully');
    }

    public function destroy(RoomSchedule $roomSchedule)
    {
        $this->service->delete($roomSchedule);

        return redirect()->route('room-schedules.index')->with('success', 'Room schedule deleted successfully');
    }

    public function calendar(Request $request)
    {
        $classroomId = $request->classroom_id;
        $startDate = $request->start_date ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfMonth()->format('Y-m-d');

        $query = RoomSchedule::with(['classroom', 'schedule'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($classroomId) {
            $query->where('classroom_id', $classroomId);
        }

        $schedules = $query->get();

        return Inertia::render('room-schedules/calendar', [
            'schedules' => $schedules,
            'filters' => [
                'classroom_id' => $classroomId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'classrooms' => Classroom::active()->get(['id', 'building', 'room_number']),
        ]);
    }
}
