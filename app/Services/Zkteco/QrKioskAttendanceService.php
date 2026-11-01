<?php

namespace App\Services\Zkteco;

use App\Enums\AttendanceStatus;
use App\Enums\TeacherScheduleStatus;
use App\Enums\ZktecoMatchStatus;
use App\Models\AttendanceRecord;
use App\Models\Classroom;
use App\Models\QrKiosk;
use App\Models\Teacher;
use App\Models\TeacherSchedule;
use App\Models\ZktecoAttendanceLog;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QrKioskAttendanceService
{
    public function __construct(
        protected ZktecoAttendanceService $biometricService
    ) {}

    /**
     * Generate a signed QR code payload for a teacher.
     * Format: WMSU-QR:{employee_id}:{hmac_12}
     */
    public function generateTeacherQrPayload(Teacher $teacher): string
    {
        $sig = $this->computeSignature($teacher);

        return "WMSU-QR:{$teacher->employee_id}:{$sig}";
    }

    /**
     * Compute the 12-character HMAC signature for a teacher's QR code.
     */
    protected function computeSignature(Teacher $teacher): string
    {
        $key = (string) config('app.key', 'wmsu-kiosk-secret');

        return substr(hash_hmac('sha256', "WMSU-QR:{$teacher->id}:{$teacher->employee_id}", $key), 0, 12);
    }

    /**
     * Resolve a Teacher from a scanned QR code string.
     * Supports signed WMSU-QR:{employee_id}:{sig}, WMSU-QR:{employee_id}, or employee_id / biometric_pin.
     */
    public function resolveTeacherFromQr(string $rawCode): array
    {
        $trimmed = trim($rawCode);
        if ($trimmed === '') {
            return ['teacher' => null, 'error' => 'Empty QR code payload scanned.'];
        }

        if (str_starts_with(strtoupper($trimmed), 'WMSU-QR:')) {
            $parts = explode(':', $trimmed);
            $employeeId = $parts[1] ?? '';
            $providedSig = $parts[2] ?? null;

            $teacher = Teacher::query()
                ->where('is_active', true)
                ->where('employee_id', $employeeId)
                ->first();

            if (! $teacher) {
                return [
                    'teacher' => null,
                    'error' => "No active faculty profile found for QR ID '{$employeeId}'.",
                ];
            }

            if ($providedSig !== null && $providedSig !== '') {
                $expectedSig = $this->computeSignature($teacher);
                if (! hash_equals(strtolower($expectedSig), strtolower($providedSig))) {
                    return [
                        'teacher' => null,
                        'error' => 'Invalid or forged QR signature. Please use your official WMSU Faculty QR Pass.',
                    ];
                }
            }

            return ['teacher' => $teacher, 'error' => null];
        }

        // Fallback to employee_id or biometric_pin resolution
        $teacher = $this->biometricService->resolveTeacher($trimmed);
        if (! $teacher) {
            return [
                'teacher' => null,
                'error' => "Unrecognized QR Code '{$trimmed}'. No active instructor matches this code.",
            ];
        }

        return ['teacher' => $teacher, 'error' => null];
    }

    /**
     * Process a single QR scan from a classroom-registered browser kiosk.
     * Clock-in once only is immediately considered PRESENT (no time-out needed).
     */
    public function processQrScan(
        QrKiosk $kiosk,
        string $qrPayload,
        CarbonInterface|string|null $scanTime = null
    ): array {
        $scanCarbon = $scanTime instanceof CarbonInterface
            ? Carbon::instance($scanTime)
            : ($scanTime ? Carbon::parse($scanTime) : Carbon::now());

        $kiosk->loadMissing('classroom');
        $kioskClassroom = $kiosk->classroom;
        $classroomLabel = $kioskClassroom
            ? "{$kioskClassroom->building} - Room {$kioskClassroom->room_number}"
            : $kiosk->kiosk_name;

        return DB::transaction(function () use ($kiosk, $kioskClassroom, $classroomLabel, $qrPayload, $scanCarbon) {
            // Update kiosk heartbeat / last used timestamp
            $kiosk->update(['last_used_at' => $scanCarbon]);

            // 1. Resolve teacher from QR payload
            $resolved = $this->resolveTeacherFromQr($qrPayload);
            /** @var ?Teacher $teacher */
            $teacher = $resolved['teacher'];

            if (! $teacher) {
                $log = ZktecoAttendanceLog::create([
                    'zkteco_device_id' => null,
                    'qr_kiosk_id' => $kiosk->id,
                    'classroom_id' => $kiosk->classroom_id,
                    'biometric_pin' => substr(trim($qrPayload), 0, 50),
                    'teacher_id' => null,
                    'punch_time' => $scanCarbon,
                    'punch_type' => 'check_in',
                    'verify_type' => 'qr_kiosk',
                    'match_status' => ZktecoMatchStatus::TEACHER_NOT_FOUND,
                    'teacher_schedule_id' => null,
                    'attendance_record_id' => null,
                    'rejection_reason' => $resolved['error'] ?? 'Unrecognized QR code.',
                    'raw_payload' => ['qr_payload' => $qrPayload, 'kiosk_id' => $kiosk->id],
                ]);

                return [
                    'success' => false,
                    'already_present' => false,
                    'status' => 'teacher_not_found',
                    'title' => 'Unrecognized QR Pass',
                    'message' => $log->rejection_reason,
                    'teacher' => null,
                    'session' => null,
                    'log_id' => $log->id,
                ];
            }

            // 2. Materialize today's scheduled sessions for this teacher
            $this->biometricService->ensureTeacherSchedulesForDate($teacher, $scanCarbon);

            // 3. Find all active scheduled sessions for this teacher on today's date
            $daySessions = TeacherSchedule::query()
                ->with(['subject', 'classroom', 'teacherAssignment.schedule.classroom', 'attendanceRecord'])
                ->where('teacher_id', $teacher->id)
                ->whereDate('scheduled_date', $scanCarbon->toDateString())
                ->where('is_holiday', false)
                ->where('status', '!=', TeacherScheduleStatus::CANCELLED->value)
                ->get();

            // Filter sessions whose time window covers the scan time
            $windowSessions = $daySessions->filter(function (TeacherSchedule $session) use ($scanCarbon) {
                $sessionStart = Carbon::parse($scanCarbon->toDateString().' '.$session->start_time->format('H:i:s'));
                $sessionEnd = Carbon::parse($scanCarbon->toDateString().' '.$session->end_time->format('H:i:s'));

                $earliestCheckIn = $sessionStart->copy()->subMinutes(ZktecoAttendanceService::EARLY_ARRIVAL_MINUTES);
                $latestWindow = $sessionEnd->copy()->addMinutes(ZktecoAttendanceService::CHECKOUT_BUFFER_MINUTES);

                return $scanCarbon->betweenIncluded($earliestCheckIn, $latestWindow);
            });

            if ($windowSessions->isEmpty()) {
                $log = ZktecoAttendanceLog::create([
                    'zkteco_device_id' => null,
                    'qr_kiosk_id' => $kiosk->id,
                    'classroom_id' => $kiosk->classroom_id,
                    'biometric_pin' => $teacher->employee_id,
                    'teacher_id' => $teacher->id,
                    'punch_time' => $scanCarbon,
                    'punch_type' => 'check_in',
                    'verify_type' => 'qr_kiosk',
                    'match_status' => ZktecoMatchStatus::NO_SCHEDULED_CLASS,
                    'teacher_schedule_id' => null,
                    'attendance_record_id' => null,
                    'rejection_reason' => "No scheduled class for {$teacher->full_name} around {$scanCarbon->format('g:i A')} today ({$scanCarbon->format('M d, Y')}).",
                    'raw_payload' => ['qr_payload' => $qrPayload, 'kiosk_id' => $kiosk->id],
                ]);

                return [
                    'success' => false,
                    'already_present' => false,
                    'status' => 'no_scheduled_class',
                    'title' => 'No Scheduled Class Now',
                    'message' => $log->rejection_reason,
                    'teacher' => [
                        'id' => $teacher->id,
                        'full_name' => $teacher->full_name,
                        'employee_id' => $teacher->employee_id,
                        'department' => $teacher->department,
                    ],
                    'session' => null,
                    'log_id' => $log->id,
                ];
            }

            // 4. Verify Classroom Match against this Kiosk's registered Classroom
            /** @var ?TeacherSchedule $matchedRoomSession */
            $matchedRoomSession = $windowSessions->first(
                fn (TeacherSchedule $session) => $this->biometricService->doesSessionMatchClassroom($session, $kioskClassroom)
            );

            if (! $matchedRoomSession) {
                /** @var TeacherSchedule $wrongRoomSession */
                $wrongRoomSession = $windowSessions->first();
                $subjectLabel = $wrongRoomSession->subject
                    ? "{$wrongRoomSession->subject->code} ({$wrongRoomSession->subject->title})"
                    : 'Scheduled Subject';
                $scheduledRoomLabel = $wrongRoomSession->classroom
                    ? "{$wrongRoomSession->classroom->building} - Room {$wrongRoomSession->classroom->room_number}"
                    : ($wrongRoomSession->room ?: 'Assigned Room');

                $log = ZktecoAttendanceLog::create([
                    'zkteco_device_id' => null,
                    'qr_kiosk_id' => $kiosk->id,
                    'classroom_id' => $kiosk->classroom_id,
                    'biometric_pin' => $teacher->employee_id,
                    'teacher_id' => $teacher->id,
                    'punch_time' => $scanCarbon,
                    'punch_type' => 'check_in',
                    'verify_type' => 'qr_kiosk',
                    'match_status' => ZktecoMatchStatus::MISMATCHED_ROOM,
                    'teacher_schedule_id' => $wrongRoomSession->id,
                    'attendance_record_id' => null,
                    'rejection_reason' => "Wrong Classroom: {$teacher->full_name} is scheduled for {$subjectLabel} in {$scheduledRoomLabel}, but scanned at {$classroomLabel}.",
                    'raw_payload' => ['qr_payload' => $qrPayload, 'kiosk_id' => $kiosk->id],
                ]);

                return [
                    'success' => false,
                    'already_present' => false,
                    'status' => 'mismatched_room',
                    'title' => 'Wrong Classroom Terminal',
                    'message' => $log->rejection_reason,
                    'teacher' => [
                        'id' => $teacher->id,
                        'full_name' => $teacher->full_name,
                        'employee_id' => $teacher->employee_id,
                        'department' => $teacher->department,
                    ],
                    'session' => null,
                    'log_id' => $log->id,
                ];
            }

            // 5. Check if already clocked in for this class session today
            // Rule: Clock in ONCE only to be considered PRESENT — no time-out needed!
            $existingAttendance = AttendanceRecord::query()
                ->where('teacher_assignment_id', $matchedRoomSession->teacher_assignment_id)
                ->whereDate('date', $scanCarbon->toDateString())
                ->first();

            $subjectCode = $matchedRoomSession->subject?->code ?? 'Subject';
            $subjectTitle = $matchedRoomSession->subject?->title ?? '';

            if ($existingAttendance && $existingAttendance->status === AttendanceStatus::PRESENT && $existingAttendance->timestamp_in !== null) {
                // Ensure TeacherSchedule is marked COMPLETED & linked
                if ($matchedRoomSession->status !== TeacherScheduleStatus::COMPLETED || $matchedRoomSession->attendance_record_id !== $existingAttendance->id) {
                    $matchedRoomSession->update([
                        'attendance_record_id' => $existingAttendance->id,
                        'status' => TeacherScheduleStatus::COMPLETED,
                    ]);
                }

                $clockedInTimeStr = Carbon::parse($existingAttendance->timestamp_in)->format('g:i A');

                return [
                    'success' => true,
                    'already_present' => true,
                    'status' => 'already_present',
                    'title' => 'Already Clocked In (Present)',
                    'message' => "{$teacher->full_name} is already marked PRESENT for {$subjectCode} (clocked in at {$clockedInTimeStr}). Only one scan is needed — no time-out required.",
                    'teacher' => [
                        'id' => $teacher->id,
                        'full_name' => $teacher->full_name,
                        'employee_id' => $teacher->employee_id,
                        'department' => $teacher->department,
                    ],
                    'session' => [
                        'id' => $matchedRoomSession->id,
                        'subject_code' => $subjectCode,
                        'subject_title' => $subjectTitle,
                        'section' => $matchedRoomSession->section,
                        'time_slot' => $matchedRoomSession->start_time->format('g:i A').' - '.$matchedRoomSession->end_time->format('g:i A'),
                        'clock_in_time' => $clockedInTimeStr,
                        'is_late' => false,
                    ],
                    'log_id' => null,
                ];
            }

            // 6. First Scan! Mark immediately as PRESENT & COMPLETED (no time-out needed)
            $sessionStart = Carbon::parse($scanCarbon->toDateString().' '.$matchedRoomSession->start_time->format('H:i:s'));
            $graceDeadline = $sessionStart->copy()->addMinutes(ZktecoAttendanceService::GRACE_PERIOD_MINUTES);
            $isLate = $scanCarbon->gt($graceDeadline);
            $minutesLate = $isLate ? (int) $sessionStart->diffInMinutes($scanCarbon) : 0;

            $arrivalNote = $isLate
                ? "Clocked in via QR Kiosk ({$kiosk->kiosk_name} • {$classroomLabel}) for {$subjectCode} — Marked PRESENT (Late by {$minutesLate}m)."
                : "Clocked in on time via QR Kiosk ({$kiosk->kiosk_name} • {$classroomLabel}) for {$subjectCode} — Marked PRESENT.";

            if (! $existingAttendance) {
                $existingAttendance = AttendanceRecord::create([
                    'teacher_assignment_id' => $matchedRoomSession->teacher_assignment_id,
                    'date' => $scanCarbon->toDateString(),
                    'status' => AttendanceStatus::PRESENT,
                    'timestamp_in' => $scanCarbon,
                    'timestamp_out' => null,
                    'notes' => $arrivalNote,
                    'recorded_by' => $teacher->user_id,
                ]);
            } else {
                $existingAttendance->update([
                    'status' => AttendanceStatus::PRESENT,
                    'timestamp_in' => $scanCarbon,
                    'notes' => $arrivalNote,
                ]);
            }

            // Single clock-in immediately marks the session COMPLETED / PRESENT
            $matchedRoomSession->update([
                'attendance_record_id' => $existingAttendance->id,
                'status' => TeacherScheduleStatus::COMPLETED,
            ]);

            $kiosk->increment('scans_count');

            $log = ZktecoAttendanceLog::create([
                'zkteco_device_id' => null,
                'qr_kiosk_id' => $kiosk->id,
                'classroom_id' => $kiosk->classroom_id,
                'biometric_pin' => $teacher->employee_id,
                'teacher_id' => $teacher->id,
                'punch_time' => $scanCarbon,
                'punch_type' => 'check_in',
                'verify_type' => 'qr_kiosk',
                'match_status' => ZktecoMatchStatus::MATCHED,
                'teacher_schedule_id' => $matchedRoomSession->id,
                'attendance_record_id' => $existingAttendance->id,
                'rejection_reason' => $isLate
                    ? "Present via QR Kiosk (Late by {$minutesLate}m) — Verified in {$classroomLabel} for {$subjectCode}."
                    : "Present via QR Kiosk (On Time) — Verified in {$classroomLabel} for {$subjectCode}.",
                'raw_payload' => ['qr_payload' => $qrPayload, 'kiosk_id' => $kiosk->id],
            ]);

            return [
                'success' => true,
                'already_present' => false,
                'status' => 'matched',
                'title' => 'Clock-In Successful — Marked PRESENT',
                'message' => $log->rejection_reason,
                'teacher' => [
                    'id' => $teacher->id,
                    'full_name' => $teacher->full_name,
                    'employee_id' => $teacher->employee_id,
                    'department' => $teacher->department,
                ],
                'session' => [
                    'id' => $matchedRoomSession->id,
                    'subject_code' => $subjectCode,
                    'subject_title' => $subjectTitle,
                    'section' => $matchedRoomSession->section,
                    'time_slot' => $matchedRoomSession->start_time->format('g:i A').' - '.$matchedRoomSession->end_time->format('g:i A'),
                    'clock_in_time' => $scanCarbon->format('g:i A'),
                    'is_late' => $isLate,
                    'minutes_late' => $minutesLate,
                ],
                'log_id' => $log->id,
            ];
        });
    }

    /**
     * Get today's scheduled classes for a specific classroom so the Kiosk can display live room status.
     */
    public function getTodayClassroomSessions(Classroom $classroom, ?CarbonInterface $date = null): Collection
    {
        $targetDate = $date ? Carbon::instance($date) : Carbon::now();

        // Ensure all active teachers have their schedules materialized for today
        $activeTeachers = Teacher::active()->get();
        foreach ($activeTeachers as $teacher) {
            $this->biometricService->ensureTeacherSchedulesForDate($teacher, $targetDate);
        }

        $allTodaySessions = TeacherSchedule::query()
            ->with(['subject', 'teacher', 'classroom', 'teacherAssignment.schedule.classroom', 'attendanceRecord'])
            ->whereDate('scheduled_date', $targetDate->toDateString())
            ->where('is_holiday', false)
            ->where('status', '!=', TeacherScheduleStatus::CANCELLED->value)
            ->orderBy('start_time')
            ->get();

        return $allTodaySessions
            ->filter(fn (TeacherSchedule $session) => $this->biometricService->doesSessionMatchClassroom($session, $classroom))
            ->values()
            ->map(function (TeacherSchedule $session) use ($targetDate) {
                $start = Carbon::parse($targetDate->toDateString().' '.$session->start_time->format('H:i:s'));
                $end = Carbon::parse($targetDate->toDateString().' '.$session->end_time->format('H:i:s'));
                $isPresent = $session->status === TeacherScheduleStatus::COMPLETED
                    || ($session->attendanceRecord && $session->attendanceRecord->status === AttendanceStatus::PRESENT);

                $isLiveWindow = $targetDate->betweenIncluded(
                    $start->copy()->subMinutes(ZktecoAttendanceService::EARLY_ARRIVAL_MINUTES),
                    $end->copy()->addMinutes(ZktecoAttendanceService::CHECKOUT_BUFFER_MINUTES)
                );

                return [
                    'id' => $session->id,
                    'subject_code' => $session->subject?->code ?? 'N/A',
                    'subject_title' => $session->subject?->title ?? 'No title',
                    'section' => $session->section,
                    'teacher_name' => $session->teacher?->full_name ?? 'Unassigned',
                    'teacher_employee_id' => $session->teacher?->employee_id,
                    'start_time' => $session->start_time->format('g:i A'),
                    'end_time' => $session->end_time->format('g:i A'),
                    'is_present' => $isPresent,
                    'clock_in_time' => $session->attendanceRecord?->timestamp_in
                        ? Carbon::parse($session->attendanceRecord->timestamp_in)->format('g:i A')
                        : null,
                    'is_live_window' => $isLiveWindow,
                ];
            });
    }
}
