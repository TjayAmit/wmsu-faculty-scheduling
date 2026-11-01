<?php

namespace App\Models;

use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'title', 'units', 'description', 'is_active'])]
class Subject extends Model
{
    /** @use HasFa, SoftDeletesctory<SubjectFactory> */
    use HasFactory;

    protected $appends = ['name'];

    #[Cast(type: 'decimal:1')]
    protected $units;

    #[Cast(type: 'boolean')]
    protected $is_active;

    /**
     * Get the subject name (alias for title).
     */
    public function getNameAttribute(): string
    {
        return $this->title ?? '';
    }

    /**
     * Get the schedules for the subject.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get the curriculum entries that include this subject.
     */
    public function curricula(): HasMany
    {
        return $this->hasMany(Curriculum::class);
    }

    /**
     * Scope a query to only include active subjects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'units' => 'decimal:1',
            'is_active' => 'boolean',
        ];
    }
}
