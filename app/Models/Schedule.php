<?php

namespace App\Models;

use App\Enums\DayOfWeek;
use Database\Factories\ScheduleFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['subject_id', 'semester_id', 'time_slot_id', 'day_of_week', 'room', 'section', 'is_active'])]
class Schedule extends Model
{
    /** @use HasFactory<ScheduleFactory> */
    use HasFactory;

    #[Cast(type: DayOfWeek::class)]
    protected DayOfWeek|string $day_of_week;

    #[Cast(type: 'boolean')]
    protected $is_active;

    /**
     * Get the subject for the schedule.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the semester for the schedule.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the time slot for the schedule.
     */
    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    /**
     * Get the teacher assignment for the schedule.
     */
    public function teacherAssignment(): HasOne
    {
        return $this->hasOne(TeacherAssignment::class);
    }

    /**
     * Scope a query to only include active schedules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by semester.
     */
    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to filter by day of week.
     */
    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => DayOfWeek::class,
            'is_active' => 'boolean',
        ];
    }
}
