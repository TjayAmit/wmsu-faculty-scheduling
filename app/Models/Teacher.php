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

#[Fillable(['user_id', 'email', 'first_name', 'last_name', 'employee_id', 'department', 'rank', 'employment_type', 'date_hired', 'phone', 'address', 'is_active'])]
class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory, SoftDeletes;

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
     * Scope a query to find teachers without user accounts.
     */
    public function scopeWithoutUser($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Get the teacher's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if teacher has a linked user account.
     */
    public function hasUserAccount(): bool
    {
        return ! is_null($this->user_id);
    }

    /**
     * Get validation rules for teacher creation.
     */
    public static function getValidationRules(array $overrides = []): array
    {
        return array_merge([
            'email' => [
                'required',
                'email',
                'unique:teachers,email',
                'max:255',
            ],
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],
            'last_name' => [
                'required',
                'string',
                'max:255',
            ],
            'employee_id' => [
                'required',
                'string',
                'max:50',
                'unique:teachers,employee_id',
            ],
            'department' => [
                'nullable',
                'string',
                'max:255',
            ],
            'rank' => [
                'nullable',
                'string',
                'max:100',
            ],
            'employment_type' => [
                'required',
                'enum:full_time,part_time,casual',
            ],
            'date_hired' => [
                'nullable',
                'date',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],
            'address' => [
                'nullable',
                'string',
            ],
            'is_active' => [
                'boolean',
            ],
            'user_id' => [
                'nullable',
                'exists:users,id',
                'unique:teachers,user_id',
            ],
        ], $overrides);
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
