# Teacher Schedule Generation Integration Plan

## Overview

This plan details the integration of automatic teacher schedule generation from approved draft schedules. When a draft schedule is approved, the system will generate individual teacher schedule records for each class session throughout the entire semester based on the time slot patterns defined in the original schedule.

## Business Requirements

1. **Automatic Schedule Generation**: When a `DraftSchedule` is approved, automatically generate `TeacherSchedule` records for the entire semester
2. **Time Slot Pattern Expansion**: If a schedule has 3 days per week, generate 3 sessions per week for the entire semester duration
3. **Date-Based Scheduling**: Generate specific dates for each class session based on semester start/end dates and day patterns
4. **Holiday Handling**: Skip dates that fall on holidays or special events
5. **Schedule Tracking**: Maintain link between generated schedules and the original draft approval

## Current System Analysis

### Schedule Model Structure
- Uses `time_slots` JSON field to store day/time patterns
- Example format: `[{"day": "monday", "start_time": "07:00", "end_time": "09:00"}, {"day": "wednesday", "start_time": "07:00", "end_time": "09:00"}]`
- Contains `subject_id`, `semester_id`, `room`, `section` information

### DraftSchedule Model Structure
- Links `teacher_id` to `schedule_id`
- Has approval workflow with status tracking
- Contains `teacher_assignment_id` when approved

### Semester Model Structure
- Defines `start_date` and `end_date` for the semester
- Used to calculate the date range for schedule generation

## New Entity: TeacherSchedule

### Purpose
Stores individual class session dates for teachers throughout the semester, generated from approved draft schedules.

### Table Schema: teacher_schedules

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_assignment_id | bigint unsigned | NO | - | Foreign key to teacher_assignments |
| draft_schedule_id | bigint unsigned | NO | - | Foreign key to original draft schedule |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects (denormalized for queries) |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers (denormalized) |
| scheduled_date | date | NO | - | Specific date of this class session |
| day_of_week | enum | NO | - | Day of the week (monday, tuesday, etc.) |
| start_time | time | NO | - | Start time of the class session |
| end_time | time | NO | - | End time of the class session |
| room | varchar(50) | YES | NULL | Room assignment |
| section | varchar(20) | YES | NULL | Section identifier |
| status | enum | NO | 'scheduled' | Session status (scheduled, cancelled, completed) |
| attendance_record_id | bigint unsigned | YES | NULL | Link to attendance record |
| notes | text | YES | NULL | Session-specific notes |
| is_holiday | boolean | NO | false | Whether this session falls on a holiday |
| holiday_name | varchar(100) | YES | NULL | Name of the holiday if applicable |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

### JSON Structure

```json
{
  "table": "teacher_schedules",
  "engine": "InnoDB",
  "charset": "utf8mb4",
  "collation": "utf8mb4_unicode_ci",
  "columns": {
    "id": {
      "type": "bigint unsigned",
      "nullable": false,
      "auto_increment": true,
      "description": "Primary key"
    },
    "teacher_assignment_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to teacher_assignments"
    },
    "draft_schedule_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to original draft schedule"
    },
    "subject_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to subjects (denormalized)"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "teacher_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to teachers (denormalized)"
    },
    "scheduled_date": {
      "type": "date",
      "nullable": false,
      "description": "Specific date of this class session"
    },
    "day_of_week": {
      "type": "enum",
      "nullable": false,
      "values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "description": "Day of the week"
    },
    "start_time": {
      "type": "time",
      "nullable": false,
      "description": "Start time of the class session"
    },
    "end_time": {
      "type": "time",
      "nullable": false,
      "description": "End time of the class session"
    },
    "room": {
      "type": "varchar(50)",
      "nullable": true,
      "description": "Room assignment"
    },
    "section": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Section identifier"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "scheduled",
      "values": ["scheduled", "cancelled", "completed", "postponed"],
      "description": "Session status"
    },
    "attendance_record_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Link to attendance record"
    },
    "notes": {
      "type": "text",
      "nullable": true,
      "description": "Session-specific notes"
    },
    "is_holiday": {
      "type": "boolean",
      "nullable": false,
      "default": false,
      "description": "Whether this session falls on a holiday"
    },
    "holiday_name": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Name of the holiday if applicable"
    },
    "created_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "Record creation timestamp"
    },
    "updated_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "Record update timestamp"
    }
  },
  "indexes": {
    "primary": ["id"],
    "teacher_schedules_teacher_assignment_id_foreign": ["teacher_assignment_id"],
    "teacher_schedules_draft_schedule_id_foreign": ["draft_schedule_id"],
    "teacher_schedules_subject_id_foreign": ["subject_id"],
    "teacher_schedules_semester_id_foreign": ["semester_id"],
    "teacher_schedules_teacher_id_foreign": ["teacher_id"],
    "teacher_schedules_scheduled_date_index": ["scheduled_date"],
    "teacher_schedules_teacher_semester_date_index": ["teacher_id", "semester_id", "scheduled_date"],
    "teacher_schedules_status_index": ["status"],
    "teacher_schedules_attendance_record_id_foreign": ["attendance_record_id"]
  },
  "foreign_keys": {
    "teacher_schedules_teacher_assignment_id_foreign": {
      "column": "teacher_assignment_id",
      "references": "teacher_assignments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_schedules_draft_schedule_id_foreign": {
      "column": "draft_schedule_id",
      "references": "draft_schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_schedules_subject_id_foreign": {
      "column": "subject_id",
      "references": "subjects.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "teacher_schedules_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_schedules_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_schedules_attendance_record_id_foreign": {
      "column": "attendance_record_id",
      "references": "attendance_records.id",
      "on_delete": "SET NULL",
      "on_update": "CASCADE"
    }
  }
}
```

## New Enum: TeacherScheduleStatus

### File: `app/Enums/TeacherScheduleStatus.php`

```php
<?php

namespace App\Enums;

enum TeacherScheduleStatus: string
{
    case SCHEDULED = 'scheduled';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';
    case POSTPONED = 'postponed';

    public function getLabel(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Scheduled',
            self::CANCELLED => 'Cancelled',
            self::COMPLETED => 'Completed',
            self::POSTPONED => 'Postponed',
        };
    }

    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }
}
```

## TeacherSchedule Model

### File: `app/Models/TeacherSchedule.php`

```php
<?php

namespace App\Models;

use App\Enums\TeacherScheduleStatus;
use Illuminate\Database\Eloquent\Attributes\Cast;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'teacher_assignment_id',
    'draft_schedule_id',
    'subject_id',
    'semester_id',
    'teacher_id',
    'scheduled_date',
    'day_of_week',
    'start_time',
    'end_time',
    'room',
    'section',
    'status',
    'attendance_record_id',
    'notes',
    'is_holiday',
    'holiday_name'
])]
class TeacherSchedule extends Model
{
    use HasFactory, SoftDeletes;

    #[Cast(type: TeacherScheduleStatus::class)]
    protected TeacherScheduleStatus|string $status;

    /**
     * Get the teacher assignment for this schedule.
     */
    public function teacherAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherAssignment::class);
    }

    /**
     * Get the original draft schedule.
     */
    public function draftSchedule(): BelongsTo
    {
        return $this->belongsTo(DraftSchedule::class);
    }

    /**
     * Get the subject for this schedule.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the semester for this schedule.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the teacher for this schedule.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the attendance record for this schedule.
     */
    public function attendanceRecord(): BelongsTo
    {
        return $this->belongsTo(AttendanceRecord::class);
    }

    /**
     * Scope a query to only include scheduled sessions.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', TeacherScheduleStatus::SCHEDULED->value);
    }

    /**
     * Scope a query to only include cancelled sessions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', TeacherScheduleStatus::CANCELLED->value);
    }

    /**
     * Scope a query to only include completed sessions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', TeacherScheduleStatus::COMPLETED->value);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by teacher and semester.
     */
    public function scopeForTeacherSemester($query, $teacherId, $semesterId)
    {
        return $query->where('teacher_id', $teacherId)
                    ->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to exclude holidays.
     */
    public function scopeNotHoliday($query)
    {
        return $query->where('is_holiday', false);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'status' => TeacherScheduleStatus::class,
            'scheduled_date' => 'date',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'is_holiday' => 'boolean',
        ];
    }

    /**
     * Get formatted date and time for display.
     */
    public function getFormattedDateTimeAttribute(): string
    {
        return $this->scheduled_date->format('M d, Y') . ' ' . 
               $this->start_time->format('g:i A') . ' - ' . 
               $this->end_time->format('g:i A');
    }

    /**
     * Check if the session is today.
     */
    public function isToday(): bool
    {
        return $this->scheduled_date->isToday();
    }

    /**
     * Check if the session is in the past.
     */
    public function isPast(): bool
    {
        return $this->scheduled_date->isPast() && 
               $this->start_time->isPast();
    }

    /**
     * Check if the session can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === TeacherScheduleStatus::SCHEDULED && 
               !$this->isPast();
    }
}
```

## Schedule Generation Service

### File: `app/Services/TeacherScheduleGenerationService.php`

```php
<?php

namespace App\Services;

use App\Models\DraftSchedule;
use App\Models\Semester;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Enums\DayOfWeek;
use App\Enums\TeacherScheduleStatus;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class TeacherScheduleGenerationService
{
    /**
     * Generate teacher schedules for an approved draft schedule.
     */
    public function generateFromDraft(DraftSchedule $draftSchedule): Collection
    {
        if (!$draftSchedule->isApproved()) {
            throw new \InvalidArgumentException('Draft schedule must be approved');
        }

        $schedule = $draftSchedule->schedule;
        $semester = $schedule->semester;
        $teacherAssignment = $draftSchedule->teacherAssignment;

        $schedules = collect();

        foreach ($schedule->time_slots as $timeSlot) {
            $dayOfWeek = DayOfWeek::from($timeSlot['day']);
            $sessionSchedules = $this->generateSessionsForDay(
                $teacherAssignment,
                $draftSchedule,
                $semester,
                $dayOfWeek,
                $timeSlot['start_time'],
                $timeSlot['end_time'],
                $schedule->room,
                $schedule->section
            );

            $schedules = $schedules->merge($sessionSchedules);
        }

        return $schedules;
    }

    /**
     * Generate session schedules for a specific day of the week.
     */
    private function generateSessionsForDay(
        TeacherAssignment $teacherAssignment,
        DraftSchedule $draftSchedule,
        Semester $semester,
        DayOfWeek $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room,
        ?string $section
    ): Collection {
        $schedules = collect();

        $period = CarbonPeriod::create($semester->start_date, $semester->end_date);

        foreach ($period as $date) {
            if ($this->matchesDayOfWeek($date, $dayOfWeek)) {
                $teacherSchedule = $this->createTeacherSchedule(
                    $teacherAssignment,
                    $draftSchedule,
                    $semester,
                    $date,
                    $dayOfWeek,
                    $startTime,
                    $endTime,
                    $room,
                    $section
                );

                $schedules->push($teacherSchedule);
            }
        }

        return $schedules;
    }

    /**
     * Check if a date matches the given day of week.
     */
    private function matchesDayOfWeek(Carbon $date, DayOfWeek $dayOfWeek): bool
    {
        return match ($dayOfWeek) {
            DayOfWeek::MONDAY => $date->isMonday(),
            DayOfWeek::TUESDAY => $date->isTuesday(),
            DayOfWeek::WEDNESDAY => $date->isWednesday(),
            DayOfWeek::THURSDAY => $date->isThursday(),
            DayOfWeek::FRIDAY => $date->isFriday(),
            DayOfWeek::SATURDAY => $date->isSaturday(),
        };
    }

    /**
     * Create a teacher schedule record.
     */
    private function createTeacherSchedule(
        TeacherAssignment $teacherAssignment,
        DraftSchedule $draftSchedule,
        Semester $semester,
        Carbon $date,
        DayOfWeek $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room,
        ?string $section
    ): TeacherSchedule {
        // Check if date is a holiday (this could be enhanced with a holidays table)
        $isHoliday = $this->isHoliday($date);
        $holidayName = $isHoliday ? $this->getHolidayName($date) : null;

        return TeacherSchedule::create([
            'teacher_assignment_id' => $teacherAssignment->id,
            'draft_schedule_id' => $draftSchedule->id,
            'subject_id' => $teacherAssignment->schedule->subject_id,
            'semester_id' => $semester->id,
            'teacher_id' => $teacherAssignment->teacher_id,
            'scheduled_date' => $date,
            'day_of_week' => $dayOfWeek->value,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'room' => $room,
            'section' => $section,
            'status' => $isHoliday ? TeacherScheduleStatus::CANCELLED->value : TeacherScheduleStatus::SCHEDULED->value,
            'is_holiday' => $isHoliday,
            'holiday_name' => $holidayName,
        ]);
    }

    /**
     * Check if a date is a holiday.
     * This is a basic implementation - could be enhanced with a holidays table.
     */
    private function isHoliday(Carbon $date): bool
    {
        // Basic holiday checks - this should be enhanced with a proper holidays table
        $holidays = [
            // Fixed dates
            '01-01', // New Year's Day
            '04-09', // Day of Valor
            '05-01', // Labor Day
            '06-12', // Independence Day
            '12-25', // Christmas Day
            '12-30', // Rizal Day
        ];

        $monthDay = $date->format('m-d');
        return in_array($monthDay, $holidays);
    }

    /**
     * Get holiday name for a date.
     */
    private function getHolidayName(Carbon $date): ?string
    {
        $holidayNames = [
            '01-01' => 'New Year\'s Day',
            '04-09' => 'Day of Valor',
            '05-01' => 'Labor Day',
            '06-12' => 'Independence Day',
            '12-25' => 'Christmas Day',
            '12-30' => 'Rizal Day',
        ];

        $monthDay = $date->format('m-d');
        return $holidayNames[$monthDay] ?? null;
    }

    /**
     * Regenerate schedules for a draft (useful for modifications).
     */
    public function regenerateFromDraft(DraftSchedule $draftSchedule): Collection
    {
        // Delete existing schedules
        TeacherSchedule::where('draft_schedule_id', $draftSchedule->id)->delete();

        // Generate new schedules
        return $this->generateFromDraft($draftSchedule);
    }
}
```

## Integration Points

### 1. DraftSchedule Approval Hook

Update the DraftSchedule model or create an observer to automatically generate schedules when a draft is approved:

```php
// In DraftScheduleObserver or in the approval method
public function approved(DraftSchedule $draftSchedule)
{
    $service = app(TeacherScheduleGenerationService::class);
    $service->generateFromDraft($draftSchedule);
}
```

### 2. TeacherAssignment Controller

Add methods to view generated schedules:

```php
// TeacherAssignmentController.php
public function showSchedules(TeacherAssignment $teacherAssignment)
{
    $schedules = TeacherSchedule::where('teacher_assignment_id', $teacherAssignment->id)
                                ->orderBy('scheduled_date')
                                ->paginate(50);
    
    return Inertia::render('TeacherAssignments/Schedules', [
        'teacherAssignment' => $teacherAssignment->load(['teacher.user', 'schedule.subject']),
        'schedules' => $schedules,
    ]);
}
```

### 3. Attendance Integration

Update attendance creation to link with teacher schedules:

```php
// When creating attendance records, link to the specific teacher schedule
$teacherSchedule = TeacherSchedule::where('teacher_assignment_id', $assignment->id)
                                 ->where('scheduled_date', $date)
                                 ->first();

AttendanceRecord::create([
    'teacher_assignment_id' => $assignment->id,
    'teacher_schedule_id' => $teacherSchedule?->id,
    'date' => $date,
    'status' => AttendanceStatus::PENDING,
]);
```

## API Endpoints

### Teacher Schedule Management

1. **GET /api/teacher-schedules** - List teacher schedules with filters
2. **GET /api/teacher-schedules/{id}** - Get specific teacher schedule
3. **PUT /api/teacher-schedules/{id}/cancel** - Cancel a specific session
4. **POST /api/teacher-schedules/regenerate/{draftId}** - Regenerate schedules from draft

### Example Filters

```php
// Filter by teacher and semester
/api/teacher-schedules?teacher_id=1&semester_id=2

// Filter by date range
/api/teacher-schedules?start_date=2024-01-01&end_date=2024-01-31

// Filter by status
/api/teacher-schedules?status=scheduled

// Exclude holidays
/api/teacher-schedules?exclude_holidays=true
```

## Frontend Components

### Teacher Schedule Calendar

Create a React component to display teacher schedules in a calendar format:

```typescript
// components/TeacherScheduleCalendar.tsx
interface TeacherScheduleCalendarProps {
    teacherId: number;
    semesterId: number;
}

// Display monthly/weekly view of teacher schedules
// Show different colors for different statuses
// Handle session cancellation/rescheduling
```

### Schedule List View

Create a table view of all scheduled sessions:

```typescript
// components/TeacherScheduleList.tsx
interface TeacherScheduleListProps {
    teacherAssignmentId: number;
}

// List all sessions with date, time, room, status
// Allow bulk actions (cancel multiple sessions)
// Show holiday indicators
```

## Testing Strategy

### Unit Tests

1. **Schedule Generation Service**
   - Test correct date calculation for different day patterns
   - Test holiday detection and handling
   - Test semester boundary handling

2. **TeacherSchedule Model**
   - Test relationships and scopes
   - Test status transitions
   - Test date formatting methods

### Feature Tests

1. **Draft Approval Flow**
   - Test automatic schedule generation on approval
   - Test schedule regeneration on draft modification

2. **Schedule Management**
   - Test session cancellation
   - Test attendance integration
   - Test holiday handling

## Performance Considerations

1. **Batch Processing**: Generate schedules in batches to avoid memory issues with long semesters
2. **Indexing**: Ensure proper database indexes on frequently queried columns
3. **Caching**: Cache schedule queries for dashboard views
4. **Queue Processing**: For bulk schedule generation, use Laravel queues

## Migration Strategy

1. **Phase 1**: Create the teacher_schedules table and related models
2. **Phase 2**: Implement the schedule generation service
3. **Phase 3**: Add approval hook integration
4. **Phase 4**: Update frontend components
5. **Phase 5**: Add reporting and analytics

## Benefits

1. **Automated Schedule Management**: No manual date entry required
2. **Accurate Session Tracking**: Each class session is individually tracked
3. **Holiday Handling**: Automatic cancellation of holiday sessions
4. **Attendance Integration**: Direct link between scheduled sessions and attendance
5. **Reporting**: Detailed analytics on teacher schedules and attendance patterns

## Future Enhancements

1. **Holiday Management Table**: Replace hardcoded holiday logic with a database table
2. **Room Conflict Detection**: Check for room conflicts when generating schedules
3. **Schedule Templates**: Create reusable schedule patterns
4. **Bulk Operations**: Allow bulk rescheduling or cancellation
5. **Calendar Integration**: Export schedules to external calendar systems
