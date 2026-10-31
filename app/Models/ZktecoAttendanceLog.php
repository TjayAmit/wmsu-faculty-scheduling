<?php

namespace App\Models;

use App\Enums\ZktecoMatchStatus;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'zkteco_device_id',
    'classroom_id',
    'biometric_pin',
    'teacher_id',
    'punch_time',
    'punch_type',
    'verify_type',
    'match_status',
    'teacher_schedule_id',
    'attendance_record_id',
    'rejection_reason',
    'raw_payload',
])]
class ZktecoAttendanceLog extends Model
{
    use HasFactory;

    #[Cast(type: ZktecoMatchStatus::class)]
    protected ZktecoMatchStatus|string $match_status;

    /**
     * Get the device that captured the punch.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(ZktecoDevice::class, 'zkteco_device_id');
    }

    /**
     * Get the classroom where the punch occurred.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Get the teacher associated with the biometric PIN.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the matched teacher schedule session.
     */
    public function teacherSchedule(): BelongsTo
    {
        return $this->belongsTo(TeacherSchedule::class);
    }

    /**
     * Get the attendance record created or updated from this punch.
     */
    public function attendanceRecord(): BelongsTo
    {
        return $this->belongsTo(AttendanceRecord::class);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'punch_time' => 'datetime',
            'match_status' => ZktecoMatchStatus::class,
            'raw_payload' => 'array',
        ];
    }
}
