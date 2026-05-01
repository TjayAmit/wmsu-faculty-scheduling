<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeacherSchedule\StoreTeacherScheduleRequest;
use App\Http\Requests\TeacherSchedule\UpdateTeacherScheduleRequest;
use App\Models\TeacherSchedule;
use App\Services\TeacherScheduleService;
use App\Services\TeacherScheduleGenerationService;
use App\Repositories\TeacherScheduleRepository;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeacherScheduleController extends Controller
{
    public function __construct(
        private TeacherScheduleService $service,
        private TeacherScheduleGenerationService $generationService,
        private TeacherScheduleRepository $repository
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['teacher_id', 'semester_id', 'status', 'start_date', 'end_date']);
        
        $schedules = $this->repository->all();
        
        if (isset($filters['teacher_id']) && isset($filters['semester_id'])) {
            $schedules = $this->service->findByTeacherAndSemester(
                $filters['teacher_id'], 
                $filters['semester_id']
            );
        } elseif (isset($filters['status'])) {
            $schedules = $this->service->findByStatus($filters['status']);
        } elseif (isset($filters['start_date']) && isset($filters['end_date'])) {
            $schedules = $this->service->findByDateRange(
                $filters['start_date'], 
                $filters['end_date']
            );
        }

        return Inertia::render('TeacherSchedules/Index', [
            'schedules' => $schedules->load(['teacher.user', 'subject', 'semester']),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('TeacherSchedules/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherScheduleRequest $request): RedirectResponse
    {
        $schedule = $this->service->create($request);
        
        return redirect()->route('teacher-schedules.show', $schedule->id)
            ->with('success', 'Teacher schedule created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(TeacherSchedule $teacherSchedule): Response
    {
        return Inertia::render('TeacherSchedules/Show', [
            'schedule' => $teacherSchedule->load([
                'teacher.user',
                'subject',
                'semester',
                'teacherAssignment',
                'draftSchedule',
                'attendanceRecord'
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TeacherSchedule $teacherSchedule): Response
    {
        return Inertia::render('TeacherSchedules/Edit', [
            'schedule' => $teacherSchedule->load([
                'teacher.user',
                'subject',
                'semester'
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherScheduleRequest $request, TeacherSchedule $teacherSchedule): RedirectResponse
    {
        $schedule = $this->service->update($request, $teacherSchedule);
        
        return redirect()->route('teacher-schedules.show', $schedule->id)
            ->with('success', 'Teacher schedule updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TeacherSchedule $teacherSchedule): RedirectResponse
    {
        $this->service->delete($teacherSchedule);
        
        return redirect()->route('teacher-schedules.index')
            ->with('success', 'Teacher schedule deleted successfully');
    }

    /**
     * Cancel a teacher schedule.
     */
    public function cancel(TeacherSchedule $teacherSchedule): RedirectResponse
    {
        $schedule = $this->service->cancel($teacherSchedule);
        
        return redirect()->route('teacher-schedules.show', $schedule->id)
            ->with('success', 'Teacher schedule cancelled successfully');
    }

    /**
     * Complete a teacher schedule.
     */
    public function complete(TeacherSchedule $teacherSchedule): RedirectResponse
    {
        $schedule = $this->service->complete($teacherSchedule);
        
        return redirect()->route('teacher-schedules.show', $schedule->id)
            ->with('success', 'Teacher schedule marked as completed');
    }

    /**
     * Regenerate schedules from draft schedule.
     */
    public function regenerateFromDraft(int $draftScheduleId): RedirectResponse
    {
        $draftSchedule = \App\Models\DraftSchedule::findOrFail($draftScheduleId);
        
        if (!$draftSchedule->isApproved()) {
            return redirect()->back()
                ->with('error', 'Cannot regenerate schedules from unapproved draft');
        }

        $schedules = $this->generationService->regenerateFromDraft($draftSchedule);
        
        return redirect()->back()
            ->with('success', "Regenerated {$schedules->count()} schedule sessions");
    }

    /**
     * Display schedules for a specific teacher and semester.
     */
    public function teacherSemesterSchedules(int $teacherId, int $semesterId): Response
    {
        $schedules = $this->service->findByTeacherAndSemester($teacherId, $semesterId);
        
        return Inertia::render('TeacherSchedules/TeacherSemester', [
            'schedules' => $schedules->load(['subject', 'attendanceRecord']),
            'teacherId' => $teacherId,
            'semesterId' => $semesterId,
        ]);
    }
}
