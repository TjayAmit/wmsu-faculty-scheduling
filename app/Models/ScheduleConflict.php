<?php

namespace App\Models;

use App\Enums\ConflictSeverity;
use App\Enums\ConflictStatus;
use App\Enums\ConflictType;
use App\Enums\DayOfWeek;
use Database\Factories\ScheduleConflictFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['conflict_type', 'primary_schedule_id', 'secondary_schedule_id', 'teacher_id', 'classroom_id', 'time_slot_id', 'day_of_week', 'semester_id', 'severity', 'status', 'resolved_by', 'resolution_notes'])]
class ScheduleConflict extends Model
{
    /** @use HasFactory<ScheduleConflictFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the primary schedule involved in the conflict.
     */
    public function primarySchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the secondary schedule involved in the conflict.
     */
    public function secondarySchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the teacher involved in the conflict.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the classroom involved in the conflict.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Get the time slot involved in the conflict.
     */
    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    /**
     * Get the semester where the conflict occurs.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the user who resolved the conflict.
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope a query to only include pending conflicts.
     */
    public function scopePending($query)
    {
        return $query->where('status', ConflictStatus::PENDING->value);
    }

    /**
     * Scope a query to only include resolved conflicts.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', ConflictStatus::RESOLVED->value);
    }

    /**
     * Scope a query to filter by conflict type.
     */
    public function scopeByType($query, ConflictType $conflictType)
    {
        return $query->where('conflict_type', $conflictType->value);
    }

    /**
     * Scope a query to filter by severity.
     */
    public function scopeBySeverity($query, ConflictSeverity $severity)
    {
        return $query->where('severity', $severity->value);
    }

    /**
     * Get the conflict type label.
     */
    public function getConflictTypeLabelAttribute(): string
    {
        return ConflictType::from($this->conflict_type)->getLabel();
    }

    /**
     * Get the severity label.
     */
    public function getSeverityLabelAttribute(): string
    {
        return ConflictSeverity::from($this->severity)->getLabel();
    }

    /**
     * Get the status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return ConflictStatus::from($this->status)->getLabel();
    }

    /**
     * Get the day of week label.
     */
    public function getDayOfWeekLabelAttribute(): ?string
    {
        return $this->day_of_week ? DayOfWeek::from($this->day_of_week)->getLabel() : null;
    }

    /**
     * Check if conflict is resolved.
     */
    public function isResolved(): bool
    {
        return $this->status === ConflictStatus::RESOLVED->value;
    }

    /**
     * Check if conflict is pending.
     */
    public function isPending(): bool
    {
        return $this->status === ConflictStatus::PENDING->value;
    }

    /**
     * Mark conflict as resolved.
     */
    public function markAsResolved(?User $resolver = null, ?string $notes = null): bool
    {
        $this->status = ConflictStatus::RESOLVED->value;
        $this->resolved_by = $resolver?->id;
        $this->resolution_notes = $notes;

        return $this->save();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'conflict_type' => ConflictType::class,
            'severity' => ConflictSeverity::class,
            'status' => ConflictStatus::class,
            'day_of_week' => DayOfWeek::class,
        ];
    }
}
