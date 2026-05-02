<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['requesting_teacher_id', 'substitute_teacher_id', 'schedule_id', 'date', 'reason', 'status', 'approved_by', 'approved_at', 'notes'])]
#[Cast(['approved_at' => 'datetime'])]
class SubstituteRequest extends Model
{
    /** @use HasFactory<\Database\Factories\SubstituteRequestFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the teacher requesting the substitute.
     */
    public function requestingTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'requesting_teacher_id');
    }

    /**
     * Get the substitute teacher.
     */
    public function substituteTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'substitute_teacher_id');
    }

    /**
     * Get the schedule for this substitute request.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the user who approved the request.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to filter by requesting teacher.
     */
    public function scopeForRequestingTeacher($query, $teacherId)
    {
        return $query->where('requesting_teacher_id', $teacherId);
    }

    /**
     * Scope a query to filter by substitute teacher.
     */
    public function scopeForSubstituteTeacher($query, $teacherId)
    {
        return $query->where('substitute_teacher_id', $teacherId);
    }

    /**
     * Scope a query to filter by date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Check if the request is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the request is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'approved_at' => 'datetime',
        ];
    }
}
