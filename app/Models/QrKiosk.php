<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'classroom_id',
    'kiosk_name',
    'kiosk_token',
    'browser_name',
    'user_agent',
    'ip_address',
    'registered_by',
    'registered_at',
    'last_used_at',
    'scans_count',
    'is_active',
    'notes',
])]
class QrKiosk extends Model
{
    use HasFactory;

    public const COOKIE_NAME = 'wmsu_qr_kiosk_token';

    protected $hidden = [
        'kiosk_token',
    ];

    /**
     * Get the classroom assigned to this QR Kiosk browser.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Get the admin user who registered this browser kiosk.
     */
    public function registeredByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    /**
     * Get the attendance logs recorded by this QR Kiosk.
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(ZktecoAttendanceLog::class, 'qr_kiosk_id');
    }

    /**
     * Scope a query to only include active kiosks.
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
            'registered_at' => 'datetime',
            'last_used_at' => 'datetime',
            'scans_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
