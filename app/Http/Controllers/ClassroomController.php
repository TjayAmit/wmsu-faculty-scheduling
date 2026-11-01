<?php

namespace App\Http\Controllers;

use App\Enums\RoomType;
use App\Http\Requests\ClassroomRequest;
use App\Models\Classroom;
use App\Models\TimeSlot;
use App\Services\ClassroomAvailabilityService;
use App\Services\ClassroomService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function __construct(
        protected ClassroomService $service,
        protected ClassroomAvailabilityService $availabilityService
    ) {}

    public function index(Request $request)
    {
        $query = Classroom::query()
            ->with(['zktecoDevice', 'schedules.subject'])
            ->withCount(['schedules', 'roomSchedules']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('building', 'like', '%'.$search.'%')
                ->orWhere('room_number', 'like', '%'.$search.'%')
                ->orWhere('room_name', 'like', '%'.$search.'%');
        }

        $timeSlots = TimeSlot::active()->get()->keyBy('id');

        $paginated = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        $paginated->getCollection()->transform(function ($classroom) use ($timeSlots) {
            $avail = $this->availabilityService->calculateForClassroom($classroom, $timeSlots);
            $classroom->setAttribute('availability', [
                'weekly_booked_hours' => $avail['weekly_booked_hours'],
                'weekly_available_hours' => $avail['weekly_available_hours'],
                'weekly_utilization_rate' => $avail['weekly_utilization_rate'],
                'status' => $avail['status'],
                'is_full' => $avail['is_full'],
                'operating_hours' => $avail['operating_hours'],
            ]);

            return $classroom;
        });

        // Compute room availability overview across all classrooms
        $allClassrooms = Classroom::with(['schedules.subject'])->where('is_active', true)->get();
        $fullRoomsCount = 0;
        $totalUtilizationSum = 0;
        foreach ($allClassrooms as $c) {
            $avail = $this->availabilityService->calculateForClassroom($c, $timeSlots);
            if ($avail['is_full']) {
                $fullRoomsCount++;
            }
            $totalUtilizationSum += $avail['weekly_utilization_rate'];
        }
        $avgUtilization = $allClassrooms->count() > 0 ? round($totalUtilizationSum / $allClassrooms->count(), 1) : 0;

        $totalRooms = Classroom::count();
        $activeRooms = Classroom::where('is_active', true)->count();
        $inactiveRooms = $totalRooms - $activeRooms;
        $totalCapacity = (int) Classroom::where('is_active', true)->sum('capacity');
        $avgCapacity = $activeRooms > 0 ? round(Classroom::where('is_active', true)->avg('capacity')) : 0;
        $withDevice = Classroom::has('zktecoDevice')->count();
        $withoutDevice = max(0, $totalRooms - $withDevice);
        $totalBuildings = Classroom::distinct('building')->count('building');

        return Inertia::render('classrooms/index', [
            'data' => $paginated,
            'filters' => $request->only(['search', 'per_page']),
            'stats' => [
                'total' => $totalRooms,
                'active' => $activeRooms,
                'inactive' => $inactiveRooms,
                'total_capacity' => $totalCapacity,
                'avg_capacity' => $avgCapacity,
                'with_device' => $withDevice,
                'without_device' => $withoutDevice,
                'total_buildings' => $totalBuildings,
                'full_rooms' => $fullRoomsCount,
                'available_rooms' => max(0, $activeRooms - $fullRoomsCount),
                'avg_utilization' => $avgUtilization,
                'operating_hours' => '7:00 AM - 7:00 PM (12 hrs/day)',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('classrooms/create', [
            'roomTypes' => RoomType::cases(),
        ]);
    }

    public function store(ClassroomRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('classrooms.index')->with('success', 'Classroom created successfully');
    }

    public function show(Request $request, Classroom $classroom)
    {
        $classroom->load([
            'scheduleConflicts',
            'zktecoDevice',
            'schedules' => function ($query) {
                $query->where('is_active', true)
                    ->with(['subject', 'semester', 'teacherAssignment.teacher.user']);
            },
        ]);

        $timeSlots = \App\Models\TimeSlot::active()->get(['id', 'name', 'start_time', 'end_time'])->keyBy('id');

        // Build structured Monday - Sunday weekly schedule
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $weeklySchedule = [];
        foreach ($daysOfWeek as $day) {
            $weeklySchedule[$day] = [];
        }

        foreach ($classroom->schedules as $schedule) {
            if (is_array($schedule->time_slots)) {
                foreach ($schedule->time_slots as $slot) {
                    $day = strtolower($slot['day'] ?? '');
                    $slotId = $slot['time_slot_id'] ?? null;
                    $slotInfo = $slotId && isset($timeSlots[$slotId]) ? $timeSlots[$slotId] : null;

                    $startTime = $slot['start'] ?? null;
                    if (! $startTime && $slotInfo) {
                        $startTime = $slotInfo->start_time instanceof \Carbon\Carbon
                            ? $slotInfo->start_time->format('H:i')
                            : (string) $slotInfo->start_time;
                    }
                    if (is_string($startTime) && str_contains($startTime, 'T')) {
                        $startTime = substr(explode('T', $startTime)[1], 0, 5);
                    }

                    $endTime = $slot['end'] ?? null;
                    if (! $endTime && $slotInfo) {
                        $endTime = $slotInfo->end_time instanceof \Carbon\Carbon
                            ? $slotInfo->end_time->format('H:i')
                            : (string) $slotInfo->end_time;
                    }
                    if (is_string($endTime) && str_contains($endTime, 'T')) {
                        $endTime = substr(explode('T', $endTime)[1], 0, 5);
                    }

                    if ($day && isset($weeklySchedule[$day])) {
                        $weeklySchedule[$day][] = [
                            'schedule_id' => $schedule->id,
                            'subject_code' => $schedule->subject?->code,
                            'subject_title' => $schedule->subject?->title,
                            'section' => $schedule->section,
                            'semester' => $schedule->semester?->name,
                            'academic_year' => $schedule->semester?->academic_year,
                            'teacher_name' => $schedule->teacherAssignment?->teacher?->user?->name
                                ?? $schedule->teacherAssignment?->teacher?->full_name
                                ?? 'TBA',
                            'time_slot_id' => $slotId,
                            'slot_name' => $slotInfo?->name,
                            'start_time' => $startTime,
                            'end_time' => $endTime,
                        ];
                    }
                }
            }
        }

        // Sort each day's sessions by start_time
        foreach ($weeklySchedule as $day => &$sessions) {
            usort($sessions, function ($a, $b) {
                return strcmp($a['start_time'] ?? '', $b['start_time'] ?? '');
            });
        }
        unset($sessions);

        // Fetch paginated room schedule reservations
        $roomSchedulesQuery = $classroom->roomSchedules()
            ->with(['schedule.subject', 'schedule.semester'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc');

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $roomSchedulesQuery->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%")
                    ->orWhereHas('schedule', function ($sq) use ($search) {
                        $sq->where('section', 'like', "%{$search}%")
                            ->orWhereHas('subject', function ($subq) use ($search) {
                                $subq->where('code', 'like', "%{$search}%")
                                    ->orWhere('title', 'like', "%{$search}%");
                            });
                    });
            });
        }

        $roomSchedules = $roomSchedulesQuery->paginate(10)->withQueryString();

        $availability = $this->availabilityService->calculateForClassroom($classroom);

        return Inertia::render('classrooms/show', [
            'classroom' => $classroom,
            'weeklySchedule' => $weeklySchedule,
            'roomSchedules' => $roomSchedules,
            'availability' => $availability,
            'totalWeeklyClasses' => array_sum(array_map('count', $weeklySchedule)),
            'totalReservations' => $classroom->roomSchedules()->count(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function edit(Classroom $classroom)
    {
        return Inertia::render('classrooms/edit', [
            'classroom' => $classroom,
            'roomTypes' => RoomType::cases(),
        ]);
    }

    public function update(ClassroomRequest $request, Classroom $classroom)
    {
        $this->service->updateFromRequest($classroom->id, $request);

        return redirect()->route('classrooms.index')->with('success', 'Classroom updated successfully');
    }

    public function destroy(Classroom $classroom)
    {
        $this->service->delete($classroom->id);

        return redirect()->route('classrooms.index')->with('success', 'Classroom deleted successfully');
    }
}
