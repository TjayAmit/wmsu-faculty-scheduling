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
        $query = Classroom::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('building', 'like', '%'.$search.'%')
                ->orWhere('room_number', 'like', '%'.$search.'%')
                ->orWhere('room_name', 'like', '%'.$search.'%');
        }

        return Inertia::render('classrooms/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
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
        $classroom->load('scheduleConflicts');

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
