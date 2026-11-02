<?php

namespace App\Services\Zkteco;

use App\Enums\AttendanceStatus;
use App\Enums\TeacherScheduleStatus;
use App\Enums\ZktecoMatchStatus;
use App\Models\AttendanceRecord;
use App\Models\Classroom;
use App\Models\DraftSchedule;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Models\TimeSlot;
use App\Models\ZktecoAttendanceLog;
use App\Models\ZktecoDevice;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ZktecoAttendanceService
{
    /**
     * Minutes before class start_time a teacher can clock in early.
     */
    public const EARLY_ARRIVAL_MINUTES = 30;

    /**
     * Minutes after class start_time considered on-time (Grace Period).
     */
    public const GRACE_PERIOD_MINUTES = 15;

    /**
     * Minutes after class end_time a teacher can clock out.
     */
    public const CHECKOUT_BUFFER_MINUTES = 30;

    /**
     * Process a single biometric punch from a ZKTeco device.
     */
    public function processPunch(
        ZktecoDevice $device,
        string $biometricPin,
        CarbonInterface|string $punchTime,
        string $verifyType = 'fingerprint',
        string $punchType = 'auto',
        ?array $rawPayload = null
    ): ZktecoAttendanceLog {
        $punchCarbon = $punchTime instanceof CarbonInterface ? Carbon::instance($punchTime) : Carbon::parse($punchTime);
        $device->loadMissing('classroom');
        $deviceClassroom = $device->classroom;

        return DB::transaction(function () use (
            $device,
            $deviceClassroom,
            $biometricPin,
            $punchCarbon,
            $verifyType,
            $punchType,
            $rawPayload
        ) {
            // 1. Resolve Teacher by biometric_pin or employee_id
            $teacher = $this->resolveTeacher($biometricPin);

            if (! $teacher) {
                return ZktecoAttendanceLog::create([
                    'zkteco_device_id' => $device->id,
                    'classroom_id' => $device->classroom_id,
                    'biometric_pin' => $biometricPin,
                    'teacher_id' => null,
                    'punch_time' => $punchCarbon,
                    'punch_type' => $punchType,
                    'verify_type' => $verifyType,
                    'match_status' => ZktecoMatchStatus::TEACHER_NOT_FOUND,
                    'teacher_schedule_id' => null,
                    'attendance_record_id' => null,
                    'rejection_reason' => "Unrecognized Biometric PIN '{$biometricPin}'. No active teacher profile matches this ID.",
                    'raw_payload' => $rawPayload,
                ]);
            }

            // 2. Check for duplicate punch within 2 minutes on the same device
            $recentDuplicate = ZktecoAttendanceLog::query()
                ->where('zkteco_device_id', $device->id)
                ->where('teacher_id', $teacher->id)
                ->where('match_status', ZktecoMatchStatus::MATCHED->value)
                ->whereBetween('punch_time', [
                    $punchCarbon->copy()->subMinutes(2),
                    $punchCarbon->copy()->addMinutes(2),
                ])
                ->first();

            if ($recentDuplicate && $punchType !== 'check_out') {
                return ZktecoAttendanceLog::create([
                    'zkteco_device_id' => $device->id,
                    'classroom_id' => $device->classroom_id,
                    'biometric_pin' => $biometricPin,
                    'teacher_id' => $teacher->id,
                    'punch_time' => $punchCarbon,
                    'punch_type' => $punchType,
                    'verify_type' => $verifyType,
                    'match_status' => ZktecoMatchStatus::DUPLICATE_IGNORED,
                    'teacher_schedule_id' => $recentDuplicate->teacher_schedule_id,
                    'attendance_record_id' => $recentDuplicate->attendance_record_id,
                    'rejection_reason' => 'Duplicate punch within 2 minutes of an already matched check-in.',
                    'raw_payload' => $rawPayload,
                ]);
            }

            // 3. Ensure any assigned schedules for this teacher on this date are materialized
            $this->ensureTeacherSchedulesForDate($teacher, $punchCarbon);

            // 4. Fetch all active scheduled sessions for this teacher on the punch date
            $daySessions = TeacherSchedule::query()
                ->with(['subject', 'classroom', 'teacherAssignment.schedule.classroom'])
                ->where('teacher_id', $teacher->id)
                ->whereDate('scheduled_date', $punchCarbon->toDateString())
                ->where('is_holiday', false)
                ->where('status', '!=', TeacherScheduleStatus::CANCELLED->value)
                ->get();

            // Filter sessions whose time window covers the punch time
            $windowSessions = $daySessions->filter(function (TeacherSchedule $session) use ($punchCarbon) {
                $sessionStart = Carbon::parse($punchCarbon->toDateString().' '.$session->start_time->format('H:i:s'));
                $sessionEnd = Carbon::parse($punchCarbon->toDateString().' '.$session->end_time->format('H:i:s'));

                $earliestCheckIn = $sessionStart->copy()->subMinutes(self::EARLY_ARRIVAL_MINUTES);
                $latestCheckOut = $sessionEnd->copy()->addMinutes(self::CHECKOUT_BUFFER_MINUTES);

                return $punchCarbon->betweenIncluded($earliestCheckIn, $latestCheckOut);
            });

            if ($windowSessions->isEmpty()) {
                return ZktecoAttendanceLog::create([
                    'zkteco_device_id' => $device->id,
                    'classroom_id' => $device->classroom_id,
                    'biometric_pin' => $biometricPin,
                    'teacher_id' => $teacher->id,
                    'punch_time' => $punchCarbon,
                    'punch_type' => $punchType,
                    'verify_type' => $verifyType,
                    'match_status' => ZktecoMatchStatus::NO_SCHEDULED_CLASS,
                    'teacher_schedule_id' => null,
                    'attendance_record_id' => null,
                    'rejection_reason' => "No scheduled class for {$teacher->full_name} around {$punchCarbon->format('g:i A')} on {$punchCarbon->format('M d, Y')}.",
                    'raw_payload' => $rawPayload,
                ]);
            }

            // 5. Verify Classroom Match: Does any session in this time window belong to this device's classroom?
            /** @var ?TeacherSchedule $matchedRoomSession */
            $matchedRoomSession = $windowSessions->first(
                fn (TeacherSchedule $session) => $this->doesSessionMatchClassroom($session, $deviceClassroom)
            );

            if (! $matchedRoomSession) {
                // Teacher has a scheduled class right now, but in a DIFFERENT classroom!
                /** @var TeacherSchedule $wrongRoomSession */
                $wrongRoomSession = $windowSessions->first();
                $subjectLabel = $wrongRoomSession->subject
                    ? "{$wrongRoomSession->subject->code} ({$wrongRoomSession->subject->title})"
                    : 'Scheduled Subject';
                $scheduledRoomLabel = $this->getSessionRoomLabel($wrongRoomSession);
                $deviceRoomLabel = $deviceClassroom
                    ? "{$deviceClassroom->building} {$deviceClassroom->room_number}"
                    : 'Unassigned Room';

                return ZktecoAttendanceLog::create([
                    'zkteco_device_id' => $device->id,
                    'classroom_id' => $device->classroom_id,
                    'biometric_pin' => $biometricPin,
                    'teacher_id' => $teacher->id,
                    'punch_time' => $punchCarbon,
                    'punch_type' => $punchType,
                    'verify_type' => $verifyType,
                    'match_status' => ZktecoMatchStatus::MISMATCHED_ROOM,
                    'teacher_schedule_id' => $wrongRoomSession->id,
                    'attendance_record_id' => null,
                    'rejection_reason' => "Wrong Classroom: {$teacher->full_name} is scheduled for {$subjectLabel} in {$scheduledRoomLabel}, but clocked in at {$deviceRoomLabel} ({$device->device_name}). Attendance not granted.",
                    'raw_payload' => $rawPayload,
                ]);
            }

            // 6. Classroom & Subject Match Confirmed! Record Present Attendance.
            $sessionStart = Carbon::parse($punchCarbon->toDateString().' '.$matchedRoomSession->start_time->format('H:i:s'));
            $graceDeadline = $sessionStart->copy()->addMinutes(self::GRACE_PERIOD_MINUTES);
            $isLate = $punchCarbon->gt($graceDeadline);
            $minutesLate = $isLate ? (int) $sessionStart->diffInMinutes($punchCarbon) : 0;

            $attendanceRecord = AttendanceRecord::query()
                ->where('teacher_assignment_id', $matchedRoomSession->teacher_assignment_id)
                ->whereDate('date', $punchCarbon->toDateString())
                ->first();

            $deviceRoomLabel = $deviceClassroom
                ? "{$deviceClassroom->building} {$deviceClassroom->room_number}"
                : $device->device_name;
            $subjectCode = $matchedRoomSession->subject?->code ?? 'Subject';

            $effectivePunchType = $punchType;

            if ($attendanceRecord && $attendanceRecord->timestamp_in && ($punchType === 'check_out' || $punchCarbon->diffInMinutes($attendanceRecord->timestamp_in) >= 15)) {
                $effectivePunchType = 'check_out';
                $attendanceRecord->update([
                    'timestamp_out' => $punchCarbon,
                    'status' => AttendanceStatus::PRESENT,
                    'notes' => trim(($attendanceRecord->notes ? $attendanceRecord->notes.' | ' : '')."Clocked out at {$punchCarbon->format('g:i A')} via {$device->device_name} ({$deviceRoomLabel})."),
                ]);
            } elseif (! $attendanceRecord) {
                $effectivePunchType = 'check_in';
                $arrivalNote = $isLate
                    ? "Clocked in via ZKTeco {$device->device_name} ({$deviceRoomLabel}) for {$subjectCode} — Late by {$minutesLate} min(s)."
                    : "Clocked in on time via ZKTeco {$device->device_name} ({$deviceRoomLabel}) for {$subjectCode}.";

                $attendanceRecord = AttendanceRecord::create([
                    'teacher_assignment_id' => $matchedRoomSession->teacher_assignment_id,
                    'date' => $punchCarbon->toDateString(),
                    'status' => AttendanceStatus::PRESENT,
                    'timestamp_in' => $punchCarbon,
                    'timestamp_out' => null,
                    'notes' => $arrivalNote,
                    'recorded_by' => $teacher->user_id,
                ]);
            } else {
                $effectivePunchType = 'check_in';
                $arrivalNote = $isLate
                    ? "Clocked in via ZKTeco {$device->device_name} ({$deviceRoomLabel}) for {$subjectCode} — Late by {$minutesLate} min(s)."
                    : "Clocked in on time via ZKTeco {$device->device_name} ({$deviceRoomLabel}) for {$subjectCode}.";

                $attendanceRecord->update([
                    'status' => AttendanceStatus::PRESENT,
                    'timestamp_in' => $attendanceRecord->timestamp_in ?? $punchCarbon,
                    'notes' => $arrivalNote,
                ]);
            }

            if ($matchedRoomSession->attendance_record_id !== $attendanceRecord->id) {
                $matchedRoomSession->update([
                    'attendance_record_id' => $attendanceRecord->id,
                    'status' => $effectivePunchType === 'check_out'
                        ? TeacherScheduleStatus::COMPLETED
                        : $matchedRoomSession->status,
                ]);
            }

            return ZktecoAttendanceLog::create([
                'zkteco_device_id' => $device->id,
                'classroom_id' => $device->classroom_id,
                'biometric_pin' => $biometricPin,
                'teacher_id' => $teacher->id,
                'punch_time' => $punchCarbon,
                'punch_type' => $effectivePunchType,
                'verify_type' => $verifyType,
                'match_status' => ZktecoMatchStatus::MATCHED,
                'teacher_schedule_id' => $matchedRoomSession->id,
                'attendance_record_id' => $attendanceRecord->id,
                'rejection_reason' => $isLate
                    ? "Present (Late by {$minutesLate}m) — Verified in {$deviceRoomLabel} for {$subjectCode}."
                    : "Present (On Time) — Verified in {$deviceRoomLabel} for {$subjectCode}.",
                'raw_payload' => $rawPayload,
            ]);
        });
    }

    /**
     * Resolve a Teacher record by biometric_pin or employee_id.
     */
    public function resolveTeacher(string $biometricPin): ?Teacher
    {
        $pin = trim($biometricPin);
        if ($pin === '') {
            return null;
        }

        // 1. Direct match on biometric_pin or employee_id
        $teacher = Teacher::query()
            ->where('is_active', true)
            ->where(function ($q) use ($pin) {
                $q->where('biometric_pin', $pin)
                    ->orWhere('employee_id', $pin);
            })
            ->first();

        if ($teacher) {
            return $teacher;
        }

        // 2. Numeric fallback (e.g. PIN "1" or "0001" matching employee_id "T-0001")
        if (ctype_digit($pin)) {
            $numericVal = (int) $pin;
            $padded4 = str_pad((string) $numericVal, 4, '0', STR_PAD_LEFT);

            return Teacher::query()
                ->where('is_active', true)
                ->where(function ($q) use ($numericVal, $padded4) {
                    $q->where('employee_id', "T-{$padded4}")
                        ->orWhere('employee_id', "EMP-{$padded4}")
                        ->orWhere('id', $numericVal);
                })
                ->first();
        }

        return null;
    }

    /**
     * Verify whether a scheduled class session is assigned to the same classroom as the ZKTeco device.
     */
    public function doesSessionMatchClassroom(TeacherSchedule $session, ?Classroom $deviceClassroom): bool
    {
        if (! $deviceClassroom) {
            return false;
        }

        // 1. Explicit foreign key match on TeacherSchedule
        if ($session->classroom_id !== null) {
            return (int) $session->classroom_id === (int) $deviceClassroom->id;
        }

        // 2. Explicit foreign key match on parent Schedule
        $parentClassroomId = $session->teacherAssignment?->schedule?->classroom_id;
        if ($parentClassroomId !== null) {
            return (int) $parentClassroomId === (int) $deviceClassroom->id;
        }

        // 3. Normalized string comparison against classroom building + room_number or room_name
        $sessionRoom = $this->normalizeRoomString($session->room ?? $session->teacherAssignment?->schedule?->room ?? '');
        if ($sessionRoom === '') {
            return false;
        }

        $candidates = array_filter([
            $this->normalizeRoomString("{$deviceClassroom->building} {$deviceClassroom->room_number}"),
            $this->normalizeRoomString("{$deviceClassroom->building}-{$deviceClassroom->room_number}"),
            $this->normalizeRoomString($deviceClassroom->room_number),
            $deviceClassroom->room_name ? $this->normalizeRoomString($deviceClassroom->room_name) : null,
            $deviceClassroom->room_name ? $this->normalizeRoomString("{$deviceClassroom->building} {$deviceClassroom->room_name}") : null,
        ]);

        return in_array($sessionRoom, $candidates, true);
    }

    /**
     * Ensure that if a teacher has active TeacherAssignments or approved DraftSchedules
     * covering the given date's day-of-week, corresponding TeacherSchedule session rows exist.
     */
    public function ensureTeacherSchedulesForDate(Teacher $teacher, CarbonInterface $date): void
    {
        $this->ensureTeacherSchedulesForPeriod($teacher, $date, $date);
    }

    /**
     * Ensure that all active TeacherAssignments and approved DraftSchedules for a teacher
     * have corresponding TeacherSchedule session rows across the given date range, and remove
     * any orphaned sessions from deleted/unapproved drafts.
     */
    public function ensureTeacherSchedulesForPeriod(
        Teacher $teacher,
        CarbonInterface $startDate,
        CarbonInterface $endDate
    ): void {
        // Remove any orphaned TeacherSchedule rows whose DraftSchedule was deleted or is no longer approved
        $approvedDraftIds = DraftSchedule::query()
            ->where('teacher_id', $teacher->id)
            ->where('status', 'approved')
            ->pluck('id');

        $activeAssignmentIds = TeacherAssignment::query()
            ->where('teacher_id', $teacher->id)
            ->where('is_active', true)
            ->pluck('id');

        TeacherSchedule::query()
            ->where('teacher_id', $teacher->id)
            ->where(function ($q) use ($approvedDraftIds, $activeAssignmentIds) {
                $q->whereNotIn('draft_schedule_id', $approvedDraftIds)
                    ->whereNotIn('teacher_assignment_id', $activeAssignmentIds);
            })
            ->delete();

        // Check active TeacherAssignments
        $assignments = TeacherAssignment::query()
            ->with('schedule')
            ->where('teacher_id', $teacher->id)
            ->where('is_active', true)
            ->get();

        // Also check approved DraftSchedules that may not have created a TeacherAssignment yet
        $approvedDrafts = DraftSchedule::query()
            ->with('schedule')
            ->where('teacher_id', $teacher->id)
            ->where('status', 'approved')
            ->get();

        foreach ($approvedDrafts as $draft) {
            if (! $draft->schedule) {
                continue;
            }

            $assignment = $assignments->firstWhere('schedule_id', $draft->schedule_id);
            if (! $assignment) {
                $assignment = TeacherAssignment::firstOrCreate(
                    [
                        'teacher_id' => $teacher->id,
                        'schedule_id' => $draft->schedule_id,
                    ],
                    [
                        'assigned_at' => now(),
                        'assigned_by' => $draft->reviewed_by ?? $teacher->user_id,
                        'is_active' => true,
                    ]
                );
                if (! $draft->teacher_assignment_id) {
                    $draft->update(['teacher_assignment_id' => $assignment->id]);
                }
                $assignments->push($assignment);
            } elseif (! $draft->teacher_assignment_id) {
                $draft->update(['teacher_assignment_id' => $assignment->id]);
            }
        }

        if ($assignments->isEmpty()) {
            return;
        }

        $timeSlotsById = TimeSlot::all()->keyBy('id');
        $period = CarbonPeriod::create(
            Carbon::instance($startDate)->startOfDay(),
            Carbon::instance($endDate)->startOfDay()
        );

        foreach ($assignments as $assignment) {
            $schedule = $assignment->schedule;
            if (! $schedule || ! $schedule->is_active || empty($schedule->time_slots)) {
                continue;
            }

            $draft = DraftSchedule::firstOrCreate(
                [
                    'teacher_id' => $teacher->id,
                    'schedule_id' => $schedule->id,
                ],
                [
                    'teacher_assignment_id' => $assignment->id,
                    'status' => 'approved',
                    'reviewed_at' => now(),
                ]
            );

            foreach ($schedule->time_slots as $slot) {
                $slotDay = strtolower($slot['day'] ?? '');
                if ($slotDay === '') {
                    continue;
                }

                $startTime = $slot['start_time'] ?? $slot['start'] ?? null;
                $endTime = $slot['end_time'] ?? $slot['end'] ?? null;

                if (isset($slot['time_slot_id'])) {
                    $timeSlotModel = $timeSlotsById->get((int) $slot['time_slot_id']);
                    if ($timeSlotModel) {
                        $startTime = $timeSlotModel->start_time->format('H:i:s');
                        $endTime = $timeSlotModel->end_time->format('H:i:s');
                    }
                }

                if (! $startTime || ! $endTime) {
                    continue;
                }

                if (strlen($startTime) === 5) {
                    $startTime .= ':00';
                }
                if (strlen($endTime) === 5) {
                    $endTime .= ':00';
                }

                foreach ($period as $date) {
                    $dayName = strtolower($date->format('l'));
                    if ($slotDay !== $dayName) {
                        continue;
                    }

                    $exists = TeacherSchedule::query()
                        ->where('teacher_id', $teacher->id)
                        ->where('subject_id', $schedule->subject_id)
                        ->whereDate('scheduled_date', $date->toDateString())
                        ->whereTime('start_time', $startTime)
                        ->exists();

                    if (! $exists) {
                        TeacherSchedule::create([
                            'teacher_assignment_id' => $assignment->id,
                            'draft_schedule_id' => $draft->id,
                            'subject_id' => $schedule->subject_id,
                            'semester_id' => $schedule->semester_id,
                            'teacher_id' => $teacher->id,
                            'scheduled_date' => $date->toDateString(),
                            'day_of_week' => $dayName,
                            'start_time' => $startTime,
                            'end_time' => $endTime,
                            'room' => $schedule->room,
                            'classroom_id' => $schedule->classroom_id,
                            'section' => $schedule->section,
                            'status' => TeacherScheduleStatus::SCHEDULED,
                            'is_holiday' => false,
                        ]);
                    }
                }
            }
        }
    }

    private function getSessionRoomLabel(TeacherSchedule $session): string
    {
        if ($session->classroom) {
            return "{$session->classroom->building} {$session->classroom->room_number}";
        }

        $parentClassroom = $session->teacherAssignment?->schedule?->classroom;
        if ($parentClassroom) {
            return "{$parentClassroom->building} {$parentClassroom->room_number}";
        }

        return $session->room ?: 'Unassigned Room';
    }

    private function normalizeRoomString(string $value): string
    {
        return preg_replace('/\s+/', ' ', strtolower(trim($value))) ?? '';
    }
}
