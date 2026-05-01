<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['subject_id', 'semester_id', 'time_slots', 'room', 'section', 'is_active'])]
class Schedule extends Model
{
    /** @use HasFactory<ScheduleFactory> */
    use HasFactory;

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
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'time_slots' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the list of time slots as a formatted string.
     */
    public function getTimeSlotsListAttribute(): string
    {
        if (empty($this->time_slots)) {
            return '';
        }

        return collect($this->time_slots)
            ->map(fn ($slot) => ucfirst($slot['day']))
            ->implode(', ');
    }

    /**
     * Get the count of time slots.
     */
    public function getTimeSlotCountAttribute(): int
    {
        return is_array($this->time_slots) ? count($this->time_slots) : 0;
    }

    /**
     * Get unique days from time slots.
     */
    public function getDaysAttribute(): array
    {
        if (empty($this->time_slots)) {
            return [];
        }

        return collect($this->time_slots)
            ->pluck('day')
            ->unique()
            ->values()
            ->toArray();
    }
}
