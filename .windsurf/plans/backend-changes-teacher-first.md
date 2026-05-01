# Backend Code Changes - Teacher-First Registration Implementation

## Laravel Backend Code Review Workflow Applied

This document outlines the specific backend code changes needed to implement teacher-first registration, following the Laravel Backend Code Review workflow standards.

## Models

### 1. app/Models/Teacher.php

**Current Issues to Address**:
- Missing email, first_name, last_name fields
- user_id relationship needs to handle nullable
- Fillable array needs updating
- Need proper validation rules

**Required Changes**:

```php
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
use Illuminate\Validation\Rule;

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
        return !is_null($this->user_id);
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
                'max:255'
            ],
            'first_name' => [
                'required',
                'string',
                'max:255'
            ],
            'last_name' => [
                'required',
                'string',
                'max:255'
            ],
            'employee_id' => [
                'required',
                'string',
                'max:50',
                'unique:teachers,employee_id'
            ],
            'department' => [
                'nullable',
                'string',
                'max:255'
            ],
            'rank' => [
                'nullable',
                'string',
                'max:100'
            ],
            'employment_type' => [
                'required',
                Rule::enum(EmploymentType::class)
            ],
            'date_hired' => [
                'nullable',
                'date'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'address' => [
                'nullable',
                'string'
            ],
            'is_active' => [
                'boolean'
            ],
            'user_id' => [
                'nullable',
                'exists:users,id',
                'unique:teachers,user_id'
            ]
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
```

### 2. app/Models/User.php

**Required Changes**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    // ... existing code ...

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
        return !is_null($this->teacher);
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
        if (!$this->teacher) {
            return false;
        }

        $this->teacher->user_id = null;
        return $this->teacher->save();
    }
}
```

## Migrations

### 1. Create Migration: Update Teachers Table

**File**: `database/migrations/update_teachers_table_for_teacher_first.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            // Make user_id nullable
            $table->dropForeign(['user_id']);
            $table->dropUnique('teachers_user_id_unique');
            $table->unsignedBigInteger('user_id')->nullable()->change();
            
            // Add new fields
            $table->string('email')->unique()->after('id');
            $table->string('first_name')->after('email');
            $table->string('last_name')->after('first_name');
            
            // Re-add foreign key with SET NULL
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null')
                  ->onUpdate('cascade');
                  
            // Add unique constraint for user_id when not null
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
            $table->dropColumn(['email', 'first_name', 'last_name']);
            
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
            $table->unique('user_id');
        });
    }
};
```

## Controllers

### 1. app/Http/Controllers/TeacherController.php

**Required Changes**:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Teacher::with(['user.roles'])
                       ->when($request->boolean('without_user'), function ($q) {
                           return $q->withoutUser();
                       })
                       ->when($request->input('search'), function ($q, $search) {
                           return $q->where(function ($subQuery) use ($search) {
                               $subQuery->where('first_name', 'like', "%{$search}%")
                                       ->orWhere('last_name', 'like', "%{$search}%")
                                       ->orWhere('email', 'like', "%{$search}%")
                                       ->orWhere('employee_id', 'like', "%{$search}%");
                           });
                       });

        $teachers = $query->paginate($request->input('per_page', 15));

        return response()->json($teachers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $teacher = Teacher::create($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Teacher created successfully',
                'data' => $teacher->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json([
            'data' => $teacher->load(['user.roles'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherRequest $request, Teacher $teacher): JsonResponse
    {
        try {
            DB::beginTransaction();

            $teacher->update($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Teacher updated successfully',
                'data' => $teacher->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher): JsonResponse
    {
        try {
            DB::beginTransaction();

            $teacher->delete();

            DB::commit();

            return response()->json([
                'message' => 'Teacher deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to delete teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create user account for existing teacher.
     */
    public function createUserAccount(Request $request, Teacher $teacher): JsonResponse
    {
        if ($teacher->hasUserAccount()) {
            return response()->json([
                'message' => 'Teacher already has a user account'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->input('name'),
                'email' => $teacher->email,
                'password' => Hash::make($request->input('password')),
            ]);

            // Assign roles if provided
            if ($request->has('roles')) {
                $user->assignRole($request->input('roles'));
            }

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            DB::commit();

            return response()->json([
                'message' => 'User account created successfully',
                'data' => $teacher->load('user.roles')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Link existing user to teacher.
     */
    public function linkUserAccount(Request $request, Teacher $teacher): JsonResponse
    {
        if ($teacher->hasUserAccount()) {
            return response()->json([
                'message' => 'Teacher already has a user account'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id|unique:teachers,user_id',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($request->input('user_id'));

            // Link user to teacher
            $teacher->user_id = $user->id;
            $teacher->save();

            // Assign roles if provided
            if ($request->has('roles')) {
                $user->assignRole($request->input('roles'));
            }

            DB::commit();

            return response()->json([
                'message' => 'User account linked successfully',
                'data' => $teacher->load('user.roles')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to link user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unlink user account from teacher.
     */
    public function unlinkUserAccount(Teacher $teacher): JsonResponse
    {
        if (!$teacher->hasUserAccount()) {
            return response()->json([
                'message' => 'Teacher does not have a user account'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $teacher->user_id = null;
            $teacher->save();

            DB::commit();

            return response()->json([
                'message' => 'User account unlinked successfully',
                'data' => $teacher
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to unlink user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

## Requests/Validation

### 1. app/Http/Requests/StoreTeacherRequest.php

```php
<?php

namespace App\Http\Requests;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create teachers');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return Teacher::getValidationRules();
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'employee_id.unique' => 'This employee ID is already registered.',
            'employment_type.enum' => 'Please select a valid employment type.',
        ];
    }
}
```

### 2. app/Http/Requests/UpdateTeacherRequest.php

```php
<?php

namespace App\Http\Requests;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update teachers');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $teacher = $this->route('teacher');

        return Teacher::getValidationRules([
            'email' => [
                'required',
                'email',
                Rule::unique('teachers', 'email')->ignore($teacher->id),
                'max:255'
            ],
            'employee_id' => [
                'required',
                'string',
                'max:50',
                Rule::unique('teachers', 'employee_id')->ignore($teacher->id)
            ],
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('teachers', 'user_id')->ignore($teacher->id)
            ]
        ]);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'employee_id.unique' => 'This employee ID is already registered.',
            'employment_type.enum' => 'Please select a valid employment type.',
        ];
    }
}
```

## Resources

### 1. app/Http/Resources/TeacherResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'rank' => $this->rank,
            'employment_type' => $this->employment_type,
            'employment_type_label' => $this->employment_type?->getLabel(),
            'date_hired' => $this->date_hired,
            'phone' => $this->phone,
            'address' => $this->address,
            'is_active' => $this->is_active,
            'has_user_account' => $this->hasUserAccount(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => $this->when($this->user_id, function () {
                return new UserResource($this->user);
            }),
            
            'assignments_count' => $this->whenCounted('assignments'),
            'active_assignments_count' => $this->whenCounted('activeAssignments'),
        ];
    }
}
```

## Routes

### 1. routes/api.php (Teacher Routes Update)

```php
// Add these routes to existing teacher routes
Route::prefix('teachers/{teacher}')->group(function () {
    Route::post('create-user-account', [TeacherController::class, 'createUserAccount']);
    Route::post('link-user-account', [TeacherController::class, 'linkUserAccount']);
    Route::delete('unlink-user-account', [TeacherController::class, 'unlinkUserAccount']);
});
```

## Testing

### 1. tests/Unit/Model/TeacherTest.php

```php
<?php

namespace Tests\Unit\Model;

use App\Models\Teacher;
use App\Models\User;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    /** @test */
    public function it_can_create_teacher_without_user_account()
    {
        $teacher = Teacher::factory()->create([
            'user_id' => null,
            'email' => 'teacher@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertNull($teacher->user_id);
        $this->assertFalse($teacher->hasUserAccount());
        $this->assertEquals('John Doe', $teacher->full_name);
    }

    /** @test */
    public function it_can_link_user_account()
    {
        $teacher = Teacher::factory()->create(['user_id' => null]);
        $user = User::factory()->create();

        $result = $user->linkToTeacher($teacher);

        $this->assertTrue($result);
        $this->assertEquals($user->id, $teacher->fresh()->user_id);
        $this->assertTrue($teacher->fresh()->hasUserAccount());
    }

    /** @test */
    public function it_prevents_linking_multiple_users_to_same_teacher()
    {
        $teacher = Teacher::factory()->create(['user_id' => null]);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $user1->linkToTeacher($teacher);
        $result = $user2->linkToTeacher($teacher);

        $this->assertFalse($result);
    }

    /** @test */
    public function scope_without_user_returns_teachers_without_accounts()
    {
        Teacher::factory()->create(['user_id' => null]);
        Teacher::factory()->create(['user_id' => User::factory()->create()->id]);

        $teachersWithoutUser = Teacher::withoutUser()->get();

        $this->assertCount(1, $teachersWithoutUser);
        $this->assertNull($teachersWithoutUser->first()->user_id);
    }
}
```

## Code Quality Standards Applied

1. **Type Safety**: All methods have proper return types
2. **Validation**: Comprehensive validation rules with custom messages
3. **Error Handling**: Proper try-catch blocks with database transactions
4. **Documentation**: All methods have proper PHPDoc comments
5. **Single Responsibility**: Each method has a single, clear purpose
6. **Security**: Proper authorization checks and input validation
7. **Performance**: Eager loading relationships where appropriate
8. **Testing**: Unit tests covering key functionality
9. **Consistency**: Following Laravel conventions and naming patterns
10. **Maintainability**: Clean, readable code with proper separation of concerns
