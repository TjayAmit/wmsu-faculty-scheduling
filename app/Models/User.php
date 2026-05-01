<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * Get the teacher profile associated with the user.
     */
    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    /**
     * Check if user has a teacher profile.
     */
    public function isTeacher(): bool
    {
        return ! is_null($this->teacher);
    }

    /**
     * Link this user to an existing teacher profile.
     */
    public function linkToTeacher(Teacher $teacher): bool
    {
        if ($teacher->hasUserAccount()) {
            return false; // Teacher already has a user account
        }

        $teacher->user_id = $this->id;

        return $teacher->save();
    }

    /**
     * Unlink this user from teacher profile.
     */
    public function unlinkFromTeacher(): bool
    {
        if (! $this->teacher) {
            return false;
        }

        $this->teacher->user_id = null;

        return $this->teacher->save();
    }

    /**
     * Get the teacher assignments made by this user.
     */
    public function assignedTeacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, 'assigned_by');
    }

    /**
     * Get the attendance records recorded by this user.
     */
    public function recordedAttendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class, 'recorded_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
