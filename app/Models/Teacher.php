<?php

namespace App\Models;

use App\Enums\EmploymentType;
use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'employee_id', 'department', 'rank', 'employment_type', 'date_hired', 'phone', 'address', 'is_active'])]
class Teacher extends Model
{
    /** @use HasFa, SoftDeletesctory<TeacherFactory> */
    use HasFactory;

    #[Cast(type: EmploymentType::class)]
    protected EmploymentType|string $employment_type;

    #[Cast(type: 'date')]
    protected $date_hired;

    #[Cast(type: 'boolean')]
    protected $is_active;

    /**
     * Get the user associated with the teacher.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the teacher assignments for the teacher.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    /**
     * Get the active teacher assignments for the teacher.
     */
    public function activeAssignments(): HasMany
    {
        return $this->assignments()->where('is_active', true);
    }

    /**
     * Scope a query to only include active teachers.
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
            'employment_type' => EmploymentType::class,
            'date_hired' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
