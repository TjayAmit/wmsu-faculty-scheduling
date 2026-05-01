<?php

namespace App\Models;

use App\Enums\EmploymentType;
use Database\Factories\WorkloadRuleFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['employment_type', 'max_teaching_hours', 'max_units', 'min_units', 'max_preparation_hours', 'overtime_rate', 'description', 'is_active', 'effective_date'])]
#[Cast(['max_teaching_hours' => 'decimal:1', 'max_units' => 'decimal:1', 'min_units' => 'decimal:1', 'max_preparation_hours' => 'decimal:1', 'overtime_rate' => 'decimal:2', 'is_active' => 'boolean'])]
class WorkloadRule extends Model
{
    /** @use HasFactory<WorkloadRuleFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Scope a query to only include active rules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by employment type.
     */
    public function scopeByEmploymentType($query, EmploymentType $employmentType)
    {
        return $query->where('employment_type', $employmentType->value);
    }

    /**
     * Scope a query to get rules effective on or after a specific date.
     */
    public function scopeEffectiveOn($query, string $date)
    {
        return $query->where('effective_date', '<=', $date);
    }

    /**
     * Scope a query to get the latest rule for each employment type.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('effective_date', 'desc');
    }

    /**
     * Get the employment type label.
     */
    public function getEmploymentTypeLabelAttribute(): string
    {
        return EmploymentType::from($this->employment_type)->getLabel();
    }

    /**
     * Check if this rule is currently effective.
     */
    public function isCurrentlyEffective(): bool
    {
        return $this->is_active && $this->effective_date <= now()->toDateString();
    }

    /**
     * Get the unit range as a formatted string.
     */
    public function getUnitRangeAttribute(): string
    {
        if ($this->min_units) {
            return "{$this->min_units} - {$this->max_units}";
        }

        return "Up to {$this->max_units}";
    }

    /**
     * Check if a given number of units is within the allowed range.
     */
    public function isWithinUnitRange(float $units): bool
    {
        $withinMax = $units <= $this->max_units;
        $withinMin = $this->min_units ? $units >= $this->min_units : true;

        return $withinMax && $withinMin;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'max_teaching_hours' => 'decimal:1',
            'max_units' => 'decimal:1',
            'min_units' => 'decimal:1',
            'max_preparation_hours' => 'decimal:1',
            'overtime_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'effective_date' => 'date',
            'employment_type' => EmploymentType::class,
        ];
    }
}
