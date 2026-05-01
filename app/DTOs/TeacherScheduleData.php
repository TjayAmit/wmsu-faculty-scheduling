<?php

namespace App\DTOs;

use App\Enums\TeacherScheduleStatus;
use App\Models\TeacherSchedule;
use Illuminate\Http\Request;

class TeacherScheduleData
{
    public function __construct(
        public readonly int $teacherAssignmentId,
        public readonly int $draftScheduleId,
        public readonly int $subjectId,
        public readonly int $semesterId,
        public readonly int $teacherId,
        public readonly string $scheduledDate,
        public readonly string $dayOfWeek,
        public readonly string $startTime,
        public readonly string $endTime,
        public readonly ?string $room = null,
        public readonly ?string $section = null,
        public readonly TeacherScheduleStatus|string $status = TeacherScheduleStatus::SCHEDULED,
        public readonly ?int $attendanceRecordId = null,
        public readonly ?string $notes = null,
        public readonly bool $isHoliday = false,
        public readonly ?string $holidayName = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            teacherAssignmentId: $request->validated('teacher_assignment_id'),
            draftScheduleId: $request->validated('draft_schedule_id'),
            subjectId: $request->validated('subject_id'),
            semesterId: $request->validated('semester_id'),
            teacherId: $request->validated('teacher_id'),
            scheduledDate: $request->validated('scheduled_date'),
            dayOfWeek: $request->validated('day_of_week'),
            startTime: $request->validated('start_time'),
            endTime: $request->validated('end_time'),
            room: $request->validated('room'),
            section: $request->validated('section'),
            status: TeacherScheduleStatus::from($request->validated('status', 'scheduled')),
            attendanceRecordId: $request->validated('attendance_record_id'),
            notes: $request->validated('notes'),
            isHoliday: $request->validated('is_holiday', false),
            holidayName: $request->validated('holiday_name'),
        );
    }

    public static function fromModel(TeacherSchedule $teacherSchedule): self
    {
        return new self(
            teacherAssignmentId: $teacherSchedule->teacher_assignment_id,
            draftScheduleId: $teacherSchedule->draft_schedule_id,
            subjectId: $teacherSchedule->subject_id,
            semesterId: $teacherSchedule->semester_id,
            teacherId: $teacherSchedule->teacher_id,
            scheduledDate: $teacherSchedule->scheduled_date->format('Y-m-d'),
            dayOfWeek: $teacherSchedule->day_of_week,
            startTime: $teacherSchedule->start_time->format('H:i:s'),
            endTime: $teacherSchedule->end_time->format('H:i:s'),
            room: $teacherSchedule->room,
            section: $teacherSchedule->section,
            status: $teacherSchedule->status,
            attendanceRecordId: $teacherSchedule->attendance_record_id,
            notes: $teacherSchedule->notes,
            isHoliday: $teacherSchedule->is_holiday,
            holidayName: $teacherSchedule->holiday_name,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'teacher_assignment_id' => $this->teacherAssignmentId,
            'draft_schedule_id' => $this->draftScheduleId,
            'subject_id' => $this->subjectId,
            'semester_id' => $this->semesterId,
            'teacher_id' => $this->teacherId,
            'scheduled_date' => $this->scheduledDate,
            'day_of_week' => $this->dayOfWeek,
            'start_time' => $this->startTime,
            'end_time' => $this->endTime,
            'room' => $this->room,
            'section' => $this->section,
            'status' => $this->status instanceof TeacherScheduleStatus ? $this->status->value : $this->status,
            'attendance_record_id' => $this->attendanceRecordId,
            'notes' => $this->notes,
            'is_holiday' => $this->isHoliday,
            'holiday_name' => $this->holidayName,
        ], fn ($value) => $value !== null);
    }

    public static function forGeneration(
        int $teacherAssignmentId,
        int $draftScheduleId,
        int $subjectId,
        int $semesterId,
        int $teacherId,
        string $scheduledDate,
        string $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room = null,
        ?string $section = null,
        bool $isHoliday = false,
        ?string $holidayName = null,
    ): self {
        return new self(
            teacherAssignmentId: $teacherAssignmentId,
            draftScheduleId: $draftScheduleId,
            subjectId: $subjectId,
            semesterId: $semesterId,
            teacherId: $teacherId,
            scheduledDate: $scheduledDate,
            dayOfWeek: $dayOfWeek,
            startTime: $startTime,
            endTime: $endTime,
            room: $room,
            section: $section,
            status: $isHoliday ? TeacherScheduleStatus::CANCELLED : TeacherScheduleStatus::SCHEDULED,
            isHoliday: $isHoliday,
            holidayName: $holidayName,
        );
    }
}
