<?php

namespace App\Models;

use App\Enums\HolidayType;
use Database\Factories\HolidayFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'date', 'type', 'description', 'affects_schedules', 'academic_year'])]
#[Cast(['affects_schedules' => 'boolean'])]
class Holiday extends Model
{
    /** @use HasFactory<HolidayFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Scope a query to only include holidays that affect schedules.
     */
    public function scopeAffectsSchedules($query)
    {
        return $query->where('affects_schedules', true);
    }

    /**
     * Scope a query to filter by holiday type.
     */
    public function scopeByType($query, HolidayType $holidayType)
    {
        return $query->where('type', $holidayType->value);
    }

    /**
     * Scope a query to filter by academic year.
     */
    public function scopeByAcademicYear($query, string $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    /**
     * Get the holiday type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return HolidayType::from($this->type)->getLabel();
    }

    /**
     * Check if holiday is within a date range.
     */
    public function isWithinRange(string $startDate, string $endDate): bool
    {
        return $this->date >= $startDate && $this->date <= $endDate;
    }

    /**
     * Get formatted holiday date.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('F j, Y');
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
            'affects_schedules' => 'boolean',
            'type' => HolidayType::class,
        ];
    }
}
