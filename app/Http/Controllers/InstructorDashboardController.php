<?php

namespace App\Http\Controllers;

use App\Enums\AttendanceStatus;
use App\Enums\TeacherScheduleStatus;
use App\Enums\ZktecoMatchStatus;
use App\Models\LeaveRequest;
use App\Models\Semester;
use App\Models\SubstituteRequest;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Models\ZktecoAttendanceLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstructorDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = auth()->user();

        // Allow Admin or Faculty Admin to view specific teacher's dashboard via ?teacher_id=
        $teacher = null;
        if ($user->hasAnyRole(['Admin', 'Faculty Admin']) && $request->filled('teacher_id')) {
            $teacher = Teacher::with('user')->find($request->input('teacher_id'));
        }

        if (!$teacher) {
            $teacher = $user->teacher;
        }

        // If an admin/staff with no teacher profile navigates here, fallback to first teacher
        if (!$teacher && $user->hasAnyRole(['Admin', 'Faculty Admin', 'Faculty Staff'])) {
            $teacher = Teacher::with('user')->first();
        }

        $now = Carbon::now();
        $today = Carbon::today();
        $todayDayOfWeek = strtolower($today->format('l'));

        // 1. Current active semester
        $currentSemester = Semester::where('is_current', true)->first()
            ?? Semester::latest('start_date')->first();

        // 2. Instructor Profile Information
        $teacherProfile = null;
        if ($teacher) {
            $teacherProfile = [
                'id' => $teacher->id,
                'full_name' => $teacher->full_name,
                'email' => $teacher->email,
                'employee_id' => $teacher->employee_id,
                'department' => $teacher->department ?? 'General Faculty',
                'rank' => $teacher->rank ?? 'Instructor',
                'employment_type' => $teacher->employment_type instanceof \BackedEnum
                    ? $teacher->employment_type->value
                    : ($teacher->employment_type ?? 'full_time'),
                'biometric_pin' => $teacher->biometric_pin,
                'has_biometric' => !empty($teacher->biometric_pin),
            ];
        }

        $todayClasses = collect();
        $weeklySchedule = [
            'monday' => [],
            'tuesday' => [],
            'wednesday' => [],
            'thursday' => [],
            'friday' => [],
            'saturday' => [],
        ];
        $assignedCourses = collect();
        $recentPunches = collect();
        $recentRequests = collect();

        $todayClassesCount = 0;
        $todayCompletedCount = 0;
        $totalUnits = 0;
        $weeklyHours = 0;
        $monthlyAttendedCount = 0;
        $monthlyTotalCount = 0;
        $pendingRequestsCount = 0;

        if ($teacher) {
            $teacherId = $teacher->id;

            // 3. Active Assignments for Current Semester
            $assignments = TeacherAssignment::with(['schedule.subject', 'schedule.classroom', 'schedule.semester'])
                ->where('teacher_id', $teacherId)
                ->where('is_active', true)
                ->when($currentSemester, function ($q) use ($currentSemester) {
                    $q->whereHas('schedule', function ($sq) use ($currentSemester) {
                        $sq->where('semester_id', $currentSemester->id);
                    });
                })
                ->get();

            // Build assigned courses and calculate total units
            $assignedCourses = $assignments->map(function ($assignment) {
                $sched = $assignment->schedule;
                $subject = $sched?->subject;
                $classroom = $sched?->classroom;

                // Format time slots string
                $slotsText = '';
                if (!empty($sched?->time_slots) && is_array($sched->time_slots)) {
                    $slotsText = collect($sched->time_slots)->map(function ($slot) {
                        $day = ucfirst($slot['day'] ?? '');
                        $start = !empty($slot['start_time']) ? Carbon::parse($slot['start_time'])->format('g:i A') : '';
                        $end = !empty($slot['end_time']) ? Carbon::parse($slot['end_time'])->format('g:i A') : '';
                        return "{$day} {$start} - {$end}";
                    })->implode(' | ');
                }

                return [
                    'id' => $assignment->id,
                    'schedule_id' => $sched?->id,
                    'subject_code' => $subject?->code ?? 'N/A',
                    'subject_title' => $subject?->title ?? 'Untitled Subject',
                    'units' => (float) ($subject?->units ?? 0),
                    'lec_hours' => (float) ($subject?->lec_hours ?? 0),
                    'lab_hours' => (float) ($subject?->lab_hours ?? 0),
                    'section' => $sched?->section ?? 'N/A',
                    'room' => $sched?->room ?? $classroom?->name ?? 'TBA',
                    'schedule_display' => $slotsText ?: 'TBA',
                ];
            });

            $totalUnits = $assignedCourses->sum('units');

            // 4. Build Weekly Schedule Matrix from active assignments
            foreach ($assignments as $assignment) {
                $sched = $assignment->schedule;
                if (!$sched || empty($sched->time_slots) || !is_array($sched->time_slots)) {
                    continue;
                }

                $subject = $sched->subject;
                $classroom = $sched->classroom;

                foreach ($sched->time_slots as $slot) {
                    $dayKey = strtolower($slot['day'] ?? '');
                    if (!isset($weeklySchedule[$dayKey])) {
                        continue;
                    }

                    $startStr = $slot['start_time'] ?? null;
                    $endStr = $slot['end_time'] ?? null;

                    $startCarbon = $startStr ? Carbon::parse($startStr) : null;
                    $endCarbon = $endStr ? Carbon::parse($endStr) : null;

                    if ($startCarbon && $endCarbon) {
                        $diffMinutes = $endCarbon->diffInMinutes($startCarbon);
                        $weeklyHours += ($diffMinutes / 60);
                    }

                    $weeklySchedule[$dayKey][] = [
                        'schedule_id' => $sched->id,
                        'subject_code' => $subject?->code ?? 'N/A',
                        'subject_title' => $subject?->title ?? '',
                        'section' => $sched->section ?? 'N/A',
                        'room' => $slot['room'] ?? $sched->room ?? $classroom?->name ?? 'TBA',
                        'start_time' => $startCarbon ? $startCarbon->format('g:i A') : '',
                        'end_time' => $endCarbon ? $endCarbon->format('g:i A') : '',
                        'start_raw' => $startStr,
                        'units' => $subject?->units ?? 0,
                    ];
                }
            }

            // Sort each day in weekly schedule by start time
            foreach ($weeklySchedule as $day => &$slots) {
                usort($slots, function ($a, $b) {
                    return strcmp($a['start_raw'] ?? '', $b['start_raw'] ?? '');
                });
            }
            unset($slots);

            // 5. Today's Sessions & Attendance
            // Check TeacherSchedule sessions first
            $todayTeacherSchedules = TeacherSchedule::with(['subject', 'classroom', 'semester', 'attendanceRecord'])
                ->where('teacher_id', $teacherId)
                ->whereDate('scheduled_date', $today)
                ->orderBy('start_time')
                ->get();

            // Also fetch today's biometric logs for this teacher
            $todayPunches = ZktecoAttendanceLog::with(['classroom', 'device'])
                ->where('teacher_id', $teacherId)
                ->whereDate('punch_time', $today)
                ->orderBy('punch_time', 'asc')
                ->get();

            if ($todayTeacherSchedules->isNotEmpty()) {
                $todayClasses = $todayTeacherSchedules->map(function ($s) use ($now, $todayPunches) {
                    $start = Carbon::parse($s->start_time);
                    $end = Carbon::parse($s->end_time);

                    $isLive = $now->between($start, $end);
                    $isPast = $now->greaterThan($end);
                    $isFuture = $now->lessThan($start);

                    // Find matched punch for this schedule session or classroom
                    $matchedPunch = $todayPunches->first(function ($punch) use ($s, $start, $end) {
                        if ($punch->teacher_schedule_id === $s->id) {
                            return true;
                        }
                        if ($punch->match_status === ZktecoMatchStatus::MATCHED) {
                            $punchTime = Carbon::parse($punch->punch_time);
                            return $punchTime->between($start->copy()->subMinutes(30), $end);
                        }
                        return false;
                    });

                    // Determine display status
                    $displayStatus = 'upcoming';
                    if ($s->status === TeacherScheduleStatus::CANCELLED) {
                        $displayStatus = 'cancelled';
                    } elseif ($s->status === TeacherScheduleStatus::COMPLETED || ($isPast && $matchedPunch)) {
                        $displayStatus = 'completed';
                    } elseif ($isLive) {
                        $displayStatus = 'live';
                    } elseif ($isPast) {
                        $displayStatus = 'past';
                    }

                    return [
                        'id' => $s->id,
                        'subject_code' => $s->subject?->code ?? 'N/A',
                        'subject_title' => $s->subject?->title ?? '',
                        'section' => $s->section ?? 'N/A',
                        'room' => $s->room ?? $s->classroom?->name ?? 'TBA',
                        'start_time' => $start->format('g:i A'),
                        'end_time' => $end->format('g:i A'),
                        'start_iso' => $start->toIso8601String(),
                        'end_iso' => $end->toIso8601String(),
                        'duration' => $start->diff($end)->format('%h hr %i min'),
                        'is_live' => $isLive,
                        'is_past' => $isPast,
                        'display_status' => $displayStatus,
                        'is_holiday' => (bool) $s->is_holiday,
                        'holiday_name' => $s->holiday_name,
                        'punched_in' => (bool) $matchedPunch,
                        'punch_time' => $matchedPunch ? Carbon::parse($matchedPunch->punch_time)->format('g:i A') : null,
                        'punch_device' => $matchedPunch?->device?->name,
                    ];
                });
            } else {
                // If specific date records have not been batch-generated yet, synthesize today's slots from active assignments
                $todaySlots = $weeklySchedule[$todayDayOfWeek] ?? [];
                $todayClasses = collect($todaySlots)->map(function ($slot, $idx) use ($today, $now, $todayPunches) {
                    $startStr = $slot['start_raw'] ? $today->toDateString() . ' ' . $slot['start_raw'] : null;
                    $start = $startStr ? Carbon::parse($startStr) : null;
                    $end = $start ? $start->copy()->addHours(1)->addMinutes(30) : null; // estimated if end not specified

                    $isLive = $start && $end ? $now->between($start, $end) : false;
                    $isPast = $end ? $now->greaterThan($end) : false;

                    $matchedPunch = $todayPunches->first(function ($punch) use ($slot) {
                        return $punch->match_status === ZktecoMatchStatus::MATCHED;
                    });

                    return [
                        'id' => $slot['schedule_id'] ?? ($idx + 1),
                        'subject_code' => $slot['subject_code'],
                        'subject_title' => $slot['subject_title'],
                        'section' => $slot['section'],
                        'room' => $slot['room'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                        'start_iso' => $start?->toIso8601String(),
                        'end_iso' => $end?->toIso8601String(),
                        'duration' => '1 hr 30 min',
                        'is_live' => $isLive,
                        'is_past' => $isPast,
                        'display_status' => $isLive ? 'live' : ($isPast ? ($matchedPunch ? 'completed' : 'past') : 'upcoming'),
                        'is_holiday' => false,
                        'holiday_name' => null,
                        'punched_in' => (bool) $matchedPunch,
                        'punch_time' => $matchedPunch ? Carbon::parse($matchedPunch->punch_time)->format('g:i A') : null,
                        'punch_device' => $matchedPunch?->device?->name,
                    ];
                });
            }

            $todayClassesCount = $todayClasses->count();
            $todayCompletedCount = $todayClasses->filter(fn($c) => in_array($c['display_status'], ['completed']) || $c['punched_in'])->count();

            // 6. Monthly Attendance metrics
            $monthStart = Carbon::now()->startOfMonth();
            $monthEnd = Carbon::now()->endOfMonth();

            $monthlyTeacherSchedules = TeacherSchedule::where('teacher_id', $teacherId)
                ->whereBetween('scheduled_date', [$monthStart, $monthEnd])
                ->where('is_holiday', false)
                ->get();

            $monthlyTotalCount = $monthlyTeacherSchedules->count();
            $monthlyAttendedCount = $monthlyTeacherSchedules->filter(function ($s) {
                return $s->status === TeacherScheduleStatus::COMPLETED || !empty($s->attendance_record_id);
            })->count();

            // Fallback for monthly count if teacher schedules are not yet materialized
            if ($monthlyTotalCount === 0 && count($weeklySchedule[$todayDayOfWeek] ?? []) > 0) {
                $monthlyTotalCount = count($weeklySchedule[$todayDayOfWeek]) * 4;
                $monthlyAttendedCount = ZktecoAttendanceLog::where('teacher_id', $teacherId)
                    ->whereBetween('punch_time', [$monthStart, $monthEnd])
                    ->where('match_status', ZktecoMatchStatus::MATCHED)
                    ->count();
            }

            // 7. Recent Biometric Punch Logs (Last 5)
            $recentPunches = ZktecoAttendanceLog::with(['classroom', 'device'])
                ->where('teacher_id', $teacherId)
                ->latest('punch_time')
                ->take(5)
                ->get()
                ->map(function ($punch) {
                    $status = $punch->match_status instanceof \BackedEnum
                        ? $punch->match_status->value
                        : $punch->match_status;

                    return [
                        'id' => $punch->id,
                        'punch_time' => $punch->punch_time->format('M d, Y g:i A'),
                        'time_ago' => $punch->punch_time->diffForHumans(),
                        'room' => $punch->classroom?->name ?? 'Unknown Room',
                        'device' => $punch->device?->name ?? 'Terminal',
                        'punch_type' => ucfirst(str_replace('_', ' ', $punch->punch_type ?? 'check_in')),
                        'verify_type' => ucfirst($punch->verify_type ?? 'biometric'),
                        'match_status' => $status,
                        'is_matched' => $status === ZktecoMatchStatus::MATCHED->value,
                        'rejection_reason' => $punch->rejection_reason,
                    ];
                });

            // 8. Recent Leave and Substitute Requests
            $recentLeaves = LeaveRequest::where('teacher_id', $teacherId)
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($leave) {
                    return [
                        'id' => $leave->id,
                        'type' => 'leave',
                        'title' => ucfirst($leave->leave_type) . ' Leave',
                        'date_range' => $leave->start_date->format('M d') . ($leave->start_date->eq($leave->end_date) ? '' : ' - ' . $leave->end_date->format('M d, Y')),
                        'status' => $leave->status,
                        'reason' => $leave->reason,
                        'created_at' => $leave->created_at->diffForHumans(),
                        'url' => route('leave-requests.show', $leave->id),
                    ];
                });

            $recentSubs = SubstituteRequest::with('substituteTeacher')
                ->where('requesting_teacher_id', $teacherId)
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($sub) {
                    $subTeacherName = $sub->substituteTeacher ? $sub->substituteTeacher->full_name : 'Pending Assignment';
                    return [
                        'id' => $sub->id,
                        'type' => 'substitute',
                        'title' => 'Substitute: ' . $subTeacherName,
                        'date_range' => $sub->date->format('M d, Y'),
                        'status' => $sub->status,
                        'reason' => $sub->reason,
                        'created_at' => $sub->created_at->diffForHumans(),
                        'url' => route('substitute-requests.show', $sub->id),
                    ];
                });

            $recentRequests = $recentLeaves->concat($recentSubs)
                ->sortByDesc('created_at')
                ->take(5)
                ->values();

            $pendingRequestsCount = LeaveRequest::where('teacher_id', $teacherId)->where('status', 'pending')->count()
                + SubstituteRequest::where('requesting_teacher_id', $teacherId)->where('status', 'pending')->count();
        }

        // Determine current or next upcoming class
        $currentOrNextClass = null;
        if ($todayClasses->isNotEmpty()) {
            $currentOrNextClass = $todayClasses->firstWhere('is_live', true)
                ?? $todayClasses->first(fn($c) => !in_array($c['display_status'], ['completed', 'cancelled', 'past']))
                ?? $todayClasses->first();
        }

        // Attendance rate calculation
        $attendanceRate = $monthlyTotalCount > 0
            ? round(($monthlyAttendedCount / $monthlyTotalCount) * 100)
            : 100;

        return Inertia::render('instructor-dashboard', [
            'teacher' => $teacherProfile,
            'semester' => $currentSemester ? [
                'id' => $currentSemester->id,
                'name' => $currentSemester->name,
                'academic_year' => $currentSemester->academic_year,
                'is_current' => (bool) $currentSemester->is_current,
            ] : null,
            'stats' => [
                'today_classes' => $todayClassesCount,
                'today_completed' => $todayCompletedCount,
                'total_units' => round($totalUnits, 1),
                'assigned_courses_count' => $assignedCourses->count(),
                'weekly_hours' => round($weeklyHours, 1),
                'monthly_attended' => $monthlyAttendedCount,
                'monthly_total' => $monthlyTotalCount,
                'attendance_rate' => $attendanceRate,
                'pending_requests' => $pendingRequestsCount,
            ],
            'today_classes' => $todayClasses->values(),
            'current_or_next_class' => $currentOrNextClass,
            'weekly_schedule' => $weeklySchedule,
            'assigned_courses' => $assignedCourses->values(),
            'recent_punches' => $recentPunches->values(),
            'recent_requests' => $recentRequests->values(),
            'today_date_display' => $today->format('l, F j, Y'),
        ]);
    }
}
