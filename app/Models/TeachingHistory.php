<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['teacher_id', 'semester_id', 'subject_id', 'schedule_id', 'hours_assigned', 'hours_completed', 'status', 'notes', 'archived_at'])]
#[Cast(['hours_assigned' => 'decimal:2', 'hours_completed' => 'decimal:2'])]
class TeachingHistory extends Model
{
    /** @use HasFactory<\Database\Factories\TeachingHistoryFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the teacher for this teaching history.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the semester for this teaching history.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the subject for this teaching history.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the schedule for this teaching history.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Scope a query to filter by teacher.
     */
    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Scope a query to filter by semester.
     */
    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include archived records.
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    /**
     * Calculate completion percentage.
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->hours_assigned == 0) {
            return 0;
        }

        return ($this->hours_completed / $this->hours_assigned) * 100;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hours_assigned' => 'decimal:2',
            'hours_completed' => 'decimal:2',
            'archived_at' => 'datetime',
        ];
    }
}
