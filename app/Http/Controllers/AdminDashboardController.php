<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\Section;
use App\Models\SubstituteRequest;
use App\Models\Teacher;
use App\Models\TeacherSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        // Calendar month — supports navigation via ?month=YYYY-MM
        $monthParam = $request->get('month');
        $calMonth = $monthParam ? Carbon::parse($monthParam.'-01') : Carbon::now();
        $calStart = $calMonth->copy()->startOfMonth();
        $calEnd = $calMonth->copy()->endOfMonth();

        $stats = [
            'active_teachers' => Teacher::where('is_active', true)->count(),
            'active_sections' => Section::where('is_active', true)->count(),
            'pending_leave' => LeaveRequest::where('status', 'pending')->count(),
            'pending_substitutes' => SubstituteRequest::where('status', 'pending')->count(),
        ];

        $monthSchedules = TeacherSchedule::with(['subject', 'teacher', 'semester'])
            ->whereBetween('scheduled_date', [$calStart, $calEnd])
            ->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'scheduled_date' => $s->scheduled_date->toDateString(),
                'subject_code' => $s->subject->code ?? '',
                'subject_title' => $s->subject->title ?? '',
                'section' => $s->section,
                'teacher_name' => $s->teacher ? trim("{$s->teacher->first_name} {$s->teacher->last_name}") : null,
                'room' => $s->room,
                'start_time' => $s->start_time,
                'end_time' => $s->end_time,
                'status' => $s->status instanceof \BackedEnum ? $s->status->value : $s->status,
                'semester_name' => $s->semester->name ?? '',
            ]);

        $leave = LeaveRequest::with(['teacher'])
            ->where('status', 'pending')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'type' => 'leave',
                'teacher_name' => $r->teacher ? "{$r->teacher->first_name} {$r->teacher->last_name}" : 'Unknown',
                'label' => ucfirst($r->leave_type).' Leave',
                'status' => $r->status,
                'created_at' => $r->created_at,
                'url' => "/leave-requests/{$r->id}",
            ]);

        $sub = SubstituteRequest::with(['requestingTeacher'])
            ->where('status', 'pending')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'type' => 'substitute',
                'teacher_name' => $r->requestingTeacher ? "{$r->requestingTeacher->first_name} {$r->requestingTeacher->last_name}" : 'Unknown',
                'label' => 'Substitute Request',
                'status' => $r->status,
                'created_at' => $r->created_at,
                'url' => "/substitute-requests/{$r->id}",
            ]);

        $pendingRequests = $leave->concat($sub)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('admin-dashboard', [
            'stats' => $stats,
            'month_schedules' => $monthSchedules,
            'pending_requests' => $pendingRequests,
            'current_month' => $calMonth->format('Y-m'),
        ]);
    }
}
