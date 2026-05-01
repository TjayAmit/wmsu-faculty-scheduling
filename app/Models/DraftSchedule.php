<?php

namespace App\Models;

use App\Enums\DraftScheduleStatus;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['teacher_id', 'schedule_id', 'status', 'notes', 'reviewed_by', 'reviewed_at', 'review_comments', 'submitted_at', 'teacher_assignment_id'])]
class DraftSchedule extends Model
{
    use HasFactory, SoftDeletes;

    
    /**
     * Get the teacher who proposed the draft.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the schedule being proposed.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the user who reviewed the draft.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the teacher assignment created from this draft (if approved).
     */
    public function teacherAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherAssignment::class, 'teacher_assignment_id');
    }

    /**
     * Scope a query to only include drafts with a specific status.
     */
    public function scopeWithStatus($query, DraftScheduleStatus $status)
    {
        return $query->where('status', $status->value);
    }

    /**
     * Scope a query to only include draft status.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', DraftScheduleStatus::DRAFT->value);
    }

    /**
     * Scope a query to only include pending review status.
     */
    public function scopePendingReview($query)
    {
        return $query->where('status', DraftScheduleStatus::PENDING_REVIEW->value);
    }

    /**
     * Scope a query to only include approved status.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', DraftScheduleStatus::APPROVED->value);
    }

    /**
     * Scope a query to only include rejected status.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', DraftScheduleStatus::REJECTED->value);
    }

    /**
     * Scope a query to filter by teacher.
     */
    public function scopeForTeacher($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'status' => DraftScheduleStatus::class,
            'reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Check if the draft can be submitted for review.
     */
    public function canBeSubmitted(): bool
    {
        return $this->status === DraftScheduleStatus::DRAFT;
    }

    /**
     * Check if the draft can be reviewed.
     */
    public function canBeReviewed(): bool
    {
        return $this->status === DraftScheduleStatus::PENDING_REVIEW;
    }

    /**
     * Check if the draft is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === DraftScheduleStatus::APPROVED;
    }

    /**
     * Check if the draft is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === DraftScheduleStatus::REJECTED;
    }
}
