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
        $filters = $request->only(['teacher_id', 'semester_id', 'status', 'start_date', 'end_date', 'per_page']);
        
        $query = TeacherSchedule::query()->with(['teacher.user', 'subject', 'semester']);
        
        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }
        
        if (isset($filters['semester_id'])) {
            $query->where('semester_id', $filters['semester_id']);
        }
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('scheduled_date', [$filters['start_date'], $filters['end_date']]);
        }

        return Inertia::render('teacher-schedules/index', [
            'schedules' => $query->latest()->paginate($filters['per_page'] ?? 10)->withQueryString(),
            'filters' => $filters,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(TeacherSchedule $teacherSchedule): Response
    {
        return Inertia::render('teacher-schedules/show', [
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
}
