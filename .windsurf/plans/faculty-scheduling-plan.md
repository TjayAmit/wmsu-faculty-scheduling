# College of Education Faculty Scheduling System - Data Engineering Plan

## Project Overview

- **Purpose**: A comprehensive faculty scheduling and monitoring system for the College of Education to manage instructor subject assignments, schedule conflicts, and daily attendance tracking.
- **Business Goal**: Streamline faculty operations by automating teacher registration, subject management, schedule assignment, conflict detection, and attendance monitoring to ensure efficient resource utilization and accountability.
- **Target Users**: 
  - Faculty Staff (administrators who register teachers and subjects)
  - Teachers (instructors assigned to subjects and schedules)
  - Faculty Dean (higher-level role for monitoring and oversight)
- **Success Criteria**:
  - Zero schedule conflicts for teachers
  - Accurate unit load monitoring per teacher per semester
  - Complete attendance records with timestamps
  - Role-based access control for different user levels
  - Real-time conflict detection during schedule assignment

## Functional Requirements

1. **Teacher Registration**
   - Faculty staff can register new teachers into the system
   - Each teacher has personal information and employment details
   - Teachers can be assigned roles (instructor, faculty staff, dean)

2. **Subject Management**
   - Faculty staff can register subjects offered by the College
   - Each subject has unit information (credit units)
   - Subject catalog with subject codes and descriptions
   - Track which subjects are active per semester

3. **Schedule Management**
   - Define time slots (e.g., 7:00 AM - 9:00 AM, 9:00 AM - 11:00 AM)
   - Define days of the week (Monday to Friday)
   - Define semesters and academic years
   - Assign subjects to specific time slots and days

4. **Teacher Assignment**
   - Assign subject schedules to teachers
   - System must prevent schedule conflicts (same teacher cannot have overlapping schedules)
   - Track teacher's total unit load per semester
   - Enforce maximum unit load limits per teacher

5. **Attendance Tracking**
   - Generate daily attendance records based on teacher schedules
   - Record attendance status (present/absent) with timestamp
   - Track attendance for each scheduled class session
   - Provide attendance reports and analytics

6. **Role-Based Access Control**
   - Faculty Staff: Can register teachers, subjects, manage schedules
   - Teachers: Can view their assigned schedules and attendance
   - Faculty Dean: Can monitor all schedules, attendance, and teacher loads
   - Hierarchical permission system

7. **Reporting and Monitoring**
   - View teacher schedules by semester
   - View attendance records by teacher, subject, or date range
   - Monitor teacher unit loads
   - Generate conflict reports
   - Dean-level oversight dashboards

## Data Entities Identified

- **Users**: Extended Laravel users table with Spatie role-based access for teachers, faculty staff, and dean
- **Teachers**: Profile information for instructors (extends users)
- **Subjects**: Course/subject catalog with unit information
- **Semesters**: Academic semester definitions (e.g., First Semester 2024-2025)
- **TimeSlots**: Time slot definitions (e.g., 7:00 AM - 9:00 AM)
- **Schedules**: Subject assigned to specific time slot, day, and semester
- **TeacherAssignments**: Teachers assigned to specific schedules
- **AttendanceRecords**: Daily attendance records for each teacher-schedule combination
- **Roles**: User roles for access control via Spatie (instructor, faculty_staff, dean) - PARTIALLY COMPLETE
- **Permissions**: Granular permissions via Spatie for fine-grained access control

## Enum Classes

All enum types in the database schema are implemented as PHP 8.1+ backed enum classes in `app/Enums/` for type safety and maintainability.

### EmploymentType Enum

**File**: `app/Enums/EmploymentType.php`

**Values**:
- `FULL_TIME` = 'full_time' - Full-time employment
- `PART_TIME` = 'part_time' - Part-time employment
- `CASUAL` = 'casual' - Casual employment

**Used in**: `teachers.employment_type`

**Methods**:
- `getLabel()`: Returns human-readable label
- `values()`: Returns array of all enum values

### SemesterType Enum

**File**: `app/Enums/SemesterType.php`

**Values**:
- `FIRST` = 'first' - First semester
- `SECOND` = 'second' - Second semester
- `SUMMER` = 'summer' - Summer semester

**Used in**: `semesters.semester_type`

**Methods**:
- `getLabel()`: Returns human-readable label
- `values()`: Returns array of all enum values

### DayOfWeek Enum

**File**: `app/Enums/DayOfWeek.php`

**Values**:
- `MONDAY` = 'monday'
- `TUESDAY` = 'tuesday'
- `WEDNESDAY` = 'wednesday'
- `THURSDAY` = 'thursday'
- `FRIDAY` = 'friday'
- `SATURDAY` = 'saturday'

**Used in**: `schedules.day_of_week`

**Methods**:
- `getLabel()`: Returns human-readable label
- `values()`: Returns array of all enum values

### AttendanceStatus Enum

**File**: `app/Enums/AttendanceStatus.php`

**Values**:
- `PRESENT` = 'present' - Teacher attended class
- `ABSENT` = 'absent' - Teacher did not attend class
- `PENDING` = 'pending' - Attendance not yet recorded
- `EXCUSED` = 'excused' - Teacher excused from class

**Used in**: `attendance_records.status`

**Methods**:
- `getLabel()`: Returns human-readable label
- `values()`: Returns array of all enum values

**Usage in Migrations**:
```php
use App\Enums\EmploymentType;

$table->enum('employment_type', EmploymentType::values())->default(EmploymentType::FULL_TIME->value);
```

**Benefits**:
- Type safety: Prevents invalid values at compile time
- Single source of truth: Enum values defined in one place
- IDE support: Autocomplete and refactoring support
- Maintainability: Easy to add/remove enum values

## Relationships

- **Users** → **Teachers**: One-to-One (users can be teachers)
- **Teachers** → **TeacherAssignments**: One-to-Many (one teacher has many assignments)
- **Subjects** → **Schedules**: One-to-Many (one subject can have multiple schedule instances)
- **Semesters** → **Schedules**: One-to-Many (one semester has many schedules)
- **TimeSlots** → **Schedules**: One-to-Many (one time slot can be used by multiple schedules)
- **Schedules** → **TeacherAssignments**: One-to-One (one schedule assigned to one teacher)
- **TeacherAssignments** → **AttendanceRecords**: One-to-Many (one assignment has many attendance records)
- **Users** → **Roles**: Many-to-Many (users can have multiple roles)

## Existing Laravel Schema

### Standard Laravel Tables

- **users**: User authentication and management (will be extended with Spatie's HasRoles trait)
- **cache**: Application caching
- **sessions**: User session management
- **jobs**: Queue job management
- **failed_jobs**: Failed job tracking
- **migrations**: Database migration tracking
- **password_reset_tokens**: Password reset functionality

### Spatie Laravel Permission Tables (INSTALLED)

- **permissions**: Permission definitions for role-based access control
- **roles**: Role definitions for user access levels
- **model_has_permissions**: Pivot table linking models to permissions
- **model_has_roles**: Pivot table linking models (users) to roles
- **role_has_permissions**: Pivot table linking roles to permissions

### permissions Table JSON Structure (Spatie - COMPLETE)

```json
{
  "table": "permissions",
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
    "name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Permission name (e.g., create_schedules)"
    },
    "guard_name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Guard name (typically 'web')"
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
    "permissions_name_guard_name_unique": ["name", "guard_name"]
  },
  "foreign_keys": {}
}
```

### roles Table JSON Structure (Spatie - PARTIALLY COMPLETE)

**Status**: Table exists via Spatie but lacks custom columns (display_name, description, is_active)

```json
{
  "table": "roles",
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
    "name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Role name (e.g., instructor, faculty_staff, dean)"
    },
    "guard_name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Guard name (typically 'web')"
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
    "roles_name_guard_name_unique": ["name", "guard_name"]
  },
  "foreign_keys": {}
}
```

**Missing Columns Needed**:
- `display_name` varchar(100) - Human-readable role name
- `description` text - Role description
- `is_active` boolean - Whether role is active

### model_has_roles Table JSON Structure (Spatie - COMPLETE)

```json
{
  "table": "model_has_roles",
  "engine": "InnoDB",
  "charset": "utf8mb4",
  "collation": "utf8mb4_unicode_ci",
  "columns": {
    "role_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to roles"
    },
    "model_type": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Model class name (e.g., App\\Models\\User)"
    },
    "model_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Model ID (e.g., user ID)"
    }
  },
  "indexes": {
    "primary": ["role_id", "model_id", "model_type"],
    "model_has_roles_model_id_model_type_index": ["model_id", "model_type"]
  },
  "foreign_keys": {
    "model_has_roles_role_id_foreign": {
      "column": "role_id",
      "references": "roles.id",
      "on_delete": "CASCADE",
      "on_update": "NO ACTION"
    }
  }
}
```

### users Table JSON Structure (Laravel - COMPLETE)

```json
{
  "table": "users",
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
    "name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "User full name"
    },
    "email": {
      "type": "varchar(255)",
      "nullable": false,
      "unique": true,
      "description": "User email address"
    },
    "email_verified_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "Email verification timestamp"
    },
    "password": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Hashed password"
    },
    "two_factor_secret": {
      "type": "text",
      "nullable": true,
      "description": "Two-factor authentication secret"
    },
    "two_factor_recovery_codes": {
      "type": "text",
      "nullable": true,
      "description": "Two-factor recovery codes"
    },
    "two_factor_confirmed_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "Two-factor confirmation timestamp"
    },
    "remember_token": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Remember me token"
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
    "users_email_unique": ["email"]
  }
}
```

## Entity-Relationship Modeling

### Teachers

- **Purpose**: Store detailed profile information for instructors
- **Business Role**: Represents faculty members who teach subjects
- **Lifecycle**: Created when a teacher is registered, updated when information changes, soft deleted when teacher leaves
- **Cardinality**: 100-500 teachers (medium scale)
- **Access Patterns**: 
  - Read: Frequent (viewing teacher profiles, assignments)
  - Write: Low (registration, profile updates)

### Subjects

- **Purpose**: Catalog of all courses/subjects offered by the College
- **Business Role**: Represents academic courses with unit values
- **Lifecycle**: Created when new subject is added, updated when details change, never deleted (archived instead)
- **Cardinality**: 50-200 subjects
- **Access Patterns**:
  - Read: Very frequent (schedule creation, assignment)
  - Write: Low (new subjects, curriculum changes)

### Semesters

- **Purpose**: Define academic semesters for scheduling
- **Business Role**: Represents time periods for academic scheduling
- **Lifecycle**: Created for each semester, never deleted
- **Cardinality**: 2-4 active semesters, unlimited historical
- **Access Patterns**:
  - Read: Frequent (filtering schedules by semester)
  - Write: Low (new semester creation)

### TimeSlots

- **Purpose**: Define standard time blocks for classes
- **Business Role**: Represents available class time periods
- **Lifecycle**: Created once, rarely changed
- **Cardinality**: 10-20 time slots per day
- **Access Patterns**:
  - Read: Very frequent (schedule creation)
  - Write: Very low (initial setup only)

### Schedules

- **Purpose**: Assign subjects to specific time slots, days, and semesters
- **Business Role**: Represents actual class sessions
- **Lifecycle**: Created each semester, archived after semester ends
- **Cardinality**: 200-1000 per semester
- **Access Patterns**:
  - Read: Very frequent (viewing schedules, conflict detection)
  - Write: Medium (schedule creation, modifications)

### TeacherAssignments

- **Purpose**: Link teachers to specific schedules
- **Business Role**: Represents which teacher teaches which class
- **Lifecycle**: Created when teacher assigned, updated if reassigned, archived after semester
- **Cardinality**: 200-1000 per semester (1:1 with schedules)
- **Access Patterns**:
  - Read: Very frequent (viewing teacher schedules, load calculation)
  - Write: Medium (assignments, reassignments)

### AttendanceRecords

- **Purpose**: Track daily attendance for each teacher-schedule combination
- **Business Role**: Records whether teacher attended their scheduled class
- **Lifecycle**: Created daily for each active assignment, updated with attendance status
- **Cardinality**: 10,000-50,000 per semester (grows daily)
- **Access Patterns**:
  - Read: Frequent (attendance reports, monitoring)
  - Write: Very frequent (daily attendance recording)

### Roles (Spatie - Partially Complete)

- **Purpose**: Define user roles for access control via Spatie Laravel Permission
- **Business Role**: Controls what users can do in the system
- **Lifecycle**: Static, created during setup
- **Cardinality**: 3-5 roles
- **Access Patterns**:
  - Read: Very frequent (authorization checks via Spatie)
  - Write: Very low (role management)
- **Implementation**: Use Spatie's Role model with HasRoles trait on User model
- **Gap Analysis**: Missing display_name, description, is_active columns - may need migration to add

## Entity Relationships

### Users to Teachers

- **Relationship Type**: One-to-One
- **Foreign Key**: teachers.user_id → users.id
- **Cascade Rules**: ON DELETE CASCADE
- **Business Rule**: Not all users are teachers (some are faculty staff or deans), but all teachers are users
- **Query Pattern**: Join to get teacher profile when user logs in

### Teachers to TeacherAssignments

- **Relationship Type**: One-to-Many
- **Foreign Key**: teacher_assignments.teacher_id → teachers.id
- **Cascade Rules**: ON DELETE RESTRICT (prevent deletion if assignments exist)
- **Business Rule**: A teacher can have multiple assignments per semester
- **Query Pattern**: Get all assignments for a teacher to calculate unit load

### Subjects to Schedules

- **Relationship Type**: One-to-Many
- **Foreign Key**: schedules.subject_id → subjects.id
- **Cascade Rules**: ON DELETE RESTRICT (prevent deletion if schedules exist)
- **Business Rule**: A subject can be offered multiple times per semester (different sections)
- **Query Pattern**: Get all schedule instances for a subject

### Semesters to Schedules

- **Relationship Type**: One-to-Many
- **Foreign Key**: schedules.semester_id → semesters.id
- **Cascade Rules**: ON DELETE RESTRICT (prevent deletion if schedules exist)
- **Business Rule**: All schedules belong to a specific semester
- **Query Pattern**: Filter schedules by semester for current view

### TimeSlots to Schedules

- **Relationship Type**: One-to-Many
- **Foreign Key**: schedules.time_slot_id → time_slots.id
- **Cascade Rules**: ON DELETE RESTRICT (prevent deletion if schedules exist)
- **Business Rule**: Multiple schedules can use the same time slot
- **Query Pattern**: Conflict detection by checking overlapping time slots

### Schedules to TeacherAssignments

- **Relationship Type**: One-to-One
- **Foreign Key**: teacher_assignments.schedule_id → schedules.id
- **Cascade Rules**: ON DELETE CASCADE
- **Business Rule**: Each schedule is assigned to exactly one teacher
- **Query Pattern**: Get teacher for a specific schedule

### TeacherAssignments to AttendanceRecords

- **Relationship Type**: One-to-Many
- **Foreign Key**: attendance_records.teacher_assignment_id → teacher_assignments.id
- **Cascade Rules**: ON DELETE CASCADE
- **Business Rule**: Each assignment generates daily attendance records
- **Query Pattern**: Get attendance history for a specific assignment

### Users to Roles (Many-to-Many via Spatie)

- **Relationship Type**: Many-to-Many
- **Pivot Table**: model_has_roles (Spatie)
- **Foreign Keys**: 
  - model_has_roles.role_id → roles.id (ON DELETE CASCADE)
  - model_has_roles.model_id → users.id (via model_type='App\\Models\\User')
- **Business Rule**: Users can have multiple roles for flexibility via Spatie's HasRoles trait
- **Query Pattern**: Use Spatie's methods: $user->roles, $user->hasRole('dean'), $user->can('create_schedules')

## Table Schema Design

### teachers Table

#### Purpose
Store detailed profile information for instructors including employment details and contact information.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | NO | - | Foreign key to users table |
| employee_id | varchar(50) | NO | - | Unique employee identification number |
| department | varchar(255) | YES | NULL | Department within College of Education |
| rank | varchar(100) | YES | NULL | Academic rank (Instructor, Assistant Professor, etc.) |
| employment_type | enum | NO | 'full_time' | Employment type (full_time, part_time, casual) |
| date_hired | date | YES | NULL | Date when teacher was hired |
| phone | varchar(20) | YES | NULL | Contact phone number |
| address | text | YES | NULL | Residential address |
| is_active | boolean | NO | true | Whether teacher is currently active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "teachers",
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
    "user_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to users table"
    },
    "employee_id": {
      "type": "varchar(50)",
      "nullable": false,
      "description": "Unique employee identification number"
    },
    "department": {
      "type": "varchar(255)",
      "nullable": true,
      "description": "Department within College of Education"
    },
    "rank": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Academic rank (Instructor, Assistant Professor, etc.)"
    },
    "employment_type": {
      "type": "enum",
      "nullable": false,
      "default": "full_time",
      "values": ["full_time", "part_time", "casual"],
      "description": "Employment type"
    },
    "date_hired": {
      "type": "date",
      "nullable": true,
      "description": "Date when teacher was hired"
    },
    "phone": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Contact phone number"
    },
    "address": {
      "type": "text",
      "nullable": true,
      "description": "Residential address"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether teacher is currently active"
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
    "teachers_user_id_unique": ["user_id"],
    "teachers_employee_id_unique": ["employee_id"],
    "teachers_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "teachers_user_id_foreign": {
      "column": "user_id",
      "references": "users.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### Indexes
- **Primary**: id
- **Unique**: user_id, employee_id
- **Regular**: is_active (for filtering active teachers)

#### Foreign Keys
- teachers_user_id_foreign: user_id → users.id

#### Business Rules
- employee_id must be unique across all teachers
- A user can only have one teacher profile
- Soft delete through is_active flag instead of hard delete

#### Access Patterns
- **Read**: 
  - By user_id (when teacher logs in)
  - By is_active (for dropdown lists)
  - By department (for departmental reports)
- **Write**: 
  - Insert during teacher registration
  - Update for profile changes
  - Update is_active for deactivation

### subjects Table

#### Purpose
Catalog of all courses/subjects offered by the College of Education with unit information for load monitoring.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| code | varchar(20) | NO | - | Subject code (e.g., MATH101) |
| title | varchar(255) | NO | - | Subject title/description |
| units | decimal(3,1) | NO | 0.0 | Number of units (credit hours) |
| description | text | YES | NULL | Detailed subject description |
| is_active | boolean | NO | true | Whether subject is currently offered |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "subjects",
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
    "code": {
      "type": "varchar(20)",
      "nullable": false,
      "description": "Subject code (e.g., MATH101)"
    },
    "title": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Subject title/description"
    },
    "units": {
      "type": "decimal(3,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Number of units (credit hours)"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Detailed subject description"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether subject is currently offered"
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
    "subjects_code_unique": ["code"],
    "subjects_is_active_index": ["is_active"]
  },
  "foreign_keys": {}
}
```

#### Indexes
- **Primary**: id
- **Unique**: code
- **Regular**: is_active

#### Foreign Keys
- None

#### Business Rules
- Subject code must be unique
- Units must be positive (0.0 to 99.9)
- Subjects are soft-deleted via is_active flag

#### Access Patterns
- **Read**: 
  - By code (lookup)
  - By is_active (dropdown lists)
  - All subjects for catalog
- **Write**: 
  - Insert for new subjects
  - Update for curriculum changes

### semesters Table

#### Purpose
Define academic semesters for scheduling and tracking.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(100) | NO | - | Semester name (e.g., First Semester 2024-2025) |
| academic_year | varchar(20) | NO | - | Academic year (e.g., 2024-2025) |
| semester_type | enum | NO | 'first' | Semester type (first, second, summer) |
| start_date | date | NO | - | Semester start date |
| end_date | date | NO | - | Semester end date |
| is_current | boolean | NO | false | Whether this is the current semester |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "semesters",
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
    "name": {
      "type": "varchar(100)",
      "nullable": false,
      "description": "Semester name (e.g., First Semester 2024-2025)"
    },
    "academic_year": {
      "type": "varchar(20)",
      "nullable": false,
      "description": "Academic year (e.g., 2024-2025)"
    },
    "semester_type": {
      "type": "enum",
      "nullable": false,
      "default": "first",
      "values": ["first", "second", "summer"],
      "description": "Semester type"
    },
    "start_date": {
      "type": "date",
      "nullable": false,
      "description": "Semester start date"
    },
    "end_date": {
      "type": "date",
      "nullable": false,
      "description": "Semester end date"
    },
    "is_current": {
      "type": "boolean",
      "nullable": false,
      "default": false,
      "description": "Whether this is the current semester"
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
    "semesters_academic_year_semester_type_unique": ["academic_year", "semester_type"],
    "semesters_is_current_index": ["is_current"]
  },
  "foreign_keys": {}
}
```

#### Indexes
- **Primary**: id
- **Unique**: academic_year + semester_type
- **Regular**: is_current

#### Foreign Keys
- None

#### Business Rules
- Only one semester can be is_current = true at a time
- end_date must be after start_date
- Combination of academic_year and semester_type must be unique

#### Access Patterns
- **Read**: 
  - By is_current (default view)
  - By academic_year (historical data)
  - All semesters for selection
- **Write**: 
  - Insert for new semester
  - Update is_current flag when semester changes

### time_slots Table

#### Purpose
Define standard time blocks for class scheduling.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(50) | NO | - | Time slot name (e.g., 7:00 AM - 9:00 AM) |
| start_time | time | NO | - | Start time of the slot |
| end_time | time | NO | - | End time of the slot |
| is_active | boolean | NO | true | Whether time slot is available |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "time_slots",
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
    "name": {
      "type": "varchar(50)",
      "nullable": false,
      "description": "Time slot name (e.g., 7:00 AM - 9:00 AM)"
    },
    "start_time": {
      "type": "time",
      "nullable": false,
      "description": "Start time of the slot"
    },
    "end_time": {
      "type": "time",
      "nullable": false,
      "description": "End time of the slot"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether time slot is available"
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
    "time_slots_name_unique": ["name"],
    "time_slots_is_active_index": ["is_active"]
  },
  "foreign_keys": {}
}
```

#### Indexes
- **Primary**: id
- **Unique**: name
- **Regular**: is_active

#### Foreign Keys
- None

#### Business Rules
- end_time must be after start_time
- Time slots should not overlap (enforced at application level)
- Name should be descriptive (e.g., "7:00 AM - 9:00 AM")

#### Access Patterns
- **Read**: 
  - By is_active (dropdown lists)
  - All time slots for schedule creation
- **Write**: 
  - Insert during initial setup
  - Rare updates

### schedules Table

#### Purpose
Assign subjects to specific time slots, days, and semesters to create class sessions.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| time_slot_id | bigint unsigned | NO | - | Foreign key to time_slots |
| day_of_week | enum | NO | 'monday' | Day of the week |
| room | varchar(50) | YES | NULL | Room assignment |
| section | varchar(20) | YES | NULL | Section identifier (e.g., A, B, C) |
| is_active | boolean | NO | true | Whether schedule is active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "schedules",
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
    "subject_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to subjects"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "time_slot_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to time_slots"
    },
    "day_of_week": {
      "type": "enum",
      "nullable": false,
      "default": "monday",
      "values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "description": "Day of the week"
    },
    "room": {
      "type": "varchar(50)",
      "nullable": true,
      "description": "Room assignment"
    },
    "section": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Section identifier (e.g., A, B, C)"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether schedule is active"
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
    "schedules_subject_id_index": ["subject_id"],
    "schedules_semester_id_index": ["semester_id"],
    "schedules_time_slot_id_index": ["time_slot_id"],
    "schedules_semester_day_time_index": ["semester_id", "day_of_week", "time_slot_id"],
    "schedules_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "schedules_subject_id_foreign": {
      "column": "subject_id",
      "references": "subjects.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "schedules_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "schedules_time_slot_id_foreign": {
      "column": "time_slot_id",
      "references": "time_slots.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    }
  }
}
```

#### Indexes
- **Primary**: id
- **Regular**: subject_id, semester_id, time_slot_id, is_active
- **Composite**: semester_id + day_of_week + time_slot_id (for conflict detection)

#### Foreign Keys
- schedules_subject_id_foreign: subject_id → subjects.id
- schedules_semester_id_foreign: semester_id → semesters.id
- schedules_time_slot_id_foreign: time_slot_id → time_slots.id

#### Business Rules
- Same subject can have multiple schedules in same semester (different sections)
- Room conflicts should be checked at application level
- Combination of semester_id, day_of_week, and time_slot_id should be unique per room

#### Access Patterns
- **Read**: 
  - By semester_id (current semester view)
  - By subject_id (subject schedules)
  - By composite index (conflict detection)
- **Write**: 
  - Insert for new schedule
  - Update for schedule changes

### teacher_assignments Table

#### Purpose
Link teachers to specific schedules, enabling teacher workload tracking and schedule management.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| schedule_id | bigint unsigned | NO | - | Foreign key to schedules |
| assigned_at | timestamp | YES | NULL | When assignment was made |
| assigned_by | bigint unsigned | YES | NULL | User who made the assignment |
| is_active | boolean | NO | true | Whether assignment is active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "teacher_assignments",
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
    "teacher_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to teachers"
    },
    "schedule_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to schedules"
    },
    "assigned_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When assignment was made"
    },
    "assigned_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "User who made the assignment"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether assignment is active"
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
    "teacher_assignments_teacher_id_index": ["teacher_id"],
    "teacher_assignments_schedule_id_unique": ["schedule_id"],
    "teacher_assignments_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "teacher_assignments_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "teacher_assignments_schedule_id_foreign": {
      "column": "schedule_id",
      "references": "schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_assignments_assigned_by_foreign": {
      "column": "assigned_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### Indexes
- **Primary**: id
- **Regular**: teacher_id, is_active
- **Unique**: schedule_id (one teacher per schedule)

#### Foreign Keys
- teacher_assignments_teacher_id_foreign: teacher_id → teachers.id
- teacher_assignments_schedule_id_foreign: schedule_id → schedules.id
- teacher_assignments_assigned_by_foreign: assigned_by → users.id

#### Business Rules
- Each schedule can only be assigned to one teacher (enforced by unique index)
- Teacher cannot have overlapping schedules (enforced at application level)
- Audit trail via assigned_at and assigned_by

#### Access Patterns
- **Read**: 
  - By teacher_id (get teacher's assignments)
  - By schedule_id (get teacher for a schedule)
  - By is_active (current assignments)
- **Write**: 
  - Insert for new assignment
  - Update for reassignment

### attendance_records Table

#### Purpose
Track daily attendance for each teacher-schedule combination with timestamps for monitoring.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_assignment_id | bigint unsigned | NO | - | Foreign key to teacher_assignments |
| date | date | NO | - | Date of the class session |
| status | enum | NO | 'pending' | Attendance status (present, absent, pending, excused) |
| timestamp_in | timestamp | YES | NULL | Timestamp when teacher arrived |
| timestamp_out | timestamp | YES | NULL | Timestamp when teacher left |
| notes | text | YES | NULL | Additional notes or remarks |
| recorded_by | bigint unsigned | YES | NULL | User who recorded attendance |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "attendance_records",
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
    "date": {
      "type": "date",
      "nullable": false,
      "description": "Date of the class session"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["present", "absent", "pending", "excused"],
      "description": "Attendance status"
    },
    "timestamp_in": {
      "type": "timestamp",
      "nullable": true,
      "description": "Timestamp when teacher arrived"
    },
    "timestamp_out": {
      "type": "timestamp",
      "nullable": true,
      "description": "Timestamp when teacher left"
    },
    "notes": {
      "type": "text",
      "nullable": true,
      "description": "Additional notes or remarks"
    },
    "recorded_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "User who recorded attendance"
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
    "attendance_records_teacher_assignment_id_index": ["teacher_assignment_id"],
    "attendance_records_date_index": ["date"],
    "attendance_records_status_index": ["status"],
    "attendance_records_assignment_date_unique": ["teacher_assignment_id", "date"]
  },
  "foreign_keys": {
    "attendance_records_teacher_assignment_id_foreign": {
      "column": "teacher_assignment_id",
      "references": "teacher_assignments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "attendance_records_recorded_by_foreign": {
      "column": "recorded_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### Indexes
- **Primary**: id
- **Regular**: teacher_assignment_id, date, status
- **Unique**: teacher_assignment_id + date (one record per assignment per day)

#### Foreign Keys
- attendance_records_teacher_assignment_id_foreign: teacher_assignment_id → teacher_assignments.id
- attendance_records_recorded_by_foreign: recorded_by → users.id

#### Business Rules
- One attendance record per assignment per day (enforced by unique constraint)
- timestamp_in should be before timestamp_out
- Status can be updated from pending to present/absent/excused
- Audit trail via recorded_by

#### Access Patterns
- **Read**: 
  - By teacher_assignment_id (attendance history for a class)
  - By date (daily attendance report)
  - By status (filter present/absent)
- **Write**: 
  - Insert daily (automated or manual)
  - Update status and timestamps

### roles Table Extension (Spatie - PARTIALLY COMPLETE)

#### Purpose
Extend Spatie's roles table with custom columns for display names, descriptions, and active status.

#### Status
**PARTIALLY COMPLETE**: Table exists via Spatie Laravel Permission but requires migration to add custom columns.

#### Existing Spatie Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | - | Role name (e.g., instructor, faculty_staff, dean) |
| guard_name | varchar(255) | NO | - | Guard name (typically 'web') |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### Additional Columns Needed
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| display_name | varchar(100) | YES | NULL | Human-readable role name |
| description | text | YES | NULL | Role description |
| is_active | boolean | NO | true | Whether role is active |

#### Migration Required
A migration is needed to add the missing columns to the existing roles table:

```php
// database/migrations/YYYY_MM_DD_HHMMSS_add_custom_columns_to_roles_table.php
Schema::table('roles', function (Blueprint $table) {
    $table->string('display_name', 100)->nullable()->after('name');
    $table->text('description')->nullable()->after('display_name');
    $table->boolean('is_active')->default(true)->after('description');
    $table->index('is_active');
});
```

#### Business Rules
- Role name must be unique per guard (enforced by Spatie)
- Standard roles: instructor, faculty_staff, dean
- is_active flag for soft deactivation (instead of hard delete)

#### Access Patterns (via Spatie)
- **Read**: 
  - By name: `Role::findByName('instructor')`
  - By is_active: `Role::where('is_active', true)->get()`
  - User roles: `$user->roles`
- **Write**: 
  - Create: `Role::create(['name' => 'instructor', ...])`
  - Assign: `$user->assignRole('instructor')`
  - Remove: `$user->removeRole('instructor')`

## Data Integrity Rules

### Unique Constraints
- teachers.employee_id: Each teacher must have a unique employee ID
- teachers.user_id: Each user can only have one teacher profile
- subjects.code: Subject codes must be unique
- semesters.academic_year + semester_type: Each semester type per academic year must be unique
- time_slots.name: Time slot names must be unique
- teacher_assignments.schedule_id: Each schedule can only be assigned to one teacher
- attendance_records.teacher_assignment_id + date: One attendance record per assignment per day
- roles.name + guard_name: Role names must be unique per guard (Spatie constraint)

### Check Constraints
- subjects.units: Must be positive (0.0 to 99.9)
- semesters.end_date: Must be after start_date
- time_slots.end_time: Must be after start_time
- attendance_records.timestamp_out: Must be after timestamp_in (if both present)

### Default Values
- teachers.employment_type: 'full_time'
- teachers.is_active: true
- subjects.units: 0.0
- subjects.is_active: true
- semesters.semester_type: 'first'
- semesters.is_current: false
- time_slots.is_active: true
- schedules.day_of_week: 'monday'
- schedules.is_active: true
- teacher_assignments.is_active: true
- attendance_records.status: 'pending'
- roles.is_active: true (after migration to add column)

### Nullable Rules
- teachers.department, rank, date_hired, phone, address: Nullable (not all information required)
- subjects.description: Nullable (optional detail)
- schedules.room, section: Nullable (not always assigned)
- teacher_assignments.assigned_at, assigned_by: Nullable (audit fields)
- attendance_records.timestamp_in, timestamp_out, notes, recorded_by: Nullable (not always present)
- roles.display_name, description: Nullable (optional - after migration to add columns)

## Migration Plan

### Existing Tables (Already Migrated via Spatie)

- **permissions** - COMPLETE (via Spatie Laravel Permission)
- **roles** - PARTIALLY COMPLETE (via Spatie, needs extension migration)
- **model_has_permissions** - COMPLETE (via Spatie)
- **model_has_roles** - COMPLETE (via Spatie)
- **role_has_permissions** - COMPLETE (via Spatie)

### Required New Migrations

### Migration Order

1. **add_custom_columns_to_roles** (Extends existing Spatie roles table)
   - Add: display_name, description, is_active columns
   - Add index on is_active
2. **teachers** (Depends on: users)
3. **subjects** (No dependencies)
4. **semesters** (No dependencies)
5. **time_slots** (No dependencies)
6. **schedules** (Depends on: subjects, semesters, time_slots)
7. **teacher_assignments** (Depends on: teachers, schedules)
8. **attendance_records** (Depends on: teacher_assignments)

### Rollback Strategy

- All migrations will include down() methods for safe rollback
- Cascade delete rules ensure data consistency during rollback
- Attendance records can be safely deleted (historical data preserved via backups)
- Teacher assignments are archived (soft delete via is_active) before deletion
- Schedules are archived before deletion to preserve historical data

### Data Seeding

- **Roles Seeder**: Create default roles using Spatie (instructor, faculty_staff, dean) with display_name and description
- **Permissions Seeder**: Create granular permissions using Spatie (create_teachers, manage_schedules, view_attendance, etc.)
- **Role-Permission Seeder**: Assign permissions to roles using Spatie
- **Time Slots Seeder**: Create standard time slots (7-9 AM, 9-11 AM, 1-3 PM, 3-5 PM, etc.)
- **Semester Seeder**: Create current semester
- **Admin User Seeder**: Create initial admin user with faculty_staff and dean roles via Spatie
- **Sample Subjects Seeder**: Create sample subjects for testing

## Performance Optimization

### Indexing Strategy

- **Composite Index for Conflict Detection**: schedules(semester_id, day_of_week, time_slot_id) - Critical for preventing schedule conflicts
- **Teacher Assignment Lookup**: teacher_assignments(teacher_id, is_active) - Fast retrieval of teacher's current assignments
- **Attendance Date Queries**: attendance_records(date, status) - Efficient attendance reporting by date range
- **Current Semester Filter**: semesters(is_current) - Quick access to current semester
- **Active Records Filter**: All tables with is_active have indexes for filtering active records

### Partitioning (if applicable)

- **attendance_records**: Consider partitioning by date (year or semester) if table grows beyond 1M records
- Partition key: date column
- Partition strategy: RANGE partitioning by academic year

### Caching Strategy

- **Current Semester**: Cache the current semester record (changes rarely)
- **Time Slots**: Cache all active time slots (changes very rarely)
- **Teacher Unit Loads**: Cache calculated unit loads per teacher per semester (invalidate on assignment change)
- **Role Permissions**: Cache role permissions (changes rarely)
- Cache invalidation: Clear cache when related records are updated

## Schema Validation Checklist

Before finalizing, verify:

- [x] All entities from requirements are represented
- [x] All relationships are properly defined
- [x] Foreign key constraints are correct
- [x] Indexes support query patterns
- [x] Data types are appropriate for the data
- [x] Nullable rules are justified
- [x] Default values are appropriate
- [x] Unique constraints prevent duplicates
- [x] Cascade rules handle deletions correctly
- [x] Migration order respects dependencies
- [x] Performance considerations are addressed
- [x] Business rules are documented
- [x] Access patterns are defined
- [x] Spatie Laravel Permission integration documented
- [ ] roles table extension migration created (PENDING)
- [ ] User model updated with HasRoles trait (PENDING - code change)
- [ ] Permissions defined and seeded (PENDING)

## Conflict Detection Logic

### Teacher Schedule Conflict Detection

When assigning a teacher to a schedule, the system must check for conflicts:

```sql
-- Check if teacher has overlapping schedule
SELECT s.id, s.day_of_week, ts.start_time, ts.end_time
FROM schedules s
JOIN time_slots ts ON s.time_slot_id = ts.id
JOIN teacher_assignments ta ON s.id = ta.schedule_id
WHERE ta.teacher_id = :teacher_id
  AND ta.is_active = true
  AND s.is_active = true
  AND s.semester_id = :semester_id
  AND s.day_of_week = :day_of_week
  AND (
    (ts.start_time < :new_end_time AND ts.end_time > :new_start_time)
  );
```

If this query returns any results, there is a schedule conflict.

### Room Conflict Detection

```sql
-- Check if room is already booked
SELECT s.id
FROM schedules s
JOIN time_slots ts ON s.time_slot_id = ts.id
WHERE s.room = :room
  AND s.is_active = true
  AND s.semester_id = :semester_id
  AND s.day_of_week = :day_of_week
  AND (
    (ts.start_time < :new_end_time AND ts.end_time > :new_start_time)
  );
```

## Unit Load Calculation

### Teacher Unit Load per Semester

```sql
-- Calculate total units for a teacher in a semester
SELECT SUM(su.units) as total_units
FROM teacher_assignments ta
JOIN schedules sch ON ta.schedule_id = sch.id
JOIN subjects su ON sch.subject_id = su.id
WHERE ta.teacher_id = :teacher_id
  AND ta.is_active = true
  AND sch.is_active = true
  AND sch.semester_id = :semester_id;
```

## Attendance Generation Logic

### Daily Attendance Record Creation

For each active teacher assignment, create a pending attendance record for each scheduled day:

```sql
-- Insert attendance records for today's schedules
INSERT INTO attendance_records (teacher_assignment_id, date, status, created_at, updated_at)
SELECT ta.id, CURDATE(), 'pending', NOW(), NOW()
FROM teacher_assignments ta
JOIN schedules sch ON ta.schedule_id = sch.id
WHERE ta.is_active = true
  AND sch.is_active = true
  AND sch.day_of_week = DAYNAME(CURDATE())
  AND NOT EXISTS (
    SELECT 1 FROM attendance_records ar
    WHERE ar.teacher_assignment_id = ta.id
      AND ar.date = CURDATE()
  );
```

## Security Considerations

### Role-Based Access Control (via Spatie Laravel Permission)

**Roles**:
- **instructor**: Can view own schedules and attendance
- **faculty_staff**: Can register teachers, subjects, manage schedules, record attendance
- **dean**: Can view all schedules, attendance, teacher loads, generate reports

**Permissions** (granular control):
- create_teachers, edit_teachers, delete_teachers
- create_subjects, edit_subjects, delete_subjects
- create_schedules, edit_schedules, delete_schedules
- assign_teachers, view_all_schedules
- record_attendance, view_attendance
- view_reports, manage_users

**Implementation**:
- Add `HasRoles` trait to User model
- Use `$user->hasRole('dean')` for role checks
- Use `$user->can('create_schedules')` for permission checks
- Use `$user->hasAnyRole(['faculty_staff', 'dean'])` for multiple role checks

### Audit Trail

- teacher_assignments.assigned_by: Tracks who assigned each schedule
- teacher_assignments.assigned_at: Tracks when assignment was made
- attendance_records.recorded_by: Tracks who recorded attendance
- All tables have created_at and updated_at timestamps

## Future Enhancements

### Potential Future Features

1. **Room Management**: Dedicated rooms table with capacity and equipment
2. **Subject Prerequisites**: Track prerequisite relationships between subjects
3. **Teacher Preferences**: Track teacher availability and preferences
4. **Automated Scheduling**: Algorithm to optimize schedule assignments
5. **Substitute Teachers**: Handle teacher absences with substitutes
6. **Grade Management**: Integrate with student grading system
7. **Notification System**: Email/SMS notifications for schedule changes
8. **Mobile App**: Mobile interface for attendance recording
9. **Analytics Dashboard**: Advanced analytics and visualizations
10. **Integration**: Integration with university-wide systems

## Conclusion

This data engineering plan provides a solid foundation for the College of Education Faculty Scheduling System. The schema design ensures:

- **Data Integrity**: Proper constraints and relationships maintain data consistency
- **Performance**: Strategic indexing supports efficient query patterns
- **Scalability**: Design can handle growth in teachers, subjects, and attendance records
- **Flexibility**: Soft deletes and audit trails support historical tracking
- **Security**: Spatie Laravel Permission provides robust role-based access control with granular permissions
- **Maintainability**: Clear documentation and logical organization

### Integration with Spatie Laravel Permission

The plan leverages Spatie Laravel Permission for role and permission management:
- **roles table**: Exists via Spatie, requires migration to add display_name, description, is_active columns
- **model_has_roles**: Spatie's pivot table for user-role relationships (replaces custom role_user)
- **permissions**: Granular permission system for fine-grained access control
- **Implementation**: Add HasRoles trait to User model, use Spatie's methods for authorization

### Pending Tasks

1. Create migration to extend roles table with custom columns
2. Update User model with HasRoles trait
3. Define and seed permissions for granular access control
4. Create remaining table migrations (teachers, subjects, semesters, time_slots, schedules, teacher_assignments, attendance_records)

The schema supports all functional requirements including teacher registration, subject management, schedule assignment, conflict detection, unit load monitoring, and attendance tracking with timestamps.
