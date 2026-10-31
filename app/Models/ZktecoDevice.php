<?php

namespace App\Models;

use App\Enums\ZktecoDeviceStatus;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'classroom_id',
    'device_name',
    'ip_address',
    'port',
    'comm_key',
    'serial_number',
    'model_name',
    'connection_type',
    'status',
    'last_sync_at',
    'last_heartbeat_at',
    'is_active',
    'notes',
])]
class ZktecoDevice extends Model
{
    use HasFactory, SoftDeletes;

    #[Cast(type: ZktecoDeviceStatus::class)]
    protected ZktecoDeviceStatus|string $status;

    /**
     * Get the classroom exclusively assigned to this ZKTeco device.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Get the attendance punch logs captured by this device.
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(ZktecoAttendanceLog::class);
    }

    /**
     * Scope a query to only include active devices.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include online devices.
     */
    public function scopeOnline($query)
    {
        return $query->where('status', ZktecoDeviceStatus::ONLINE->value);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'status' => ZktecoDeviceStatus::class,
            'last_sync_at' => 'datetime',
            'last_heartbeat_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
