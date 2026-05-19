<?php

namespace App\Http\Controllers;

use App\Models\TeacherSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        if (auth()->user()->hasAnyRole(['Admin', 'Faculty Admin', 'Faculty Staff'])) {
            return redirect()->route('admin.dashboard');
        }

        $teacher   = auth()->user()->teacher ?? null;
        $teacherId = $teacher?->id ?? 0;

        $baseQuery = fn () => TeacherSchedule::with(['subject', 'semester'])
            ->where('teacher_id', $teacherId);

        $today      = Carbon::today();
        $weekStart  = Carbon::now()->startOfWeek();
        $weekEnd    = Carbon::now()->endOfWeek();
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd   = Carbon::now()->endOfMonth();

        // Calendar month — supports navigation via ?month=YYYY-MM
        $monthParam = $request->get('month');
        $calMonth   = $monthParam ? Carbon::parse($monthParam.'-01') : Carbon::now();
        $calStart   = $calMonth->copy()->startOfMonth();
        $calEnd     = $calMonth->copy()->endOfMonth();

        $classesToday       = $teacherId ? $baseQuery()->whereDate('scheduled_date', $today)->count() : 0;
        $classesThisWeek    = $teacherId ? $baseQuery()->whereBetween('scheduled_date', [$weekStart, $weekEnd])->count() : 0;
        $classesThisMonth   = $teacherId ? $baseQuery()->whereBetween('scheduled_date', [$monthStart, $monthEnd])->count() : 0;
        $completedThisMonth = $teacherId
            ? $baseQuery()
                ->whereBetween('scheduled_date', [$monthStart, $monthEnd])
                ->where('status', 'completed')
                ->count()
            : 0;

        // Today's schedules — always actual today, used for "Next Class" panel
        $todaySchedules = $teacherId
            ? $baseQuery()
                ->whereDate('scheduled_date', $today)
                ->orderBy('start_time')
                ->get()
                ->map(fn ($s) => [
                    'id'            => $s->id,
                    'subject_code'  => $s->subject->code ?? '',
                    'subject_title' => $s->subject->title ?? '',
                    'semester_name' => $s->semester->name ?? '',
                    'start_time'    => $s->start_time,
                    'end_time'      => $s->end_time,
                    'room'          => $s->room,
                    'section'       => $s->section,
                    'status'        => $s->status->value,
                    'is_holiday'    => (bool) $s->is_holiday,
                ])
            : collect();

        // All schedules for the viewed calendar month — used for day selection
        $monthSchedules = $teacherId
            ? $baseQuery()
                ->whereBetween('scheduled_date', [$calStart, $calEnd])
                ->orderBy('scheduled_date')
                ->orderBy('start_time')
                ->get()
                ->map(fn ($s) => [
                    'id'             => $s->id,
                    'scheduled_date' => $s->scheduled_date->toDateString(),
                    'subject_code'   => $s->subject->code ?? '',
                    'subject_title'  => $s->subject->title ?? '',
                    'semester_name'  => $s->semester->name ?? '',
                    'start_time'     => $s->start_time,
                    'end_time'       => $s->end_time,
                    'room'           => $s->room,
                    'section'        => $s->section,
                    'status'         => $s->status->value,
                    'is_holiday'     => (bool) $s->is_holiday,
                    'holiday_name'   => $s->holiday_name,
                ])
            : collect();

        return Inertia::render('dashboard', [
            'stats' => [
                'today'           => $classesToday,
                'this_week'       => $classesThisWeek,
                'this_month'      => $classesThisMonth,
                'completed_month' => $completedThisMonth,
            ],
            'today_schedules' => $todaySchedules,
            'month_schedules' => $monthSchedules,
            'current_month'   => $calMonth->format('Y-m'),
            'teacher'         => $teacher ? ['name' => $teacher->full_name] : null,
        ]);
    }
}
