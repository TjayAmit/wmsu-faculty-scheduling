<?php

namespace App\Http\Controllers;

use App\Enums\TeacherScheduleStatus;
use App\Models\Curriculum;
use App\Models\LeaveRequest;
use App\Models\Section;
use App\Models\SubstituteRequest;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Services\Zkteco\ZktecoAttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request, ZktecoAttendanceService $attendanceService)
    {
        // Calendar month — supports navigation via ?month=YYYY-MM
        $monthParam = $request->get('month');
        $calMonth = $monthParam ? Carbon::parse($monthParam.'-01') : Carbon::now();
        $calStart = $calMonth->copy()->startOfMonth();
        $calEnd = $calMonth->copy()->endOfMonth();

        // Ensure all teachers with active assignments have their schedule sessions generated for this month
        $activeTeachers = Teacher::whereHas('assignments', fn ($q) => $q->where('is_active', true))->get();
        foreach ($activeTeachers as $teacherModel) {
            $attendanceService->ensureTeacherSchedulesForPeriod($teacherModel, $calStart, $calEnd);
        }

        $stats = [
            'total_teachers' => Teacher::count(),
            'active_teachers' => Teacher::where('is_active', true)->count(),
            'total_curricula' => Curriculum::count(),
            'programs_with_curriculum' => Curriculum::distinct('program_id')->count('program_id'),
            'active_sections' => Section::where('is_active', true)->count(),
            'pending_leave' => LeaveRequest::where('status', 'pending')->count(),
            'total_substitutes' => SubstituteRequest::count(),
            'pending_substitutes' => SubstituteRequest::where('status', 'pending')->count(),
        ];

        $now = Carbon::now();

        $monthSchedules = TeacherSchedule::with(['subject', 'teacher', 'semester', 'attendanceRecord'])
            ->whereBetween('scheduled_date', [$calStart, $calEnd])
            ->where(function ($query) {
                // Focus on schedules under College of Education
                $query->whereHas('teacher', function ($q) {
                    $q->where('department', 'like', '%College of Education%');
                })->orWhereDoesntHave('teacher');
            })
            ->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($s) use ($now) {
                $start = Carbon::parse($s->start_time);
                $end = Carbon::parse($s->end_time);
                $date = $s->scheduled_date;

                $hasAttendance = !empty($s->attendance_record_id) || $s->status === TeacherScheduleStatus::COMPLETED || $s->status === 'completed';

                $attendanceStatus = 'scheduled';
                if ($s->status === TeacherScheduleStatus::CANCELLED || $s->status === 'cancelled') {
                    $attendanceStatus = 'cancelled';
                } elseif ($hasAttendance) {
                    $attendanceStatus = 'present';
                } else {
                    $isPast = false;
                    if ($date->isPast() && !$date->isToday()) {
                        $isPast = true;
                    } elseif ($date->isToday() && $now->greaterThan($end)) {
                        $isPast = true;
                    }

                    if ($isPast) {
                        $attendanceStatus = 'absent';
                    } elseif ($date->isToday() && $now->between($start, $end)) {
                        $attendanceStatus = 'in_session';
                    } else {
                        $attendanceStatus = 'scheduled';
                    }
                }

                return [
                    'id' => $s->id,
                    'scheduled_date' => $s->scheduled_date->toDateString(),
                    'subject_code' => $s->subject->code ?? '',
                    'subject_title' => $s->subject->title ?? '',
                    'section' => $s->section,
                    'teacher_name' => $s->teacher ? trim("{$s->teacher->first_name} {$s->teacher->last_name}") : null,
                    'department' => $s->teacher->department ?? 'College of Education',
                    'room' => $s->room,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'status' => $s->status instanceof \BackedEnum ? $s->status->value : $s->status,
                    'attendance_status' => $attendanceStatus,
                    'semester_name' => $s->semester->name ?? '',
                ];
            });

        $substituteRequests = SubstituteRequest::with(['requestingTeacher', 'substituteTeacher', 'schedule.subject'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'requesting_teacher' => $r->requestingTeacher ? "{$r->requestingTeacher->first_name} {$r->requestingTeacher->last_name}" : 'Unknown Teacher',
                'substitute_teacher' => $r->substituteTeacher ? "{$r->substituteTeacher->first_name} {$r->substituteTeacher->last_name}" : 'Unassigned',
                'subject_code' => $r->schedule?->subject?->code ?? null,
                'subject_title' => $r->schedule?->subject?->title ?? null,
                'section' => $r->schedule?->section ?? null,
                'date' => $r->date ? Carbon::parse($r->date)->format('M d, Y') : null,
                'reason' => $r->reason,
                'status' => $r->status,
                'created_at' => $r->created_at ? $r->created_at->toISOString() : null,
                'url' => "/substitute-requests/{$r->id}",
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
                'created_at' => $r->created_at ? $r->created_at->toISOString() : null,
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
                'created_at' => $r->created_at ? $r->created_at->toISOString() : null,
                'url' => "/substitute-requests/{$r->id}",
            ]);

        $pendingRequests = $leave->concat($sub)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('admin-dashboard', [
            'stats' => $stats,
            'month_schedules' => $monthSchedules,
            'substitute_requests' => $substituteRequests,
            'pending_requests' => $pendingRequests,
            'current_month' => $calMonth->format('Y-m'),
        ]);
    }
}
