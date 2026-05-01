<?php

namespace App\Models;

use App\Enums\AttendanceStatus;
use Database\Factories\AttendanceRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['teacher_assignment_id', 'date', 'status', 'timestamp_in', 'timestamp_out', 'notes', 'recorded_by'])]
class AttendanceRecord extends Model
{
    /** @use HasFa, SoftDeletesctory<AttendanceRecordFactory> */
    use HasFactory;

    #[Cast(type: AttendanceStatus::class)]
    protected AttendanceStatus|string $status;

    #[Cast(type: 'date')]
    protected $date;

    #[Cast(type: 'datetime')]
    protected $timestamp_in;

    #[Cast(type: 'datetime')]
    protected $timestamp_out;

    /**
     * Get the teacher assignment for the attendance record.
     */
    public function teacherAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherAssignment::class);
    }

    /**
     * Get the user who recorded the attendance.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include present records.
     */
    public function scopePresent($query)
    {
        return $query->where('status', AttendanceStatus::PRESENT);
    }

    /**
     * Scope a query to only include absent records.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', AttendanceStatus::ABSENT);
    }

    /**
     * Scope a query to only include pending records.
     */
    public function scopePending($query)
    {
        return $query->where('status', AttendanceStatus::PENDING);
    }

    /**
     * Scope a query to only include excused records.
     */
    public function scopeExcused($query)
    {
        return $query->where('status', AttendanceStatus::EXCUSED);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'status' => AttendanceStatus::class,
            'date' => 'date',
            'timestamp_in' => 'datetime',
            'timestamp_out' => 'datetime',
        ];
    }
}
