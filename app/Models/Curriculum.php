<?php

namespace App\Models;

use App\Enums\CurriculumSemesterType;
use Database\Factories\CurriculumFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['program_id', 'subject_id', 'year_level', 'semester_type', 'is_required', 'prerequisite_subjects', 'units_override'])]
#[Cast(['prerequisite_subjects' => 'array', 'is_required' => 'boolean', 'units_override' => 'decimal:1'])]
class Curriculum extends Model
{
    /** @use HasFactory<CurriculumFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the program that owns the curriculum item.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the subject that owns the curriculum item.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the effective units for this curriculum item.
     */
    public function getEffectiveUnitsAttribute(): float
    {
        return $this->units_override ?? $this->subject->units;
    }

    /**
     * Get the semester type label.
     */
    public function getSemesterTypeLabelAttribute(): string
    {
        return CurriculumSemesterType::from($this->semester_type)->getLabel();
    }

    /**
     * Check if this curriculum item has prerequisites.
     */
    public function hasPrerequisites(): bool
    {
        return !empty($this->prerequisite_subjects);
    }

    /**
     * Get prerequisite subjects as models.
     */
    public function getPrerequisiteSubjects()
    {
        if (!$this->hasPrerequisites()) {
            return collect();
        }

        return Subject::whereIn('id', $this->prerequisite_subjects)->get();
    }

    /**
     * Scope a query to only include required subjects.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope a query to filter by year level.
     */
    public function scopeByYearLevel($query, int $yearLevel)
    {
        return $query->where('year_level', $yearLevel);
    }

    /**
     * Scope a query to filter by semester type.
     */
    public function scopeBySemesterType($query, CurriculumSemesterType $semesterType)
    {
        return $query->where('semester_type', $semesterType->value);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prerequisite_subjects' => 'array',
            'is_required' => 'boolean',
            'units_override' => 'decimal:1',
            'semester_type' => CurriculumSemesterType::class,
        ];
    }
}
