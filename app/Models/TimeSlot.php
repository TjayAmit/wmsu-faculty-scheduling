<?php

namespace App\Models;

use Database\Factories\TimeSlotFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'start_time', 'end_time', 'is_active'])]
class TimeSlot extends Model
{
    /** @use HasFactory<TimeSlotFactory> */
    use HasFactory, SoftDeletes;

    #[Cast(type: 'datetime:H:i')]
    protected $start_time;

    #[Cast(type: 'datetime:H:i')]
    protected $end_time;

    #[Cast(type: 'boolean')]
    protected $is_active;

    /**
     * Get the schedules for the time slot.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Scope a query to only include active time slots.
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
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'is_active' => 'boolean',
        ];
    }
}
