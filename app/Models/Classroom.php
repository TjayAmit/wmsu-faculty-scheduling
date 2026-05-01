<?php

namespace App\Models;

use App\Enums\RoomType;
use Database\Factories\ClassroomFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['building', 'room_number', 'room_name', 'capacity', 'room_type', 'equipment', 'is_active'])]
#[Cast(['equipment' => 'array', 'is_active' => 'boolean'])]
class Classroom extends Model
{
    /** @use HasFactory<ClassroomFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the schedule conflicts associated with this classroom.
     */
    public function scheduleConflicts(): HasMany
    {
        return $this->hasMany(ScheduleConflict::class);
    }

    /**
     * Get the full room identifier.
     */
    public function getFullIdentifierAttribute(): string
    {
        return "{$this->building} {$this->room_number}";
    }

    /**
     * Get the room type label.
     */
    public function getRoomTypeLabelAttribute(): string
    {
        return RoomType::from($this->room_type)->getLabel();
    }

    /**
     * Scope a query to only include active classrooms.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by room type.
     */
    public function scopeByRoomType($query, RoomType $roomType)
    {
        return $query->where('room_type', $roomType->value);
    }

    /**
     * Check if classroom has specific equipment.
     */
    public function hasEquipment(string $equipment): bool
    {
        return in_array($equipment, $this->equipment ?? []);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'equipment' => 'array',
            'is_active' => 'boolean',
            'room_type' => RoomType::class,
        ];
    }
}
