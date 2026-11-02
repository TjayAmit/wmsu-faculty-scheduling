<?php

namespace App\Http\Controllers;

use App\Enums\TeacherScheduleStatus;
use App\Models\LeaveRequest;
use App\Models\Teacher;
use App\Models\TeacherSchedule;
use App\Models\ZktecoAttendanceLog;
use App\Services\Zkteco\ZktecoAttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceMonitorController extends Controller
{
    /**
     * Display simplified teacher-centric attendance & absence monitor with expandable schedule breakdowns.
     */
    public function index(Request $request, ZktecoAttendanceService $attendanceService): Response
    {
        $now = Carbon::now();
        $todayStr = $now->toDateString();

        // 1. Determine Date Range
        $period = $request->input('period', 'month'); // 'month' | 'semester' | 'today' | 'custom'

        if ($period === 'today') {
            $startDate = $now->copy()->startOfDay();
            $endDate = $now->copy()->endOfDay();
        } elseif ($period === 'semester') {
            // Typical semester: 4 months
            $startDate = $now->copy()->subMonths(3)->startOfMonth();
            $endDate = $now->copy()->addMonths(1)->endOfMonth();
        } elseif ($period === 'custom' && $request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        } else {
            // Default: Current Month
            $period = 'month';
            $startDate = $now->copy()->startOfMonth();
            $endDate = $now->copy()->endOfMonth();
        }

        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        // 2. Ensure schedules are generated for all active teachers across the queried months
        $activeTeachers = Teacher::whereHas('assignments', fn ($q) => $q->where('is_active', true))->get();
        $cursorMonth = $startDate->copy()->startOfMonth();
        while ($cursorMonth->lessThanOrEqualTo($endDate)) {
            $mStart = $cursorMonth->copy()->startOfMonth();
            $mEnd = $cursorMonth->copy()->endOfMonth();
            foreach ($activeTeachers as $teacherModel) {
                $attendanceService->ensureTeacherSchedulesForPeriod($teacherModel, $mStart, $mEnd);
            }
            $cursorMonth->addMonth();
        }

        // 3. Query all approved leave requests covering this period
        $approvedLeaves = LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '<=', $endDateStr)
            ->whereDate('end_date', '>=', $startDateStr)
            ->get();

        // 4. Query all raw punch logs for this period to enrich verification source
        $punches = ZktecoAttendanceLog::with(['device', 'qrKiosk', 'classroom'])
            ->whereBetween('punch_time', [$startDate->copy()->subHours(2), $endDate->copy()->addHours(2)])
            ->get();

        // 5. Query teachers matching search and department filter
        $teacherQuery = Teacher::query()->with([
            'user',
        ]);

        if ($request->filled('department') && $request->input('department') !== 'all') {
            $teacherQuery->where('department', $request->input('department'));
        }

        if ($request->filled('search')) {
            $search = strtolower(trim($request->input('search')));
            $teacherQuery->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        $teachers = $teacherQuery->orderBy('last_name')->get();

        // 6. Build Teacher Summaries & Detailed Breakdowns
        $teacherRows = $teachers->map(function ($teacher) use ($startDateStr, $endDateStr, $todayStr, $now, $approvedLeaves, $punches) {
            $tId = $teacher->id;

            // Fetch all schedules for this teacher in the period
            $schedules = TeacherSchedule::with(['subject', 'classroom', 'attendanceRecord'])
                ->where('teacher_id', $tId)
                ->whereBetween('scheduled_date', [$startDateStr, $endDateStr])
                ->where('is_holiday', false)
                ->orderBy('scheduled_date', 'desc')
                ->orderBy('start_time', 'desc')
                ->get();

            // Teacher's approved leaves
            $teacherLeaves = $approvedLeaves->where('teacher_id', $tId);

            $breakdown = [];
            $presentDates = [];
            $absentDates = [];
            $leaveDates = [];

            $totalPastClasses = 0;
            $presentClassesCount = 0;
            $absentClassesCount = 0;
            $leaveClassesCount = 0;
            $upcomingClassesCount = 0;
            $inSessionClassesCount = 0;

            foreach ($schedules as $s) {
                $schedDate = $s->scheduled_date->toDateString();
                $start = Carbon::parse($s->start_time);
                $end = Carbon::parse($s->end_time);

                $isDateToday = ($schedDate === $todayStr);
                $isDatePast = ($schedDate < $todayStr);
                $isDateFuture = ($schedDate > $todayStr);

                // Is class period over?
                $isSessionEnded = $isDatePast || ($isDateToday && $now->greaterThan($end));
                $isSessionLive = $isDateToday && $now->between($start, $end);

                // 1. Check if covered by an approved leave request
                $matchedLeave = $teacherLeaves->first(function ($leave) use ($schedDate) {
                    $lStart = Carbon::parse($leave->start_date)->toDateString();
                    $lEnd = Carbon::parse($leave->end_date)->toDateString();
                    return $schedDate >= $lStart && $schedDate <= $lEnd;
                });

                // 2. Check if attended (clocked in / completed)
                $hasAttendance = !empty($s->attendance_record_id)
                    || $s->status === TeacherScheduleStatus::COMPLETED
                    || $s->status === 'completed'
                    || ($s->attendanceRecord && in_array($s->attendanceRecord->status, ['present', 'late']));

                // Find punch log for verification audit
                $matchedPunch = $punches->first(function ($p) use ($tId, $s, $start, $end) {
                    if ($p->teacher_id !== $tId) {
                        return false;
                    }
                    if ($p->teacher_schedule_id === $s->id || ($p->attendance_record_id && $p->attendance_record_id === $s->attendance_record_id)) {
                        return true;
                    }
                    $pTime = Carbon::parse($p->punch_time);
                    return $pTime->between($start->copy()->subMinutes(30), $end);
                });

                $clockInTime = null;
                if ($s->attendanceRecord?->timestamp_in) {
                    $clockInTime = Carbon::parse($s->attendanceRecord->timestamp_in);
                } elseif ($matchedPunch) {
                    $clockInTime = Carbon::parse($matchedPunch->punch_time);
                }

                // Tardiness
                $isLate = false;
                $lateMinutes = 0;
                if ($clockInTime && $clockInTime->greaterThan($start->copy()->addMinutes(15))) {
                    $isLate = true;
                    $lateMinutes = (int) $clockInTime->diffInMinutes($start);
                }

                // Determine attendance status
                $status = 'scheduled';
                if ($s->status === TeacherScheduleStatus::CANCELLED || $s->status === 'cancelled') {
                    $status = 'cancelled';
                } elseif ($matchedLeave) {
                    $status = 'on_leave';
                    $leaveDates[$schedDate] = true;
                    $leaveClassesCount++;
                } elseif ($hasAttendance) {
                    $status = 'present';
                    $presentDates[$schedDate] = true;
                    $presentClassesCount++;
                    if ($isSessionEnded) {
                        $totalPastClasses++;
                    }
                } elseif ($isSessionEnded) {
                    $status = 'absent';
                    $absentDates[$schedDate] = true;
                    $absentClassesCount++;
                    $totalPastClasses++;
                } elseif ($isSessionLive) {
                    $status = 'in_session';
                    $inSessionClassesCount++;
                } else {
                    $status = 'scheduled';
                    $upcomingClassesCount++;
                }

                // Verification source description
                $auditSource = 'No punch recorded';
                if ($matchedLeave) {
                    $auditSource = "Approved Leave: " . ucfirst($matchedLeave->leave_type ?? 'official') . " Leave";
                } elseif ($matchedPunch) {
                    if ($matchedPunch->verify_type === 'qr_kiosk' || $matchedPunch->qrKiosk) {
                        $kName = $matchedPunch->qrKiosk?->kiosk_name ?? 'Classroom Kiosk';
                        $auditSource = "QR Kiosk ({$kName})";
                    } else {
                        $dName = $matchedPunch->device?->device_name ?? 'ZKTeco Terminal';
                        $auditSource = "Biometric ({$dName})";
                    }
                } elseif ($hasAttendance) {
                    $auditSource = 'System Verified Attendance';
                }

                $breakdown[] = [
                    'id' => $s->id,
                    'subject_code' => $s->subject?->code ?? 'N/A',
                    'subject_title' => $s->subject?->title ?? 'Untitled Subject',
                    'section' => $s->section ?? '—',
                    'room' => $s->room ?? ($s->classroom ? "{$s->classroom->building} {$s->classroom->room_number}" : 'TBA'),
                    'scheduled_date' => $schedDate,
                    'formatted_date' => $s->scheduled_date->format('M d, Y (D)'),
                    'start_time' => $start->format('g:i A'),
                    'end_time' => $end->format('g:i A'),
                    'duration' => $start->diff($end)->format('%h hr %i min'),
                    'status' => $status, // 'present' | 'absent' | 'on_leave' | 'in_session' | 'scheduled' | 'cancelled'
                    'is_late' => $isLate,
                    'late_minutes' => $lateMinutes,
                    'clock_in_time' => $clockInTime ? $clockInTime->format('g:i A') : null,
                    'audit_source' => $auditSource,
                    'leave_type' => $matchedLeave?->leave_type ?? null,
                    'leave_reason' => $matchedLeave?->reason ?? null,
                ];
            }

            // Deduplicate dates: if a date had an attendance, don't count it as absent date even if another class was missed, or vice versa
            $daysPresent = count($presentDates);
            // Absent dates: dates with absence where teacher had zero attendance that day
            $pureAbsentDates = array_diff_key($absentDates, $presentDates, $leaveDates);
            $daysAbsent = count($pureAbsentDates);
            $daysOnLeave = count($leaveDates);

            // Absence percentage vs total past scheduled classes (past to present)
            $totalEvaluated = $presentClassesCount + $absentClassesCount;
            $absencePercentage = $totalEvaluated > 0
                ? round(($absentClassesCount / $totalEvaluated) * 100, 1)
                : 0.0;

            $attendancePercentage = $totalEvaluated > 0
                ? round(($presentClassesCount / $totalEvaluated) * 100, 1)
                : ($totalPastClasses === 0 ? 100.0 : 0.0);

            return [
                'id' => $teacher->id,
                'name' => trim("{$teacher->first_name} {$teacher->last_name}"),
                'employee_id' => $teacher->employee_id ?? '—',
                'department' => $teacher->department ?? 'General Faculty',
                'email' => $teacher->email ?? $teacher->user?->email,
                'rank' => $teacher->rank,
                'employment_type' => $teacher->employment_type,
                'days_present' => $daysPresent,
                'days_absent' => $daysAbsent,
                'days_on_leave' => $daysOnLeave,
                'classes_present' => $presentClassesCount,
                'classes_absent' => $absentClassesCount,
                'classes_on_leave' => $leaveClassesCount,
                'classes_upcoming' => $upcomingClassesCount,
                'classes_in_session' => $inSessionClassesCount,
                'total_past_classes' => $totalPastClasses,
                'absence_percentage' => $absencePercentage,
                'attendance_percentage' => $attendancePercentage,
                'has_absences' => $absentClassesCount > 0,
                'has_leaves' => $leaveClassesCount > 0,
                'breakdown' => $breakdown, // ordered present to past (desc)
            ];
        });

        // 7. Global summary stats across all teachers
        $totalTeachers = $teacherRows->count();
        $teachersWithAbsence = $teacherRows->where('has_absences', true)->count();
        $teachersOnLeave = $teacherRows->where('has_leaves', true)->count();
        $totalDaysPresent = $teacherRows->sum('days_present');
        $totalDaysAbsent = $teacherRows->sum('days_absent');
        $totalDaysOnLeave = $teacherRows->sum('days_on_leave');

        $totalAllPastClasses = $teacherRows->sum('total_past_classes');
        $totalAllAbsentClasses = $teacherRows->sum('classes_absent');
        $overallAbsenceRate = $totalAllPastClasses > 0
            ? round(($totalAllAbsentClasses / $totalAllPastClasses) * 100, 1)
            : 0.0;

        // 8. Quick filter tab
        $statusTab = $request->input('tab', 'all');
        $filteredRows = $teacherRows;
        if ($statusTab === 'absent') {
            $filteredRows = $filteredRows->where('has_absences', true);
        } elseif ($statusTab === 'leave') {
            $filteredRows = $filteredRows->where('has_leaves', true);
        } elseif ($statusTab === 'perfect') {
            $filteredRows = $filteredRows->where('has_absences', false)->where('total_past_classes', '>', 0);
        }

        // Departments for filter dropdown
        $departments = Teacher::whereNotNull('department')
            ->distinct()
            ->pluck('department')
            ->sort()
            ->values();

        return Inertia::render('attendance-monitor/index', [
            'teachers' => $filteredRows->values(),
            'stats' => [
                'total_teachers' => $totalTeachers,
                'teachers_with_absence' => $teachersWithAbsence,
                'teachers_on_leave' => $teachersOnLeave,
                'total_days_present' => $totalDaysPresent,
                'total_days_absent' => $totalDaysAbsent,
                'total_days_on_leave' => $totalDaysOnLeave,
                'overall_absence_rate' => $overallAbsenceRate,
            ],
            'filters' => [
                'period' => $period,
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
                'department' => $request->input('department', 'all'),
                'search' => $request->input('search', ''),
                'tab' => $statusTab,
            ],
            'departments' => $departments,
            'today_date' => $todayStr,
            'date_range_label' => $startDate->format('M j, Y') . ' – ' . $endDate->format('M j, Y'),
        ]);
    }
}
