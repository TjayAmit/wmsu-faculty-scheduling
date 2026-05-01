<?php

namespace App\Models;

use Database\Factories\SectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['section_code', 'program_id', 'semester_id', 'year_level', 'max_students', 'current_students', 'adviser_id', 'is_active'])]
class Section extends Model
{
    /** @use HasFactory<SectionFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the program that owns the section.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the semester that owns the section.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the adviser (teacher) for this section.
     */
    public function adviser(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'adviser_id');
    }

    /**
     * Get the teacher schedules for this section.
     */
    public function teacherSchedules(): HasMany
    {
        return $this->hasMany(TeacherSchedule::class);
    }

    /**
     * Scope a query to only include active sections.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by year level.
     */
    public function scopeByYearLevel($query, int $yearLevel)
    {
        return $query->where('year_level', $yearLevel);
    }

    /**
     * Check if section is at full capacity.
     */
    public function isFull(): bool
    {
        return $this->current_students >= $this->max_students;
    }

    /**
     * Get the number of available slots.
     */
    public function getAvailableSlotsAttribute(): int
    {
        return max(0, $this->max_students - $this->current_students);
    }

    /**
     * Get the enrollment percentage.
     */
    public function getEnrollmentPercentageAttribute(): float
    {
        if ($this->max_students == 0) {
            return 0;
        }

        return round(($this->current_students / $this->max_students) * 100, 2);
    }

    /**
     * Get the full section identifier.
     */
    public function getFullIdentifierAttribute(): string
    {
        return "{$this->section_code} - {$this->program->name} Year {$this->year_level}";
    }

    /**
     * Check if section has an adviser assigned.
     */
    public function hasAdviser(): bool
    {
        return !is_null($this->adviser_id);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'max_students' => 'integer',
            'current_students' => 'integer',
            'year_level' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
