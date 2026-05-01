<?php

namespace App\Models;

use App\Enums\TeacherScheduleStatus;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'teacher_assignment_id',
    'draft_schedule_id',
    'subject_id',
    'semester_id',
    'teacher_id',
    'scheduled_date',
    'day_of_week',
    'start_time',
    'end_time',
    'room',
    'section',
    'status',
    'attendance_record_id',
    'notes',
    'is_holiday',
    'holiday_name',
])]
class TeacherSchedule extends Model
{
    use HasFactory, SoftDeletes;

    #[Cast(type: TeacherScheduleStatus::class)]
    protected TeacherScheduleStatus|string $status;

    /**
     * Get the teacher assignment for this schedule.
     */
    public function teacherAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherAssignment::class);
    }

    /**
     * Get the original draft schedule.
     */
    public function draftSchedule(): BelongsTo
    {
        return $this->belongsTo(DraftSchedule::class);
    }

    /**
     * Get the subject for this schedule.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the semester for this schedule.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the teacher for this schedule.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the attendance record for this schedule.
     */
    public function attendanceRecord(): BelongsTo
    {
        return $this->belongsTo(AttendanceRecord::class);
    }

    /**
     * Scope a query to only include scheduled sessions.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', TeacherScheduleStatus::SCHEDULED->value);
    }

    /**
     * Scope a query to only include cancelled sessions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', TeacherScheduleStatus::CANCELLED->value);
    }

    /**
     * Scope a query to only include completed sessions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', TeacherScheduleStatus::COMPLETED->value);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by teacher and semester.
     */
    public function scopeForTeacherSemester($query, $teacherId, $semesterId)
    {
        return $query->where('teacher_id', $teacherId)
            ->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to exclude holidays.
     */
    public function scopeNotHoliday($query)
    {
        return $query->where('is_holiday', false);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'status' => TeacherScheduleStatus::class,
            'scheduled_date' => 'date',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'is_holiday' => 'boolean',
        ];
    }

    /**
     * Get formatted date and time for display.
     */
    public function getFormattedDateTimeAttribute(): string
    {
        return $this->scheduled_date->format('M d, Y').' '.
               $this->start_time->format('g:i A').' - '.
               $this->end_time->format('g:i A');
    }

    /**
     * Check if the session is today.
     */
    public function isToday(): bool
    {
        return $this->scheduled_date->isToday();
    }

    /**
     * Check if the session is in the past.
     */
    public function isPast(): bool
    {
        $now = now();
        $scheduleDateTime = $this->scheduled_date->copy()->setTime(
            $this->start_time->hour,
            $this->start_time->minute,
            $this->start_time->second
        );

        return $scheduleDateTime->isPast($now);
    }

    /**
     * Check if the session can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === TeacherScheduleStatus::SCHEDULED &&
               ! $this->isPast();
    }
}
