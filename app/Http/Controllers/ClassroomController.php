<?php

namespace App\Http\Controllers;

use App\Enums\RoomType;
use App\Http\Requests\ClassroomRequest;
use App\Models\Classroom;
use App\Services\ClassroomService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function __construct(
        protected ClassroomService $service
    ) {}

    public function index(Request $request)
    {
        $query = Classroom::query()->with('zktecoDevice');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('building', 'like', '%'.$search.'%')
                ->orWhere('room_number', 'like', '%'.$search.'%')
                ->orWhere('room_name', 'like', '%'.$search.'%');
        }

        $totalRooms = Classroom::count();
        $activeRooms = Classroom::where('is_active', true)->count();
        $inactiveRooms = $totalRooms - $activeRooms;
        $totalCapacity = (int) Classroom::where('is_active', true)->sum('capacity');
        $avgCapacity = $activeRooms > 0 ? round(Classroom::where('is_active', true)->avg('capacity')) : 0;
        $withDevice = Classroom::has('zktecoDevice')->count();
        $withoutDevice = max(0, $totalRooms - $withDevice);
        $totalBuildings = Classroom::distinct('building')->count('building');

        return Inertia::render('classrooms/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
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

    public function show(Classroom $classroom)
    {
        $classroom->load(['scheduleConflicts', 'zktecoDevice']);

        return Inertia::render('classrooms/show', [
            'classroom' => $classroom,
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
