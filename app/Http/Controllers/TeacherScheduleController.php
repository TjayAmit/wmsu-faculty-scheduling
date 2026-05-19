<?php

namespace App\Http\Controllers;

use App\Models\DraftSchedule;
use App\Models\TeacherSchedule;
use App\Repositories\TeacherScheduleRepository;
use App\Services\TeacherScheduleGenerationService;
use App\Services\TeacherScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        // Teacher grouped/session view
        if (auth()->user()->isTeacher() && ! auth()->user()->hasRole('admin')) {
            $teacherId = auth()->user()->teacher?->id ?? 0;

            // Mode 2: session list for a specific subject
            if ($request->filled('subject_id')) {
                $subjectId = $request->subject_id;
                $semesterId = $request->semester_id;

                $query = TeacherSchedule::with(['subject', 'semester'])
                    ->where('teacher_id', $teacherId)
                    ->where('subject_id', $subjectId);

                if ($semesterId) {
                    $query->where('semester_id', $semesterId);
                }
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                $perPage = max(5, min(50, (int) ($request->per_page ?? 15)));
                $paginated = $query->orderBy('scheduled_date')->paginate($perPage)->withQueryString();
                $first = TeacherSchedule::with(['subject', 'semester'])
                    ->where('teacher_id', $teacherId)
                    ->where('subject_id', $subjectId)
                    ->first();

                return Inertia::render('teacher-schedules/index', [
                    'mode' => 'sessions',
                    'sessions' => [
                        'data' => $paginated->map(fn ($s) => [
                            'id' => $s->id,
                            'scheduled_date' => $s->scheduled_date->toDateString(),
                            'day_of_week' => $s->day_of_week,
                            'start_time' => $s->start_time->format('H:i:s'),
                            'end_time' => $s->end_time->format('H:i:s'),
                            'room' => $s->room,
                            'section' => $s->section,
                            'status' => $s->status instanceof \BackedEnum ? $s->status->value : $s->status,
                            'notes' => $s->notes,
                            'is_holiday' => (bool) $s->is_holiday,
                            'holiday_name' => $s->holiday_name,
                        ]),
                        'total' => $paginated->total(),
                        'current_page' => $paginated->currentPage(),
                        'last_page' => $paginated->lastPage(),
                        'per_page' => $paginated->perPage(),
                        'from' => $paginated->firstItem(),
                        'to' => $paginated->lastItem(),
                    ],
                    'subject' => [
                        'id' => $first?->subject_id,
                        'code' => $first?->subject->code ?? '',
                        'title' => $first?->subject->title ?? '',
                        'semester_name' => $first?->semester->name ?? '',
                        'academic_year' => $first?->semester->academic_year ?? '',
                        'section' => $first?->section,
                        'room' => $first?->room,
                        'start_time' => $first?->start_time?->format('H:i:s'),
                        'end_time' => $first?->end_time?->format('H:i:s'),
                    ],
                    'filters' => $request->only(['subject_id', 'semester_id', 'status', 'per_page']),
                ]);
            }

            // Mode 1: subject-grouped cards
            $sessions = TeacherSchedule::with(['subject', 'semester'])
                ->where('teacher_id', $teacherId)
                ->get();

            $grouped = $sessions->groupBy(fn ($s) => $s->subject_id.'-'.$s->semester_id)
                ->map(function ($group) {
                    $first = $group->first();
                    $today = now()->toDateString();
                    $next = $group
                        ->filter(fn ($s) => ($s->status instanceof \BackedEnum ? $s->status->value : $s->status) === 'scheduled'
                            && $s->scheduled_date->toDateString() >= $today)
                        ->sortBy(fn ($s) => $s->scheduled_date->toDateString())
                        ->first();
                    $days = $group->pluck('day_of_week')->unique()->sort()->values();

                    return [
                        'subject_id' => $first->subject_id,
                        'semester_id' => $first->semester_id,
                        'subject_code' => $first->subject->code ?? '',
                        'subject_title' => $first->subject->title ?? '',
                        'semester_name' => $first->semester->name ?? '',
                        'academic_year' => $first->semester->academic_year ?? '',
                        'section' => $first->section,
                        'room' => $first->room,
                        'start_time' => $first->start_time->format('H:i:s'),
                        'end_time' => $first->end_time->format('H:i:s'),
                        'days' => $days,
                        'total' => $group->count(),
                        'scheduled' => $group->filter(fn ($s) => ($s->status instanceof \BackedEnum ? $s->status->value : $s->status) === 'scheduled')->count(),
                        'completed' => $group->filter(fn ($s) => ($s->status instanceof \BackedEnum ? $s->status->value : $s->status) === 'completed')->count(),
                        'cancelled' => $group->filter(fn ($s) => ($s->status instanceof \BackedEnum ? $s->status->value : $s->status) === 'cancelled')->count(),
                        'postponed' => $group->filter(fn ($s) => ($s->status instanceof \BackedEnum ? $s->status->value : $s->status) === 'postponed')->count(),
                        'next_session' => $next?->scheduled_date->toDateString(),
                    ];
                })->values();

            return Inertia::render('teacher-schedules/index', [
                'mode' => 'subjects',
                'subjects' => $grouped,
                'filters' => [],
            ]);
        }

        // Admin / non-teacher paginated view (original behaviour)
        $filters = $request->only(['teacher_id', 'semester_id', 'status', 'start_date', 'end_date', 'per_page']);

        $query = TeacherSchedule::query()->with(['teacher.user', 'subject', 'semester']);

        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (isset($filters['semester_id'])) {
            $query->where('semester_id', $filters['semester_id']);
        }

        if (! empty($filters['status'])) {
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
                'attendanceRecord',
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
        $draftSchedule = DraftSchedule::findOrFail($draftScheduleId);

        if (! $draftSchedule->isApproved()) {
            return redirect()->back()
                ->with('error', 'Cannot regenerate schedules from unapproved draft');
        }

        $schedules = $this->generationService->regenerateFromDraft($draftSchedule);

        return redirect()->back()
            ->with('success', "Regenerated {$schedules->count()} schedule sessions");
    }
}
