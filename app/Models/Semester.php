<?php

namespace App\Models;

use App\Enums\SemesterType;
use Database\Factories\SemesterFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'academic_year', 'semester_type', 'start_date', 'end_date', 'is_current'])]
class Semester extends Model
{
    /** @use HasFactory<SemesterFactory> */
    use HasFactory, SoftDeletes;

    #[Cast(type: SemesterType::class)]
    protected SemesterType|string $semester_type;

    #[Cast(type: 'date')]
    protected $start_date;

    #[Cast(type: 'date')]
    protected $end_date;

    #[Cast(type: 'boolean')]
    protected $is_current;

    /**
     * Get the schedules for the semester.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Scope a query to only include current semester.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope a query to only include active semesters.
     */
    public function scopeActive($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'semester_type' => SemesterType::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
        ];
    }
}
