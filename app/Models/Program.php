<?php

namespace App\Models;

use App\Enums\DegreeLevel;
use Database\Factories\ProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['code', 'name', 'degree_level', 'department_id', 'description', 'duration_years', 'total_units', 'is_active'])]
#[Cast(['duration_years' => 'decimal:1', 'total_units' => 'decimal:1', 'is_active' => 'boolean'])]
class Program extends Model
{
    /** @use HasFactory<ProgramFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the department that owns the program.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the curriculum items for this program.
     */
    public function curriculum(): HasMany
    {
        return $this->hasMany(Curriculum::class);
    }

    /**
     * Get the sections for this program.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Scope a query to only include active programs.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by degree level.
     */
    public function scopeByDegreeLevel($query, DegreeLevel $degreeLevel)
    {
        return $query->where('degree_level', $degreeLevel->value);
    }

    /**
     * Get the degree level label.
     */
    public function getDegreeLevelLabelAttribute(): string
    {
        return DegreeLevel::from($this->degree_level)->getLabel();
    }

    /**
     * Get the full program name with code and degree.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->code} - {$this->name} ({$this->degree_level_label})";
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_years' => 'decimal:1',
            'total_units' => 'decimal:1',
            'is_active' => 'boolean',
            'degree_level' => DegreeLevel::class,
        ];
    }
}
