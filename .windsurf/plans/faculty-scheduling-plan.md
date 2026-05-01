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

### Current Implemented Features

1. **Teacher Registration**
   - Faculty staff can register new teacher profiles without requiring user accounts
   - Each teacher has personal information, employment details, and email address
   - Teacher profiles can exist independently of user accounts
   - User accounts can be created later and linked to existing teacher profiles
   - Teachers can be assigned roles (instructor, faculty staff, dean) when user account is created

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

4. **Draft Schedule Module**
   - Teachers can propose draft schedule assignments for themselves
   - Draft schedules are in a pending state awaiting faculty review
   - Faculty staff/dean can review and approve or reject draft schedules
   - Approved draft schedules become active teacher assignments
   - Rejected draft schedules can be modified and resubmitted
   - Track review history with reviewer comments and timestamps

5. **Teacher Assignment**
   - Assign subject schedules to teachers
   - System must prevent schedule conflicts (same teacher cannot have overlapping schedules)
   - Track teacher's total unit load per semester
   - Enforce maximum unit load limits per teacher

6. **Attendance Tracking**
   - Generate daily attendance records based on teacher schedules
   - Record attendance status (present/absent) with timestamp
   - Track attendance for each scheduled class session
   - Provide attendance reports and analytics

7. **Role-Based Access Control**
   - Faculty Staff: Can register teachers, subjects, manage schedules
   - Teachers: Can view their assigned schedules and attendance
   - Faculty Dean: Can monitor all schedules, attendance, and teacher loads
   - Hierarchical permission system

8. **Reporting and Monitoring**
   - View teacher schedules by semester
   - View attendance records by teacher, subject, or date range
   - Monitor teacher unit loads
   - Generate conflict reports
   - Dean-level oversight dashboards

### Navigation Structure

The application is organized into the following navigation groups based on user roles and permissions:

#### Overview Group
- **Dashboard**: Main landing page with system overview and statistics

#### Faculty Admin Group (Admin, Faculty Admin, Faculty Staff)
- **Teachers**: Teacher profile management and registration
- **Semesters**: Academic semester configuration
- **Time Slots**: Class time slot definitions
- **Subjects**: Subject catalog and unit management
- **Faculty Staff**: Administrative staff management

#### Scheduling Group (Admin, Faculty Admin, Faculty Staff)
- **Schedules**: Master schedule management
- **Draft Schedules**: Faculty review of teacher-proposed schedules
- **Assign Schedules**: Teacher assignment to schedules (requires teacher_assignments.view permission)

#### My Schedule Group (Teacher Role)
- **Request Schedule**: Teachers can propose draft schedules
- **My Schedule**: View personal assigned schedules

#### System Group (Permission-based)
- **Users**: User account management (requires users.view permission)
- **Roles**: Role management (Admin only)
- **Activity Logs**: System activity monitoring (requires activity_logs.view permission)

### Future Features (Planned/Commented in Navigation)

#### Faculty Admin Future Features
- **Classrooms**: Rooms/locations management
- **Departments**: Department configuration
- **Programs**: Degree program management
- **Curriculum**: Subject requirements per program
- **Sections**: Class sections per semester
- **Holidays**: Non-teaching days configuration
- **Workload Rules**: Max hours per faculty settings

#### Scheduling Future Features
- **Conflicts**: Schedule overlap detection view
- **Schedule Analytics**: Utilization reports
- **Mass Schedule Import**: Bulk CSV/Excel upload
- **Room Schedules**: Room occupancy calendar
- **Teacher Load Balance**: Hours distribution overview
- **Schedule Conflicts Resolution**: Override/reassign conflicts

#### Teacher Future Features
- **Availability**: Set preferred/unavailable time slots
- **Teaching History**: Past semester schedules archive
- **Workload Report**: Hours summary by semester
- **Substitute Requests**: Request/find substitute teachers
- **Leave Requests**: File for absence/time off
- **Schedule Preferences**: Preferred subjects/times settings

#### Dean/Department Head Future Features
- **Department Schedules**: Dean oversight of department schedules
- **Approval Queue**: Dean approval workflows
- **Department Faculty**: Department head faculty management
- **Section Schedules**: Department head section management

#### System Future Features
- **System Settings**: Global app configuration
- **Backup/Restore**: Database backup management
- **Notifications**: Broadcast/email settings
- **Audit Trail**: Data change history
- **API Keys**: Third-party integrations
- **Email Templates**: Customizable notifications
- **System Health**: Status/performance dashboard

## Future Module Schema Designs

### Faculty Admin Module Extensions

#### classrooms Table

#### Purpose
Manage physical classroom locations and their attributes for room scheduling and capacity management.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| building | varchar(100) | NO | - | Building name/identifier |
| room_number | varchar(20) | NO | - | Room number within building |
| room_name | varchar(100) | YES | NULL | Descriptive room name (e.g., "Computer Lab 1") |
| capacity | int unsigned | NO | 30 | Maximum student capacity |
| room_type | enum | NO | 'classroom' | Room type (classroom, lab, lecture_hall, office) |
| equipment | json | YES | NULL | Available equipment (projector, computers, etc.) |
| is_active | boolean | NO | true | Whether room is available for scheduling |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "classrooms",
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
    "building": {
      "type": "varchar(100)",
      "nullable": false,
      "description": "Building name/identifier"
    },
    "room_number": {
      "type": "varchar(20)",
      "nullable": false,
      "description": "Room number within building"
    },
    "room_name": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Descriptive room name"
    },
    "capacity": {
      "type": "int unsigned",
      "nullable": false,
      "default": 30,
      "description": "Maximum student capacity"
    },
    "room_type": {
      "type": "enum",
      "nullable": false,
      "default": "classroom",
      "values": ["classroom", "lab", "lecture_hall", "office"],
      "description": "Room type"
    },
    "equipment": {
      "type": "json",
      "nullable": true,
      "description": "Available equipment list"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether room is available for scheduling"
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
    "classrooms_building_room_unique": ["building", "room_number"],
    "classrooms_room_type_index": ["room_type"],
    "classrooms_is_active_index": ["is_active"]
  },
  "foreign_keys": {}
}
```

#### departments Table

#### Purpose
Organize faculty and programs into academic departments for administrative management.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| code | varchar(20) | NO | - | Department code (e.g., "EDUC") |
| name | varchar(255) | NO | - | Department full name |
| description | text | YES | NULL | Department description |
| head_id | bigint unsigned | YES | NULL | Foreign key to teachers (department head) |
| office_location | varchar(100) | YES | NULL | Department office location |
| contact_phone | varchar(20) | YES | NULL | Department contact phone |
| contact_email | varchar(255) | YES | NULL | Department contact email |
| is_active | boolean | NO | true | Whether department is active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "departments",
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
      "description": "Department code"
    },
    "name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Department full name"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Department description"
    },
    "head_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to teachers (department head)"
    },
    "office_location": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Department office location"
    },
    "contact_phone": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Department contact phone"
    },
    "contact_email": {
      "type": "varchar(255)",
      "nullable": true,
      "description": "Department contact email"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether department is active"
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
    "departments_code_unique": ["code"],
    "departments_head_id_index": ["head_id"],
    "departments_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "departments_head_id_foreign": {
      "column": "head_id",
      "references": "teachers.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### programs Table

#### Purpose
Define academic degree programs offered by the College of Education.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| code | varchar(20) | NO | - | Program code (e.g., "BSED") |
| name | varchar(255) | NO | - | Program full name |
| degree_level | enum | NO | 'bachelor' | Degree level (bachelor, master, doctoral) |
| department_id | bigint unsigned | NO | - | Foreign key to departments |
| description | text | YES | NULL | Program description |
| duration_years | decimal(3,1) | NO | 4.0 | Program duration in years |
| total_units | decimal(5,1) | NO | 0.0 | Total program units required |
| is_active | boolean | NO | true | Whether program is currently offered |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "programs",
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
      "description": "Program code"
    },
    "name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Program full name"
    },
    "degree_level": {
      "type": "enum",
      "nullable": false,
      "default": "bachelor",
      "values": ["bachelor", "master", "doctoral"],
      "description": "Degree level"
    },
    "department_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to departments"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Program description"
    },
    "duration_years": {
      "type": "decimal(3,1)",
      "nullable": false,
      "default": 4.0,
      "description": "Program duration in years"
    },
    "total_units": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Total program units required"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether program is currently offered"
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
    "programs_code_unique": ["code"],
    "programs_department_id_index": ["department_id"],
    "programs_degree_level_index": ["degree_level"],
    "programs_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "programs_department_id_foreign": {
      "column": "department_id",
      "references": "departments.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    }
  }
}
```

#### curriculum Table

#### Purpose
Define subject requirements and prerequisites for each academic program.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| program_id | bigint unsigned | NO | - | Foreign key to programs |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| year_level | int unsigned | NO | 1 | Year level the subject is taken |
| semester_type | enum | NO | 'first' | Semester (first, second, summer) |
| is_required | boolean | NO | true | Whether subject is required or elective |
| prerequisite_subjects | json | YES | NULL | Array of prerequisite subject IDs |
| units_override | decimal(3,1) | YES | NULL | Override units if different from subject |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "curriculum",
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
    "program_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to programs"
    },
    "subject_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to subjects"
    },
    "year_level": {
      "type": "int unsigned",
      "nullable": false,
      "default": 1,
      "description": "Year level the subject is taken"
    },
    "semester_type": {
      "type": "enum",
      "nullable": false,
      "default": "first",
      "values": ["first", "second", "summer"],
      "description": "Semester"
    },
    "is_required": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether subject is required or elective"
    },
    "prerequisite_subjects": {
      "type": "json",
      "nullable": true,
      "description": "Array of prerequisite subject IDs"
    },
    "units_override": {
      "type": "decimal(3,1)",
      "nullable": true,
      "description": "Override units if different from subject"
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
    "curriculum_program_subject_unique": ["program_id", "subject_id"],
    "curriculum_program_year_semester_index": ["program_id", "year_level", "semester_type"]
  },
  "foreign_keys": {
    "curriculum_program_id_foreign": {
      "column": "program_id",
      "references": "programs.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "curriculum_subject_id_foreign": {
      "column": "subject_id",
      "references": "subjects.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### sections Table

#### Purpose
Manage class sections for each semester and program.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| section_code | varchar(20) | NO | - | Section code (e.g., "BSED-1A") |
| program_id | bigint unsigned | NO | - | Foreign key to programs |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| year_level | int unsigned | NO | 1 | Year level |
| max_students | int unsigned | NO | 40 | Maximum student capacity |
| current_students | int unsigned | NO | 0 | Current enrolled students |
| adviser_id | bigint unsigned | YES | NULL | Foreign key to teachers (section adviser) |
| is_active | boolean | NO | true | Whether section is active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "sections",
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
    "section_code": {
      "type": "varchar(20)",
      "nullable": false,
      "description": "Section code"
    },
    "program_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to programs"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "year_level": {
      "type": "int unsigned",
      "nullable": false,
      "default": 1,
      "description": "Year level"
    },
    "max_students": {
      "type": "int unsigned",
      "nullable": false,
      "default": 40,
      "description": "Maximum student capacity"
    },
    "current_students": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Current enrolled students"
    },
    "adviser_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to teachers (section adviser)"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether section is active"
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
    "sections_section_code_unique": ["section_code"],
    "sections_program_semester_index": ["program_id", "semester_id"],
    "sections_adviser_id_index": ["adviser_id"],
    "sections_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "sections_program_id_foreign": {
      "column": "program_id",
      "references": "programs.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "sections_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "RESTRICT",
      "on_update": "CASCADE"
    },
    "sections_adviser_id_foreign": {
      "column": "adviser_id",
      "references": "teachers.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### holidays Table

#### Purpose
Manage non-teaching days and holidays for academic calendar planning.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | - | Holiday name |
| date | date | NO | - | Holiday date |
| type | enum | NO | 'regular' | Holiday type (regular, special, suspension) |
| description | text | YES | NULL | Holiday description |
| affects_schedules | boolean | NO | true | Whether classes are suspended |
| academic_year | varchar(20) | YES | NULL | Academic year (if applicable) |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "holidays",
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
      "description": "Holiday name"
    },
    "date": {
      "type": "date",
      "nullable": false,
      "description": "Holiday date"
    },
    "type": {
      "type": "enum",
      "nullable": false,
      "default": "regular",
      "values": ["regular", "special", "suspension"],
      "description": "Holiday type"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Holiday description"
    },
    "affects_schedules": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether classes are suspended"
    },
    "academic_year": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Academic year (if applicable)"
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
    "holidays_date_unique": ["date"],
    "holidays_academic_year_index": ["academic_year"],
    "holidays_type_index": ["type"]
  },
  "foreign_keys": {}
}
```

#### workload_rules Table

#### Purpose
Define maximum teaching hours and workload policies for faculty.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| employment_type | enum | NO | 'full_time' | Employment type this rule applies to |
| max_teaching_hours | decimal(4,1) | NO | 24.0 | Maximum teaching hours per week |
| max_units | decimal(5,1) | NO | 24.0 | Maximum units per semester |
| min_units | decimal(5,1) | YES | NULL | Minimum units per semester |
| max_preparation_hours | decimal(4,1) | YES | NULL | Maximum preparation hours |
| overtime_rate | decimal(5,2) | YES | NULL | Overtime pay rate multiplier |
| description | text | YES | NULL | Rule description |
| is_active | boolean | NO | true | Whether rule is currently active |
| effective_date | date | NO | - | Date rule becomes effective |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "workload_rules",
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
    "employment_type": {
      "type": "enum",
      "nullable": false,
      "default": "full_time",
      "values": ["full_time", "part_time", "casual"],
      "description": "Employment type this rule applies to"
    },
    "max_teaching_hours": {
      "type": "decimal(4,1)",
      "nullable": false,
      "default": 24.0,
      "description": "Maximum teaching hours per week"
    },
    "max_units": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 24.0,
      "description": "Maximum units per semester"
    },
    "min_units": {
      "type": "decimal(5,1)",
      "nullable": true,
      "description": "Minimum units per semester"
    },
    "max_preparation_hours": {
      "type": "decimal(4,1)",
      "nullable": true,
      "description": "Maximum preparation hours"
    },
    "overtime_rate": {
      "type": "decimal(5,2)",
      "nullable": true,
      "description": "Overtime pay rate multiplier"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Rule description"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether rule is currently active"
    },
    "effective_date": {
      "type": "date",
      "nullable": false,
      "description": "Date rule becomes effective"
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
    "workload_rules_employment_type_index": ["employment_type"],
    "workload_rules_is_active_index": ["is_active"],
    "workload_rules_effective_date_index": ["effective_date"]
  },
  "foreign_keys": {}
}
```

### Scheduling Module Extensions

#### schedule_conflicts Table

#### Purpose
Track and manage schedule conflicts between teachers, rooms, and time slots.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| conflict_type | enum | NO | 'teacher_overlap' | Conflict type (teacher_overlap, room_double_book, time_slot_conflict) |
| primary_schedule_id | bigint unsigned | YES | NULL | Primary schedule involved in conflict |
| secondary_schedule_id | bigint unsigned | YES | NULL | Secondary schedule involved in conflict |
| teacher_id | bigint unsigned | YES | NULL | Teacher involved in conflict |
| classroom_id | bigint unsigned | YES | NULL | Classroom involved in conflict |
| time_slot_id | bigint unsigned | YES | NULL | Time slot involved in conflict |
| day_of_week | enum | YES | NULL | Day of conflict (monday, tuesday, etc.) |
| semester_id | bigint unsigned | NO | - | Semester where conflict occurs |
| severity | enum | NO | 'medium' | Conflict severity (low, medium, high, critical) |
| status | enum | NO | 'pending' | Resolution status (pending, resolved, ignored) |
| resolved_by | bigint unsigned | YES | NULL | User who resolved the conflict |
| resolution_notes | text | YES | NULL | Notes on how conflict was resolved |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "schedule_conflicts",
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
    "conflict_type": {
      "type": "enum",
      "nullable": false,
      "default": "teacher_overlap",
      "values": ["teacher_overlap", "room_double_book", "time_slot_conflict"],
      "description": "Conflict type"
    },
    "primary_schedule_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Primary schedule involved in conflict"
    },
    "secondary_schedule_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Secondary schedule involved in conflict"
    },
    "teacher_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Teacher involved in conflict"
    },
    "classroom_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Classroom involved in conflict"
    },
    "time_slot_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Time slot involved in conflict"
    },
    "day_of_week": {
      "type": "enum",
      "nullable": true,
      "values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "description": "Day of conflict"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Semester where conflict occurs"
    },
    "severity": {
      "type": "enum",
      "nullable": false,
      "default": "medium",
      "values": ["low", "medium", "high", "critical"],
      "description": "Conflict severity"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "resolved", "ignored"],
      "description": "Resolution status"
    },
    "resolved_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "User who resolved the conflict"
    },
    "resolution_notes": {
      "type": "text",
      "nullable": true,
      "description": "Notes on how conflict was resolved"
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
    "schedule_conflicts_semester_status_index": ["semester_id", "status"],
    "schedule_conflicts_teacher_index": ["teacher_id"],
    "schedule_conflicts_classroom_index": ["classroom_id"],
    "schedule_conflicts_type_index": ["conflict_type"]
  },
  "foreign_keys": {
    "schedule_conflicts_primary_schedule_id_foreign": {
      "column": "primary_schedule_id",
      "references": "schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_secondary_schedule_id_foreign": {
      "column": "secondary_schedule_id",
      "references": "schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_classroom_id_foreign": {
      "column": "classroom_id",
      "references": "classrooms.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_time_slot_id_foreign": {
      "column": "time_slot_id",
      "references": "time_slots.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "schedule_conflicts_resolved_by_foreign": {
      "column": "resolved_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### schedule_analytics Table

#### Purpose
Store pre-calculated analytics data for schedule utilization and reporting.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| metric_type | enum | NO | 'room_utilization' | Metric type (room_utilization, teacher_load, subject_distribution, time_slot_usage) |
| entity_id | bigint unsigned | YES | NULL | ID of related entity (room, teacher, subject, etc.) |
| entity_type | varchar(50) | YES | NULL | Type of entity (classroom, teacher, subject, time_slot) |
| semester_id | bigint unsigned | NO | - | Semester for this metric |
| metric_value | decimal(10,2) | NO | 0.00 | Calculated metric value |
| metric_unit | varchar(20) | YES | NULL | Unit of measurement (percentage, hours, count) |
| additional_data | json | YES | NULL | Additional metric details |
| calculated_at | timestamp | NO | CURRENT_TIMESTAMP | When metric was calculated |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "schedule_analytics",
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
    "metric_type": {
      "type": "enum",
      "nullable": false,
      "default": "room_utilization",
      "values": ["room_utilization", "teacher_load", "subject_distribution", "time_slot_usage"],
      "description": "Metric type"
    },
    "entity_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "ID of related entity"
    },
    "entity_type": {
      "type": "varchar(50)",
      "nullable": true,
      "description": "Type of entity"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Semester for this metric"
    },
    "metric_value": {
      "type": "decimal(10,2)",
      "nullable": false,
      "default": 0.00,
      "description": "Calculated metric value"
    },
    "metric_unit": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Unit of measurement"
    },
    "additional_data": {
      "type": "json",
      "nullable": true,
      "description": "Additional metric details"
    },
    "calculated_at": {
      "type": "timestamp",
      "nullable": false,
      "description": "When metric was calculated"
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
    "schedule_analytics_semester_metric_index": ["semester_id", "metric_type"],
    "schedule_analytics_entity_index": ["entity_type", "entity_id"],
    "schedule_analytics_calculated_at_index": ["calculated_at"]
  },
  "foreign_keys": {
    "schedule_analytics_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### room_schedules Table

#### Purpose
Link schedules to specific classrooms for room occupancy tracking.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| schedule_id | bigint unsigned | NO | - | Foreign key to schedules |
| classroom_id | bigint unsigned | NO | - | Foreign key to classrooms |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| is_active | boolean | NO | true | Whether room assignment is active |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "room_schedules",
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
    "schedule_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to schedules"
    },
    "classroom_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to classrooms"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether room assignment is active"
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
    "room_schedules_schedule_classroom_unique": ["schedule_id", "classroom_id"],
    "room_schedules_classroom_semester_index": ["classroom_id", "semester_id"],
    "room_schedules_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "room_schedules_schedule_id_foreign": {
      "column": "schedule_id",
      "references": "schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "room_schedules_classroom_id_foreign": {
      "column": "classroom_id",
      "references": "classrooms.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "room_schedules_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### teacher_load_balance Table

#### Purpose
Track teacher workload distribution and balance across departments and programs.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| total_units | decimal(5,1) | NO | 0.0 | Total assigned units |
| total_hours | decimal(5,1) | NO | 0.0 | Total teaching hours |
| preparation_hours | decimal(5,1) | YES | NULL | Estimated preparation hours |
| overload_units | decimal(5,1) | NO | 0.0 | Units beyond standard load |
| overload_hours | decimal(5,1) | NO | 0.0 | Hours beyond standard load |
| balance_score | decimal(5,2) | YES | NULL | Workload balance score (0-100) |
| department_preference | json | YES | NULL | Preferred department assignments |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "teacher_load_balance",
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
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "total_units": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Total assigned units"
    },
    "total_hours": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Total teaching hours"
    },
    "preparation_hours": {
      "type": "decimal(5,1)",
      "nullable": true,
      "description": "Estimated preparation hours"
    },
    "overload_units": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Units beyond standard load"
    },
    "overload_hours": {
      "type": "decimal(5,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Hours beyond standard load"
    },
    "balance_score": {
      "type": "decimal(5,2)",
      "nullable": true,
      "description": "Workload balance score (0-100)"
    },
    "department_preference": {
      "type": "json",
      "nullable": true,
      "description": "Preferred department assignments"
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
    "teacher_load_balance_teacher_semester_unique": ["teacher_id", "semester_id"],
    "teacher_load_balance_balance_score_index": ["balance_score"],
    "teacher_load_balance_overload_units_index": ["overload_units"]
  },
  "foreign_keys": {
    "teacher_load_balance_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_load_balance_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### schedule_import_jobs Table

#### Purpose
Track bulk schedule import operations and their status.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | NO | - | Foreign key to users who initiated import |
| file_name | varchar(255) | NO | - | Original uploaded file name |
| file_path | varchar(500) | NO | - | Path to uploaded file |
| file_type | enum | NO | 'csv' | File type (csv, excel, json) |
| total_records | int unsigned | YES | NULL | Total records in file |
| processed_records | int unsigned | NO | 0 | Number of records processed |
| successful_records | int unsigned | NO | 0 | Number of successfully imported records |
| failed_records | int unsigned | NO | 0 | Number of failed records |
| status | enum | NO | 'pending' | Import status (pending, processing, completed, failed, cancelled) |
| error_log | longtext | YES | NULL | Detailed error information |
| import_options | json | YES | NULL | Import configuration options |
| started_at | timestamp | YES | NULL | When import processing started |
| completed_at | timestamp | YES | NULL | When import processing completed |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "schedule_import_jobs",
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
      "description": "Foreign key to users who initiated import"
    },
    "file_name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Original uploaded file name"
    },
    "file_path": {
      "type": "varchar(500)",
      "nullable": false,
      "description": "Path to uploaded file"
    },
    "file_type": {
      "type": "enum",
      "nullable": false,
      "default": "csv",
      "values": ["csv", "excel", "json"],
      "description": "File type"
    },
    "total_records": {
      "type": "int unsigned",
      "nullable": true,
      "description": "Total records in file"
    },
    "processed_records": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Number of records processed"
    },
    "successful_records": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Number of successfully imported records"
    },
    "failed_records": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Number of failed records"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "processing", "completed", "failed", "cancelled"],
      "description": "Import status"
    },
    "error_log": {
      "type": "longtext",
      "nullable": true,
      "description": "Detailed error information"
    },
    "import_options": {
      "type": "json",
      "nullable": true,
      "description": "Import configuration options"
    },
    "started_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When import processing started"
    },
    "completed_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When import processing completed"
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
    "schedule_import_jobs_user_id_index": ["user_id"],
    "schedule_import_jobs_status_index": ["status"],
    "schedule_import_jobs_created_at_index": ["created_at"]
  },
  "foreign_keys": {
    "schedule_import_jobs_user_id_foreign": {
      "column": "user_id",
      "references": "users.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

### Teacher Module Extensions

#### teacher_availability Table

#### Purpose
Manage teacher availability and preferred time slots for scheduling.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| day_of_week | enum | NO | 'monday' | Day of week (monday, tuesday, etc.) |
| time_slot_id | bigint unsigned | NO | - | Foreign key to time_slots |
| availability_status | enum | NO | 'available' | Availability status (available, preferred, unavailable) |
| reason | varchar(255) | YES | NULL | Reason for unavailability |
| is_recurring | boolean | NO | true | Whether this availability repeats weekly |
| effective_start_date | date | YES | NULL | Start date for this availability |
| effective_end_date | date | YES | NULL | End date for this availability |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "teacher_availability",
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
    "day_of_week": {
      "type": "enum",
      "nullable": false,
      "default": "monday",
      "values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "description": "Day of week"
    },
    "time_slot_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to time_slots"
    },
    "availability_status": {
      "type": "enum",
      "nullable": false,
      "default": "available",
      "values": ["available", "preferred", "unavailable"],
      "description": "Availability status"
    },
    "reason": {
      "type": "varchar(255)",
      "nullable": true,
      "description": "Reason for unavailability"
    },
    "is_recurring": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether this availability repeats weekly"
    },
    "effective_start_date": {
      "type": "date",
      "nullable": true,
      "description": "Start date for this availability"
    },
    "effective_end_date": {
      "type": "date",
      "nullable": true,
      "description": "End date for this availability"
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
    "teacher_availability_teacher_day_slot_unique": ["teacher_id", "day_of_week", "time_slot_id"],
    "teacher_availability_status_index": ["availability_status"],
    "teacher_availability_effective_dates_index": ["effective_start_date", "effective_end_date"]
  },
  "foreign_keys": {
    "teacher_availability_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teacher_availability_time_slot_id_foreign": {
      "column": "time_slot_id",
      "references": "time_slots.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### teaching_history Table

#### Purpose
Archive historical teaching assignments for teachers across semesters.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| section_id | bigint unsigned | YES | NULL | Foreign key to sections |
| classroom_id | bigint unsigned | YES | NULL | Foreign key to classrooms |
| time_slot_id | bigint unsigned | NO | - | Foreign key to time_slots |
| day_of_week | enum | NO | 'monday' | Day of week |
| units | decimal(3,1) | NO | 0.0 | Units for this assignment |
| student_count | int unsigned | YES | NULL | Number of students enrolled |
| performance_rating | decimal(3,2) | YES | NULL | Teacher performance rating (1.00-5.00) |
| notes | text | YES | NULL | Additional notes about the assignment |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "teaching_history",
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
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "subject_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to subjects"
    },
    "section_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to sections"
    },
    "classroom_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to classrooms"
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
      "description": "Day of week"
    },
    "units": {
      "type": "decimal(3,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Units for this assignment"
    },
    "student_count": {
      "type": "int unsigned",
      "nullable": true,
      "description": "Number of students enrolled"
    },
    "performance_rating": {
      "type": "decimal(3,2)",
      "nullable": true,
      "description": "Teacher performance rating (1.00-5.00)"
    },
    "notes": {
      "type": "text",
      "nullable": true,
      "description": "Additional notes about the assignment"
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
    "teaching_history_teacher_semester_index": ["teacher_id", "semester_id"],
    "teaching_history_subject_index": ["subject_id"],
    "teaching_history_semester_index": ["semester_id"]
  },
  "foreign_keys": {
    "teaching_history_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teaching_history_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teaching_history_subject_id_foreign": {
      "column": "subject_id",
      "references": "subjects.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "teaching_history_section_id_foreign": {
      "column": "section_id",
      "references": "sections.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "teaching_history_classroom_id_foreign": {
      "column": "classroom_id",
      "references": "classrooms.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "teaching_history_time_slot_id_foreign": {
      "column": "time_slot_id",
      "references": "time_slots.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### substitute_requests Table

#### Purpose
Manage substitute teacher requests and assignments.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| requesting_teacher_id | bigint unsigned | NO | - | Foreign key to teachers (who needs substitute) |
| substitute_teacher_id | bigint unsigned | YES | NULL | Foreign key to teachers (substitute assigned) |
| teacher_assignment_id | bigint unsigned | NO | - | Foreign key to teacher_assignments |
| request_date | date | NO | - | Date substitute is needed |
| time_slot_id | bigint unsigned | NO | - | Foreign key to time_slots |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| reason | text | YES | NULL | Reason for substitute request |
| status | enum | NO | 'pending' | Request status (pending, approved, rejected, completed) |
| approved_by | bigint unsigned | YES | NULL | Foreign key to users who approved |
| approved_at | timestamp | YES | NULL | When request was approved |
| substitute_notes | text | YES | NULL | Notes from substitute teacher |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "substitute_requests",
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
    "requesting_teacher_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to teachers (who needs substitute)"
    },
    "substitute_teacher_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to teachers (substitute assigned)"
    },
    "teacher_assignment_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to teacher_assignments"
    },
    "request_date": {
      "type": "date",
      "nullable": false,
      "description": "Date substitute is needed"
    },
    "time_slot_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to time_slots"
    },
    "subject_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to subjects"
    },
    "reason": {
      "type": "text",
      "nullable": true,
      "description": "Reason for substitute request"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "approved", "rejected", "completed"],
      "description": "Request status"
    },
    "approved_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who approved"
    },
    "approved_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When request was approved"
    },
    "substitute_notes": {
      "type": "text",
      "nullable": true,
      "description": "Notes from substitute teacher"
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
    "substitute_requests_requesting_teacher_index": ["requesting_teacher_id"],
    "substitute_requests_substitute_teacher_index": ["substitute_teacher_id"],
    "substitute_requests_status_index": ["status"],
    "substitute_requests_request_date_index": ["request_date"]
  },
  "foreign_keys": {
    "substitute_requests_requesting_teacher_id_foreign": {
      "column": "requesting_teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "substitute_requests_substitute_teacher_id_foreign": {
      "column": "substitute_teacher_id",
      "references": "teachers.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "substitute_requests_teacher_assignment_id_foreign": {
      "column": "teacher_assignment_id",
      "references": "teacher_assignments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "substitute_requests_time_slot_id_foreign": {
      "column": "time_slot_id",
      "references": "time_slots.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "substitute_requests_subject_id_foreign": {
      "column": "subject_id",
      "references": "subjects.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "substitute_requests_approved_by_foreign": {
      "column": "approved_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### leave_requests Table

#### Purpose
Manage teacher leave requests and approval workflow.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| leave_type | enum | NO | 'sick' | Leave type (sick, personal, emergency, professional) |
| start_date | date | NO | - | Leave start date |
| end_date | date | NO | - | Leave end date |
| total_days | int unsigned | NO | 1 | Total number of leave days |
| reason | text | YES | NULL | Reason for leave request |
| status | enum | NO | 'pending' | Request status (pending, approved, rejected, cancelled) |
| approved_by | bigint unsigned | YES | NULL | Foreign key to users who approved/rejected |
| approved_at | timestamp | YES | NULL | When request was processed |
| rejection_reason | text | YES | NULL | Reason for rejection |
| affects_schedules | boolean | NO | true | Whether leave affects teaching schedules |
| affected_assignments | json | YES | NULL | List of affected teacher assignments |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "leave_requests",
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
    "leave_type": {
      "type": "enum",
      "nullable": false,
      "default": "sick",
      "values": ["sick", "personal", "emergency", "professional"],
      "description": "Leave type"
    },
    "start_date": {
      "type": "date",
      "nullable": false,
      "description": "Leave start date"
    },
    "end_date": {
      "type": "date",
      "nullable": false,
      "description": "Leave end date"
    },
    "total_days": {
      "type": "int unsigned",
      "nullable": false,
      "default": 1,
      "description": "Total number of leave days"
    },
    "reason": {
      "type": "text",
      "nullable": true,
      "description": "Reason for leave request"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "approved", "rejected", "cancelled"],
      "description": "Request status"
    },
    "approved_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who approved/rejected"
    },
    "approved_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When request was processed"
    },
    "rejection_reason": {
      "type": "text",
      "nullable": true,
      "description": "Reason for rejection"
    },
    "affects_schedules": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether leave affects teaching schedules"
    },
    "affected_assignments": {
      "type": "json",
      "nullable": true,
      "description": "List of affected teacher assignments"
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
    "leave_requests_teacher_index": ["teacher_id"],
    "leave_requests_status_index": ["status"],
    "leave_requests_date_range_index": ["start_date", "end_date"],
    "leave_requests_approved_by_index": ["approved_by"]
  },
  "foreign_keys": {
    "leave_requests_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "leave_requests_approved_by_foreign": {
      "column": "approved_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### schedule_preferences Table

#### Purpose
Store teacher preferences for subjects, time slots, and other scheduling factors.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| preference_type | enum | NO | 'subject' | Preference type (subject, time_slot, classroom, department) |
| preference_value | bigint unsigned | YES | NULL | ID of preferred entity (subject_id, time_slot_id, etc.) |
| preference_level | enum | NO | 'neutral' | Preference level (avoid, neutral, prefer, strong_prefer) |
| priority | int unsigned | NO | 1 | Priority (1=high, 5=low) |
| reason | varchar(255) | YES | NULL | Reason for this preference |
| is_active | boolean | NO | true | Whether preference is currently active |
| effective_start_date | date | YES | NULL | Start date for this preference |
| effective_end_date | date | YES | NULL | End date for this preference |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "schedule_preferences",
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
    "preference_type": {
      "type": "enum",
      "nullable": false,
      "default": "subject",
      "values": ["subject", "time_slot", "classroom", "department"],
      "description": "Preference type"
    },
    "preference_value": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "ID of preferred entity"
    },
    "preference_level": {
      "type": "enum",
      "nullable": false,
      "default": "neutral",
      "values": ["avoid", "neutral", "prefer", "strong_prefer"],
      "description": "Preference level"
    },
    "priority": {
      "type": "int unsigned",
      "nullable": false,
      "default": 1,
      "description": "Priority (1=high, 5=low)"
    },
    "reason": {
      "type": "varchar(255)",
      "nullable": true,
      "description": "Reason for this preference"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether preference is currently active"
    },
    "effective_start_date": {
      "type": "date",
      "nullable": true,
      "description": "Start date for this preference"
    },
    "effective_end_date": {
      "type": "date",
      "nullable": true,
      "description": "End date for this preference"
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
    "schedule_preferences_teacher_type_value_unique": ["teacher_id", "preference_type", "preference_value"],
    "schedule_preferences_level_index": ["preference_level"],
    "schedule_preferences_priority_index": ["priority"],
    "schedule_preferences_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "schedule_preferences_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

### Dean/Department Head Module Extensions

#### department_schedules Table

#### Purpose
Provide department-level oversight and aggregation of all schedules within a department.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| department_id | bigint unsigned | NO | - | Foreign key to departments |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| total_teachers | int unsigned | NO | 0 | Total teachers in department |
| total_units | decimal(6,1) | NO | 0.0 | Total units assigned |
| total_classes | int unsigned | NO | 0 | Total class sections |
| average_load | decimal(5,1) | YES | NULL | Average units per teacher |
| utilization_rate | decimal(5,2) | YES | NULL | Department resource utilization percentage |
| conflict_count | int unsigned | NO | 0 | Number of unresolved conflicts |
| last_updated | timestamp | NO | CURRENT_TIMESTAMP | Last time statistics were calculated |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "department_schedules",
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
    "department_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to departments"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "total_teachers": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Total teachers in department"
    },
    "total_units": {
      "type": "decimal(6,1)",
      "nullable": false,
      "default": 0.0,
      "description": "Total units assigned"
    },
    "total_classes": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Total class sections"
    },
    "average_load": {
      "type": "decimal(5,1)",
      "nullable": true,
      "description": "Average units per teacher"
    },
    "utilization_rate": {
      "type": "decimal(5,2)",
      "nullable": true,
      "description": "Department resource utilization percentage"
    },
    "conflict_count": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Number of unresolved conflicts"
    },
    "last_updated": {
      "type": "timestamp",
      "nullable": false,
      "description": "Last time statistics were calculated"
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
    "department_schedules_department_semester_unique": ["department_id", "semester_id"],
    "department_schedules_utilization_rate_index": ["utilization_rate"],
    "department_schedules_conflict_count_index": ["conflict_count"]
  },
  "foreign_keys": {
    "department_schedules_department_id_foreign": {
      "column": "department_id",
      "references": "departments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "department_schedules_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### approval_queue Table

#### Purpose
Manage dean-level approval workflows for various scheduling and administrative requests.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| request_type | enum | NO | 'draft_schedule' | Request type (draft_schedule, leave_request, substitute_request, curriculum_change) |
| request_id | bigint unsigned | NO | - | ID of the related request record |
| requester_id | bigint unsigned | NO | - | Foreign key to users who made the request |
| approver_id | bigint unsigned | YES | NULL | Foreign key to users (dean/department head) |
| department_id | bigint unsigned | YES | NULL | Foreign key to departments (for department-level approvals) |
| status | enum | NO | 'pending' | Approval status (pending, approved, rejected, returned) |
| priority | enum | NO | 'normal' | Priority level (low, normal, high, urgent) |
| submitted_at | timestamp | NO | CURRENT_TIMESTAMP | When request was submitted for approval |
| reviewed_at | timestamp | YES | NULL | When request was reviewed |
| approval_notes | text | YES | NULL | Notes from approver |
| rejection_reason | text | YES | NULL | Reason for rejection |
| return_reason | text | YES | NULL | Reason for returning to requester |
| escalation_level | int unsigned | NO | 1 | Current escalation level (1=department head, 2=dean) |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "approval_queue",
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
    "request_type": {
      "type": "enum",
      "nullable": false,
      "default": "draft_schedule",
      "values": ["draft_schedule", "leave_request", "substitute_request", "curriculum_change"],
      "description": "Request type"
    },
    "request_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "ID of the related request record"
    },
    "requester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to users who made the request"
    },
    "approver_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users (dean/department head)"
    },
    "department_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to departments (for department-level approvals)"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "approved", "rejected", "returned"],
      "description": "Approval status"
    },
    "priority": {
      "type": "enum",
      "nullable": false,
      "default": "normal",
      "values": ["low", "normal", "high", "urgent"],
      "description": "Priority level"
    },
    "submitted_at": {
      "type": "timestamp",
      "nullable": false,
      "description": "When request was submitted for approval"
    },
    "reviewed_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When request was reviewed"
    },
    "approval_notes": {
      "type": "text",
      "nullable": true,
      "description": "Notes from approver"
    },
    "rejection_reason": {
      "type": "text",
      "nullable": true,
      "description": "Reason for rejection"
    },
    "return_reason": {
      "type": "text",
      "nullable": true,
      "description": "Reason for returning to requester"
    },
    "escalation_level": {
      "type": "int unsigned",
      "nullable": false,
      "default": 1,
      "description": "Current escalation level (1=department head, 2=dean)"
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
    "approval_queue_request_type_id_unique": ["request_type", "request_id"],
    "approval_queue_approver_status_index": ["approver_id", "status"],
    "approval_queue_department_index": ["department_id"],
    "approval_queue_priority_index": ["priority"],
    "approval_queue_submitted_at_index": ["submitted_at"]
  },
  "foreign_keys": {
    "approval_queue_requester_id_foreign": {
      "column": "requester_id",
      "references": "users.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "approval_queue_approver_id_foreign": {
      "column": "approver_id",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "approval_queue_department_id_foreign": {
      "column": "department_id",
      "references": "departments.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### department_faculty Table

#### Purpose
Link teachers to departments for department head management and reporting.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers |
| department_id | bigint unsigned | NO | - | Foreign key to departments |
| role | enum | NO | 'member' | Faculty role in department (member, coordinator, assistant_head, head) |
| join_date | date | NO | - | Date teacher joined department |
| leave_date | date | YES | NULL | Date teacher left department |
| is_active | boolean | NO | true | Whether faculty member is currently active in department |
| reporting_line | json | YES | NULL | Reporting hierarchy within department |
| specializations | json | YES | NULL | Faculty specializations within department |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "department_faculty",
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
    "department_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to departments"
    },
    "role": {
      "type": "enum",
      "nullable": false,
      "default": "member",
      "values": ["member", "coordinator", "assistant_head", "head"],
      "description": "Faculty role in department"
    },
    "join_date": {
      "type": "date",
      "nullable": false,
      "description": "Date teacher joined department"
    },
    "leave_date": {
      "type": "date",
      "nullable": true,
      "description": "Date teacher left department"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether faculty member is currently active in department"
    },
    "reporting_line": {
      "type": "json",
      "nullable": true,
      "description": "Reporting hierarchy within department"
    },
    "specializations": {
      "type": "json",
      "nullable": true,
      "description": "Faculty specializations within department"
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
    "department_faculty_teacher_department_unique": ["teacher_id", "department_id"],
    "department_faculty_department_role_index": ["department_id", "role"],
    "department_faculty_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "department_faculty_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "department_faculty_department_id_foreign": {
      "column": "department_id",
      "references": "departments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### section_schedules Table

#### Purpose
Department head view of all sections and their scheduling status within the department.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| section_id | bigint unsigned | NO | - | Foreign key to sections |
| department_id | bigint unsigned | NO | - | Foreign key to departments |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| assigned_teacher_id | bigint unsigned | YES | NULL | Foreign key to teachers |
| classroom_id | bigint unsigned | YES | NULL | Foreign key to classrooms |
| schedule_status | enum | NO | 'unscheduled' | Scheduling status (unscheduled, scheduled, conflict, incomplete) |
| enrollment_count | int unsigned | NO | 0 | Current student enrollment |
| capacity | int unsigned | NO | 40 | Maximum student capacity |
| fill_rate | decimal(5,2) | YES | NULL | Enrollment fill rate percentage |
| schedule_conflicts | int unsigned | NO | 0 | Number of scheduling conflicts |
| last_updated | timestamp | NO | CURRENT_TIMESTAMP | Last time record was updated |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "section_schedules",
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
    "section_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to sections"
    },
    "department_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to departments"
    },
    "semester_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to semesters"
    },
    "assigned_teacher_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to teachers"
    },
    "classroom_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to classrooms"
    },
    "schedule_status": {
      "type": "enum",
      "nullable": false,
      "default": "unscheduled",
      "values": ["unscheduled", "scheduled", "conflict", "incomplete"],
      "description": "Scheduling status"
    },
    "enrollment_count": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Current student enrollment"
    },
    "capacity": {
      "type": "int unsigned",
      "nullable": false,
      "default": 40,
      "description": "Maximum student capacity"
    },
    "fill_rate": {
      "type": "decimal(5,2)",
      "nullable": true,
      "description": "Enrollment fill rate percentage"
    },
    "schedule_conflicts": {
      "type": "int unsigned",
      "nullable": false,
      "default": 0,
      "description": "Number of scheduling conflicts"
    },
    "last_updated": {
      "type": "timestamp",
      "nullable": false,
      "description": "Last time record was updated"
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
    "section_schedules_section_semester_unique": ["section_id", "semester_id"],
    "section_schedules_department_index": ["department_id"],
    "section_schedules_status_index": ["schedule_status"],
    "section_schedules_assigned_teacher_index": ["assigned_teacher_id"]
  },
  "foreign_keys": {
    "section_schedules_section_id_foreign": {
      "column": "section_id",
      "references": "sections.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "section_schedules_department_id_foreign": {
      "column": "department_id",
      "references": "departments.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "section_schedules_semester_id_foreign": {
      "column": "semester_id",
      "references": "semesters.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "section_schedules_assigned_teacher_id_foreign": {
      "column": "assigned_teacher_id",
      "references": "teachers.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "section_schedules_classroom_id_foreign": {
      "column": "classroom_id",
      "references": "classrooms.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

### System Module Extensions

#### system_settings Table

#### Purpose
Store global application configuration and system-wide settings.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| key | varchar(100) | NO | - | Setting key (unique identifier) |
| value | longtext | YES | NULL | Setting value (JSON, string, number, etc.) |
| type | enum | NO | 'string' | Value type (string, number, boolean, json) |
| description | text | YES | NULL | Setting description |
| category | varchar(50) | NO | 'general' | Setting category (general, email, backup, etc.) |
| is_public | boolean | NO | false | Whether setting is publicly accessible |
| validation_rules | json | YES | NULL | Validation rules for the setting |
| updated_by | bigint unsigned | YES | NULL | Foreign key to users who last updated |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "system_settings",
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
    "key": {
      "type": "varchar(100)",
      "nullable": false,
      "description": "Setting key (unique identifier)"
    },
    "value": {
      "type": "longtext",
      "nullable": true,
      "description": "Setting value (JSON, string, number, etc.)"
    },
    "type": {
      "type": "enum",
      "nullable": false,
      "default": "string",
      "values": ["string", "number", "boolean", "json"],
      "description": "Value type"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Setting description"
    },
    "category": {
      "type": "varchar(50)",
      "nullable": false,
      "default": "general",
      "description": "Setting category"
    },
    "is_public": {
      "type": "boolean",
      "nullable": false,
      "default": false,
      "description": "Whether setting is publicly accessible"
    },
    "validation_rules": {
      "type": "json",
      "nullable": true,
      "description": "Validation rules for the setting"
    },
    "updated_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who last updated"
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
    "system_settings_key_unique": ["key"],
    "system_settings_category_index": ["category"],
    "system_settings_is_public_index": ["is_public"]
  },
  "foreign_keys": {
    "system_settings_updated_by_foreign": {
      "column": "updated_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### backup_jobs Table

#### Purpose
Track database backup operations and their status.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| backup_type | enum | NO | 'full' | Backup type (full, incremental, differential) |
| initiated_by | bigint unsigned | YES | NULL | Foreign key to users who initiated backup |
| file_path | varchar(500) | YES | NULL | Path to backup file |
| file_size | bigint unsigned | YES | NULL | Backup file size in bytes |
| status | enum | NO | 'pending' | Backup status (pending, running, completed, failed, cancelled) |
| started_at | timestamp | YES | NULL | When backup process started |
| completed_at | timestamp | YES | NULL | When backup process completed |
| duration_seconds | int unsigned | YES | NULL | Total backup duration |
| error_message | text | YES | NULL | Error message if backup failed |
| tables_count | int unsigned | YES | NULL | Number of tables backed up |
| records_count | bigint unsigned | YES | NULL | Total records backed up |
| compression_ratio | decimal(5,2) | YES | NULL | Compression ratio achieved |
| is_automatic | boolean | NO | false | Whether backup was automatic |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "backup_jobs",
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
    "backup_type": {
      "type": "enum",
      "nullable": false,
      "default": "full",
      "values": ["full", "incremental", "differential"],
      "description": "Backup type"
    },
    "initiated_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who initiated backup"
    },
    "file_path": {
      "type": "varchar(500)",
      "nullable": true,
      "description": "Path to backup file"
    },
    "file_size": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Backup file size in bytes"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "pending",
      "values": ["pending", "running", "completed", "failed", "cancelled"],
      "description": "Backup status"
    },
    "started_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When backup process started"
    },
    "completed_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When backup process completed"
    },
    "duration_seconds": {
      "type": "int unsigned",
      "nullable": true,
      "description": "Total backup duration"
    },
    "error_message": {
      "type": "text",
      "nullable": true,
      "description": "Error message if backup failed"
    },
    "tables_count": {
      "type": "int unsigned",
      "nullable": true,
      "description": "Number of tables backed up"
    },
    "records_count": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Total records backed up"
    },
    "compression_ratio": {
      "type": "decimal(5,2)",
      "nullable": true,
      "description": "Compression ratio achieved"
    },
    "is_automatic": {
      "type": "boolean",
      "nullable": false,
      "default": false,
      "description": "Whether backup was automatic"
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
    "backup_jobs_status_index": ["status"],
    "backup_jobs_initiated_by_index": ["initiated_by"],
    "backup_jobs_created_at_index": ["created_at"],
    "backup_jobs_is_automatic_index": ["is_automatic"]
  },
  "foreign_keys": {
    "backup_jobs_initiated_by_foreign": {
      "column": "initiated_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### notifications Table

#### Purpose
Manage system notifications and user alerts.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | YES | NULL | Foreign key to users (NULL for system-wide) |
| title | varchar(255) | NO | - | Notification title |
| message | text | NO | - | Notification message |
| type | enum | NO | 'info' | Notification type (info, success, warning, error) |
| category | varchar(50) | YES | NULL | Notification category (schedule, system, deadline, etc.) |
| is_read | boolean | NO | false | Whether notification has been read |
| read_at | timestamp | YES | NULL | When notification was read |
| action_url | varchar(500) | YES | NULL | URL for notification action |
| action_text | varchar(100) | YES | NULL | Text for action button |
| expires_at | timestamp | YES | NULL | When notification expires |
| priority | enum | NO | 'normal' | Priority level (low, normal, high, urgent) |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "notifications",
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
      "nullable": true,
      "description": "Foreign key to users (NULL for system-wide)"
    },
    "title": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Notification title"
    },
    "message": {
      "type": "text",
      "nullable": false,
      "description": "Notification message"
    },
    "type": {
      "type": "enum",
      "nullable": false,
      "default": "info",
      "values": ["info", "success", "warning", "error"],
      "description": "Notification type"
    },
    "category": {
      "type": "varchar(50)",
      "nullable": true,
      "description": "Notification category"
    },
    "is_read": {
      "type": "boolean",
      "nullable": false,
      "default": false,
      "description": "Whether notification has been read"
    },
    "read_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When notification was read"
    },
    "action_url": {
      "type": "varchar(500)",
      "nullable": true,
      "description": "URL for notification action"
    },
    "action_text": {
      "type": "varchar(100)",
      "nullable": true,
      "description": "Text for action button"
    },
    "expires_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When notification expires"
    },
    "priority": {
      "type": "enum",
      "nullable": false,
      "default": "normal",
      "values": ["low", "normal", "high", "urgent"],
      "description": "Priority level"
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
    "notifications_user_id_index": ["user_id"],
    "notifications_is_read_index": ["is_read"],
    "notifications_type_index": ["type"],
    "notifications_priority_index": ["priority"],
    "notifications_expires_at_index": ["expires_at"]
  },
  "foreign_keys": {
    "notifications_user_id_foreign": {
      "column": "user_id",
      "references": "users.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### audit_trail Table

#### Purpose
Track all data changes for audit and compliance purposes.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | YES | NULL | Foreign key to users who made the change |
| table_name | varchar(100) | NO | - | Name of the affected table |
| record_id | bigint unsigned | NO | - | ID of the affected record |
| action | enum | NO | 'create' | Action performed (create, update, delete) |
| old_values | json | YES | NULL | Previous values (for update/delete) |
| new_values | json | YES | NULL | New values (for create/update) |
| changed_fields | json | YES | NULL | List of changed field names |
| ip_address | varchar(45) | YES | NULL | IP address of the request |
| user_agent | text | YES | NULL | User agent string |
| created_at | timestamp | NO | CURRENT_TIMESTAMP | When the change was made |

#### JSON Structure
```json
{
  "table": "audit_trail",
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
      "nullable": true,
      "description": "Foreign key to users who made the change"
    },
    "table_name": {
      "type": "varchar(100)",
      "nullable": false,
      "description": "Name of the affected table"
    },
    "record_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "ID of the affected record"
    },
    "action": {
      "type": "enum",
      "nullable": false,
      "default": "create",
      "values": ["create", "update", "delete"],
      "description": "Action performed"
    },
    "old_values": {
      "type": "json",
      "nullable": true,
      "description": "Previous values (for update/delete)"
    },
    "new_values": {
      "type": "json",
      "nullable": true,
      "description": "New values (for create/update)"
    },
    "changed_fields": {
      "type": "json",
      "nullable": true,
      "description": "List of changed field names"
    },
    "ip_address": {
      "type": "varchar(45)",
      "nullable": true,
      "description": "IP address of the request"
    },
    "user_agent": {
      "type": "text",
      "nullable": true,
      "description": "User agent string"
    },
    "created_at": {
      "type": "timestamp",
      "nullable": false,
      "description": "When the change was made"
    }
  },
  "indexes": {
    "primary": ["id"],
    "audit_trail_user_id_index": ["user_id"],
    "audit_trail_table_record_index": ["table_name", "record_id"],
    "audit_trail_action_index": ["action"],
    "audit_trail_created_at_index": ["created_at"]
  },
  "foreign_keys": {
    "audit_trail_user_id_foreign": {
      "column": "user_id",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### api_keys Table

#### Purpose
Manage API keys for third-party integrations.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | - | API key name/description |
| key_hash | varchar(255) | NO | - | Hashed API key |
| key_prefix | varchar(20) | NO | - | First few characters of key for identification |
| permissions | json | NO | - | Array of allowed permissions/endpoints |
| rate_limit | int unsigned | YES | NULL | Requests per minute limit |
| last_used_at | timestamp | YES | NULL | When key was last used |
| expires_at | timestamp | YES | NULL | When key expires |
| is_active | boolean | NO | true | Whether key is currently active |
| created_by | bigint unsigned | NO | - | Foreign key to users who created key |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "api_keys",
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
      "description": "API key name/description"
    },
    "key_hash": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Hashed API key"
    },
    "key_prefix": {
      "type": "varchar(20)",
      "nullable": false,
      "description": "First few characters of key for identification"
    },
    "permissions": {
      "type": "json",
      "nullable": false,
      "description": "Array of allowed permissions/endpoints"
    },
    "rate_limit": {
      "type": "int unsigned",
      "nullable": true,
      "description": "Requests per minute limit"
    },
    "last_used_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When key was last used"
    },
    "expires_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When key expires"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether key is currently active"
    },
    "created_by": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to users who created key"
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
    "api_keys_key_hash_unique": ["key_hash"],
    "api_keys_prefix_unique": ["key_prefix"],
    "api_keys_is_active_index": ["is_active"],
    "api_keys_expires_at_index": ["expires_at"]
  },
  "foreign_keys": {
    "api_keys_created_by_foreign": {
      "column": "created_by",
      "references": "users.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    }
  }
}
```

#### email_templates Table

#### Purpose
Store customizable email templates for system notifications.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(100) | NO | - | Template name (unique identifier) |
| subject | varchar(255) | NO | - | Email subject line |
| html_content | longtext | NO | - | HTML email content |
| text_content | longtext | YES | NULL | Plain text email content |
| variables | json | YES | NULL | Available template variables |
| category | varchar(50) | NO | 'general' | Template category |
| is_active | boolean | NO | true | Whether template is currently active |
| created_by | bigint unsigned | YES | NULL | Foreign key to users who created template |
| updated_by | bigint unsigned | YES | NULL | Foreign key to users who last updated |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "email_templates",
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
      "description": "Template name (unique identifier)"
    },
    "subject": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Email subject line"
    },
    "html_content": {
      "type": "longtext",
      "nullable": false,
      "description": "HTML email content"
    },
    "text_content": {
      "type": "longtext",
      "nullable": true,
      "description": "Plain text email content"
    },
    "variables": {
      "type": "json",
      "nullable": true,
      "description": "Available template variables"
    },
    "category": {
      "type": "varchar(50)",
      "nullable": false,
      "default": "general",
      "description": "Template category"
    },
    "is_active": {
      "type": "boolean",
      "nullable": false,
      "default": true,
      "description": "Whether template is currently active"
    },
    "created_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who created template"
    },
    "updated_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to users who last updated"
    },
    "created_at": {
      "type": "timestamp",
      "nullable": true",
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
    "email_templates_name_unique": ["name"],
    "email_templates_category_index": ["category"],
    "email_templates_is_active_index": ["is_active"]
  },
  "foreign_keys": {
    "email_templates_created_by_foreign": {
      "column": "created_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "email_templates_updated_by_foreign": {
      "column": "updated_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### system_health Table

#### Purpose
Monitor system health and performance metrics.

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| metric_name | varchar(100) | NO | - | Health metric name |
| metric_value | decimal(10,2) | YES | NULL | Metric value |
| status | enum | NO | 'healthy' | Health status (healthy, warning, critical) |
| threshold_min | decimal(10,2) | YES | NULL | Minimum acceptable value |
| threshold_max | decimal(10,2) | YES | NULL | Maximum acceptable value |
| unit | varchar(20) | YES | NULL | Unit of measurement |
| description | text | YES | NULL | Metric description |
| checked_at | timestamp | NO | CURRENT_TIMESTAMP | When metric was checked |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure
```json
{
  "table": "system_health",
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
    "metric_name": {
      "type": "varchar(100)",
      "nullable": false,
      "description": "Health metric name"
    },
    "metric_value": {
      "type": "decimal(10,2)",
      "nullable": true,
      "description": "Metric value"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "healthy",
      "values": ["healthy", "warning", "critical"],
      "description": "Health status"
    },
    "threshold_min": {
      "type": "decimal(10,2)",
      "nullable": true,
      "description": "Minimum acceptable value"
    },
    "threshold_max": {
      "type": "decimal(10,2)",
      "nullable": true,
      "description": "Maximum acceptable value"
    },
    "unit": {
      "type": "varchar(20)",
      "nullable": true,
      "description": "Unit of measurement"
    },
    "description": {
      "type": "text",
      "nullable": true,
      "description": "Metric description"
    },
    "checked_at": {
      "type": "timestamp",
      "nullable": false,
      "description": "When metric was checked"
    },
    "created_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "Record creation timestamp"
    },
    "updated_at": {
      "type": "timestamp",
      "nullable": true",
      "description": "Record update timestamp"
    }
  },
  "indexes": {
    "primary": ["id"],
    "system_health_metric_name_index": ["metric_name"],
    "system_health_status_index": ["status"],
    "system_health_checked_at_index": ["checked_at"]
  },
  "foreign_keys": {}
}
```

## Data Entities Identified

- **Users**: Extended Laravel users table with Spatie role-based access for teachers, faculty staff, and dean (created separately from teacher profiles)
- **Teachers**: Profile information for instructors with email, can exist without user account
- **Subjects**: Course/subject catalog with unit information
- **Semesters**: Academic semester definitions (e.g., First Semester 2024-2025)
- **TimeSlots**: Time slot definitions (e.g., 7:00 AM - 9:00 AM)
- **Schedules**: Subject assigned to specific time slot, day, and semester
- **DraftSchedules**: Teacher-proposed schedule assignments pending faculty review
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

### DraftScheduleStatus Enum

**File**: `app/Enums/DraftScheduleStatus.php`

**Values**:
- `DRAFT` = 'draft' - Initial draft state, teacher has proposed the schedule
- `PENDING_REVIEW` = 'pending_review' - Submitted for faculty review
- `APPROVED` = 'approved' - Faculty has approved the draft
- `REJECTED` = 'rejected' - Faculty has rejected the draft

**Used in**: `draft_schedules.status`

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

- **Users** → **Teachers**: One-to-Optional (teacher profiles can exist without users, users can be linked later)
- **Teachers** → **TeacherAssignments**: One-to-Many (one teacher has many assignments)
- **Teachers** → **DraftSchedules**: One-to-Many (one teacher can create many draft schedules)
- **Subjects** → **Schedules**: One-to-Many (one subject can have multiple schedule instances)
- **Semesters** → **Schedules**: One-to-Many (one semester has many schedules)
- **TimeSlots** → **Schedules**: One-to-Many (one time slot can be used by multiple schedules)
- **Schedules** → **DraftSchedules**: One-to-Many (one schedule can have multiple draft proposals)
- **Schedules** → **TeacherAssignments**: One-to-One (one schedule assigned to one teacher)
- **DraftSchedules** → **TeacherAssignments**: One-to-Optional (approved draft becomes a teacher assignment)
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

- **Relationship Type**: One-to-Optional
- **Foreign Key**: teachers.user_id → users.id (nullable)
- **Cascade Rules**: ON DELETE SET NULL (preserve teacher profile if user deleted)
- **Business Rule**: Teacher profiles can exist without user accounts; user accounts can be linked later
- **Query Pattern**: Join to get teacher profile when user logs in; find teachers without user accounts

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
Store detailed profile information for instructors including employment details and contact information. Teacher profiles can exist independently of user accounts.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | YES | NULL | Foreign key to users table (optional) |
| email | varchar(255) | NO | - | Teacher email address (unique) |
| first_name | varchar(255) | NO | - | Teacher first name |
| last_name | varchar(255) | NO | - | Teacher last name |
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
      "nullable": true,
      "description": "Foreign key to users table (optional)"
    },
    "email": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Teacher email address (unique)"
    },
    "first_name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Teacher first name"
    },
    "last_name": {
      "type": "varchar(255)",
      "nullable": false,
      "description": "Teacher last name"
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
    "teachers_email_unique": ["email"],
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
- **Unique**: user_id (when not null), email, employee_id
- **Regular**: is_active (for filtering active teachers)

#### Foreign Keys
- teachers_user_id_foreign: user_id → users.id

#### Business Rules
- employee_id must be unique across all teachers
- email must be unique across all teachers
- A user can only have one teacher profile
- A teacher can exist without a user account
- Soft delete through is_active flag instead of hard delete

#### Access Patterns
- **Read**: 
  - By user_id (when teacher logs in)
  - By email (for teacher lookup)
  - By is_active (for dropdown lists)
  - By department (for departmental reports)
- **Write**: 
  - Insert during teacher registration (without user account)
  - Update for profile changes
  - Update user_id when account is created
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

### draft_schedules Table

#### Purpose
Allow teachers to propose schedule assignments for themselves that require faculty review and approval before becoming active.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| teacher_id | bigint unsigned | NO | - | Foreign key to teachers (who proposed the draft) |
| schedule_id | bigint unsigned | NO | - | Foreign key to schedules (the schedule being proposed) |
| status | enum | NO | 'draft' | Draft status (draft, pending_review, approved, rejected) |
| notes | text | YES | NULL | Teacher notes or justification for the proposal |
| reviewed_by | bigint unsigned | YES | NULL | User who reviewed the draft (faculty staff/dean) |
| reviewed_at | timestamp | YES | NULL | When the draft was reviewed |
| review_comments | text | YES | NULL | Comments from the reviewer |
| submitted_at | timestamp | YES | NULL | When the draft was submitted for review |
| teacher_assignment_id | bigint unsigned | YES | NULL | Foreign key to teacher_assignments (if approved) |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

#### JSON Structure

```json
{
  "table": "draft_schedules",
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
      "description": "Foreign key to teachers (who proposed the draft)"
    },
    "schedule_id": {
      "type": "bigint unsigned",
      "nullable": false,
      "description": "Foreign key to schedules (the schedule being proposed)"
    },
    "status": {
      "type": "enum",
      "nullable": false,
      "default": "draft",
      "values": ["draft", "pending_review", "approved", "rejected"],
      "description": "Draft status"
    },
    "notes": {
      "type": "text",
      "nullable": true,
      "description": "Teacher notes or justification for the proposal"
    },
    "reviewed_by": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "User who reviewed the draft (faculty staff/dean)"
    },
    "reviewed_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When the draft was reviewed"
    },
    "review_comments": {
      "type": "text",
      "nullable": true,
      "description": "Comments from the reviewer"
    },
    "submitted_at": {
      "type": "timestamp",
      "nullable": true,
      "description": "When the draft was submitted for review"
    },
    "teacher_assignment_id": {
      "type": "bigint unsigned",
      "nullable": true,
      "description": "Foreign key to teacher_assignments (if approved)"
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
    "draft_schedules_teacher_id_index": ["teacher_id"],
    "draft_schedules_schedule_id_index": ["schedule_id"],
    "draft_schedules_status_index": ["status"],
    "draft_schedules_teacher_assignment_id_unique": ["teacher_assignment_id"]
  },
  "foreign_keys": {
    "draft_schedules_teacher_id_foreign": {
      "column": "teacher_id",
      "references": "teachers.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "draft_schedules_schedule_id_foreign": {
      "column": "schedule_id",
      "references": "schedules.id",
      "on_delete": "CASCADE",
      "on_update": "CASCADE"
    },
    "draft_schedules_reviewed_by_foreign": {
      "column": "reviewed_by",
      "references": "users.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    },
    "draft_schedules_teacher_assignment_id_foreign": {
      "column": "teacher_assignment_id",
      "references": "teacher_assignments.id",
      "on_delete": "SET_NULL",
      "on_update": "CASCADE"
    }
  }
}
```

#### Indexes
- **Primary**: id
- **Regular**: teacher_id, schedule_id, status
- **Unique**: teacher_assignment_id (one draft can become at most one assignment)

#### Foreign Keys
- draft_schedules_teacher_id_foreign: teacher_id → teachers.id
- draft_schedules_schedule_id_foreign: schedule_id → schedules.id
- draft_schedules_reviewed_by_foreign: reviewed_by → users.id
- draft_schedules_teacher_assignment_id_foreign: teacher_assignment_id → teacher_assignments.id

#### Business Rules
- Teachers can only create drafts for schedules in the current or upcoming semester
- A teacher can have multiple draft proposals but only one pending approval per schedule
- Conflict detection should be performed before approving a draft
- Approved drafts automatically create a teacher_assignment record
- Rejected drafts can be modified and resubmitted
- Audit trail via submitted_at, reviewed_at, reviewed_by, and review_comments

#### Access Patterns
- **Read**: 
  - By teacher_id (teacher's draft proposals)
  - By status (filter pending reviews)
  - By schedule_id (all drafts for a specific schedule)
- **Write**: 
  - Insert when teacher creates a draft
  - Update when teacher submits for review
  - Update when faculty approves/rejects

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
- draft_schedules.teacher_assignment_id: One draft can become at most one assignment
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
- draft_schedules.status: 'draft'
- teacher_assignments.is_active: true
- attendance_records.status: 'pending'
- roles.is_active: true (after migration to add column)

### Nullable Rules
- teachers.department, rank, date_hired, phone, address: Nullable (not all information required)
- subjects.description: Nullable (optional detail)
- schedules.room, section: Nullable (not always assigned)
- draft_schedules.notes, reviewed_by, reviewed_at, review_comments, submitted_at, teacher_assignment_id: Nullable (optional fields)
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
7. **draft_schedules** (Depends on: teachers, schedules)
8. **teacher_assignments** (Depends on: teachers, schedules)
9. **attendance_records** (Depends on: teacher_assignments)

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

## Schema Evolution: Multi-Day Schedule Support

### Overview
The system has evolved to support schedules with 1 to 3 days per subject assignment. This section documents both the previous and new schemas, along with implementation plans for migration.

---

## Previous Schema (Single Day Per Schedule)

### schedules Table - Single Day Version

#### Purpose
Assign subjects to specific time slots, a single day, and semesters to create class sessions.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| time_slot_id | bigint unsigned | NO | - | Foreign key to time_slots |
| day_of_week | enum | NO | 'monday' | Single day of the week |
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
      "description": "Single day of the week"
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

#### Implementation Plan for Previous Schema

**Phase 1: Migration Creation**
1. Create migration: `2024_01_01_000000_create_schedules_table.php`
2. Add columns: id, subject_id, semester_id, time_slot_id, day_of_week, room, section, is_active, timestamps
3. Add indexes: primary, foreign key indexes, composite conflict detection index
4. Add foreign key constraints with proper cascade rules

**Phase 2: Model Creation**
1. Create Schedule model with fillable fields
2. Define relationships: subject, semester, timeSlot, teacherAssignment
3. Add casts for JSON fields (if any)
4. Add validation rules in FormRequest

**Phase 3: DTO Creation**
1. Create ScheduleData DTO with single day_of_week field
2. Add validation: day_of_week required, must be valid enum value
3. Add fromArray and toArray methods

**Phase 4: Repository & Service**
1. Create ScheduleRepositoryInterface
2. Create ScheduleRepository with conflict detection logic
3. Create ScheduleService with business logic
4. Bind in RepositoryServiceProvider

**Phase 5: UI Implementation**
1. Create schedule list page with day display
2. Create schedule create/edit form with single day dropdown
3. Add conflict detection alerts on form submission
4. Integrate with sidebar and routes

**Phase 6: Testing**
1. Write unit tests for model relationships
2. Write feature tests for CRUD operations
3. Write tests for conflict detection
4. Write integration tests for full workflow

---

## New Schema (Multi-Time Slot Per Schedule - 1 to 3 Time Slots)

### schedules Table - Multi-Time Slot Version

#### Purpose
Assign subjects to 1 to 3 time slots (each with a day), and semesters to create class sessions with flexible scheduling.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| subject_id | bigint unsigned | NO | - | Foreign key to subjects |
| semester_id | bigint unsigned | NO | - | Foreign key to semesters |
| time_slots | json | NO | - | JSON array of 1-3 time slot objects with day and time_slot_id |
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
    "time_slots": {
      "type": "json",
      "nullable": false,
      "description": "JSON array of 1-3 time slot objects with day and time_slot_id"
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
    }
  }
}
```

#### Time Slots JSON Format

The `time_slots` column stores an array of objects, each containing a day and time_slot_id:

```json
[
  {
    "day": "monday",
    "time_slot_id": 1
  },
  {
    "day": "wednesday",
    "time_slot_id": 1
  },
  {
    "day": "friday",
    "time_slot_id": 1
  }
]
```

**Constraints**:
- **Minimum**: 1 time slot object
- **Maximum**: 3 time slot objects
- **Valid day values**: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
- **time_slot_id**: Must reference existing time_slots.id
- **Unique combinations**: No duplicate (day, time_slot_id) combinations within the same schedule

**Examples**:
- Single time slot: `[{"day": "monday", "time_slot_id": 1}]`
- Two time slots: `[{"day": "monday", "time_slot_id": 1}, {"day": "wednesday", "time_slot_id": 2}]`
- Three time slots: `[{"day": "monday", "time_slot_id": 1}, {"day": "wednesday", "time_slot_id": 1}, {"day": "friday", "time_slot_id": 1}]`

#### Business Rules for Multi-Time Slot Schedules

1. **Time Slot Count Validation**: Must have 1 to 3 time slot objects (no more, no less)
2. **Unique Combinations**: No duplicate (day, time_slot_id) combinations within the same schedule
3. **Conflict Detection**: Check conflicts for each time slot object (day + time slot combination)
4. **Unit Load Calculation**: Same subject units apply regardless of time slot count (units are per subject, not per time slot)
5. **Attendance Generation**: Generate attendance records for each time slot object in the schedule

#### Conflict Detection Query (Multi-Time Slot)

```sql
-- Check for teacher conflicts across all time slots in a schedule
-- For each time slot in the JSON array, check if teacher has overlapping schedule
SELECT COUNT(*) as conflict_count
FROM teacher_assignments ta
JOIN schedules sch ON ta.schedule_id = sch.id
JOIN time_slots ts ON ts.id = JSON_UNQUOTE(JSON_EXTRACT(sch.time_slots, '$[*].time_slot_id'))
WHERE ta.teacher_id = :teacher_id
  AND ta.is_active = true
  AND sch.is_active = true
  AND sch.semester_id = :semester_id
  AND sch.id != :exclude_schedule_id
  AND (
    JSON_CONTAINS(sch.time_slots, JSON_OBJECT('day', :check_day, 'time_slot_id', :check_time_slot_id))
  )
  AND (
    (ts.start_time < :new_end_time AND ts.end_time > :new_start_time)
  );
```

**Application-Level Conflict Detection** (Recommended for clarity):
```php
// For each time slot in the new schedule
foreach ($newSchedule->time_slots as $timeSlot) {
    $conflict = Schedule::where('semester_id', $semesterId)
        ->whereHas('teacherAssignment', function($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })
        ->where('id', '!=', $excludeScheduleId)
        ->whereJsonContains('time_slots', [
            'day' => $timeSlot['day'],
            'time_slot_id' => $timeSlot['time_slot_id']
        ])
        ->whereExists(function($query) use ($timeSlot) {
            $query->select(DB::raw(1))
                ->from('time_slots')
                ->whereColumn('time_slots.id', DB::raw('JSON_UNQUOTE(JSON_EXTRACT(schedules.time_slots, "$.time_slot_id"))'))
                ->where('start_time', '<', $endTime)
                ->where('end_time', '>', $startTime);
        })
        ->exists();

    if ($conflict) {
        throw new ConflictException("Conflict detected on {$timeSlot['day']} at time slot {$timeSlot['time_slot_id']}");
    }
}
```

#### Attendance Generation Logic (Multi-Time Slot)

```sql
-- Insert attendance records for today's schedules (check all time slots in JSON)
INSERT INTO attendance_records (teacher_assignment_id, date, status, created_at, updated_at)
SELECT ta.id, CURDATE(), 'pending', NOW(), NOW()
FROM teacher_assignments ta
JOIN schedules sch ON ta.schedule_id = sch.id
WHERE ta.is_active = true
  AND sch.is_active = true
  AND JSON_CONTAINS(
    sch.time_slots,
    JSON_OBJECT('day', LOWER(DAYNAME(CURDATE())))
  )
  AND NOT EXISTS (
    SELECT 1 FROM attendance_records ar
    WHERE ar.teacher_assignment_id = ta.id
      AND ar.date = CURDATE()
  );
```

#### Implementation Plan for New Schema

**Phase 1: Migration from Previous to New Schema**
1. Create migration: `2024_01_02_000000_modify_schedules_table_to_multi_time_slot.php`
2. Add new column `time_slots` (json) after `semester_id`
3. Backfill existing data: Convert `day_of_week` and `time_slot_id` to JSON object array format
   ```php
   // In migration up()
   DB::statement('UPDATE schedules SET time_slots = JSON_ARRAY(JSON_OBJECT("day", day_of_week, "time_slot_id", time_slot_id))');
   ```
4. Remove old `day_of_week` and `time_slot_id` columns
5. Remove old composite index that included `time_slot_id`
6. Add application-level validation for time slot count (1-3)

**Phase 2: Model Updates**
1. Update Schedule model:
   - Remove `day_of_week` and `time_slot_id` from fillable
   - Add `time_slots` to fillable
   - Add cast: `protected $casts = ['time_slots' => 'array'];`
   - Add accessor methods:
     - `getTimeSlotsListAttribute()`: Returns formatted string of time slots
     - `getTimeSlotCountAttribute()`: Returns count of time slots
     - `getDaysAttribute()`: Returns array of day names
2. Update relationships:
   - Remove `timeSlot()` relationship (no longer single time slot)
   - Add `timeSlots()` relationship to load time slot details via JSON extraction
3. Add validation in FormRequest:
   ```php
   'time_slots' => 'required|array|min:1|max:3',
   'time_slots.*.day' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
   'time_slots.*.time_slot_id' => 'required|exists:time_slots,id',
   'time_slots' => function ($attribute, $value, $fail) {
       // Check for duplicate (day, time_slot_id) combinations
       $combinations = array_map(function($item) {
           return $item['day'] . '-' . $item['time_slot_id'];
       }, $value);
       if (count($combinations) !== count(array_unique($combinations))) {
           $fail('Duplicate time slot combinations are not allowed.');
       }
   },
   ```

**Phase 3: DTO Updates**
1. Update ScheduleData DTO:
   - Remove `day_of_week` and `time_slot_id` fields
   - Add `time_slots` field as array of objects with `day` and `time_slot_id`
   - Add validation: time_slots required, array, min 1, max 3, valid structure
2. Add helper methods:
   - `hasTimeSlot(string $day, int $timeSlotId)`: Check if specific time slot exists
   - `getTimeSlotCount()`: Return count of time slots
   - `getUniqueDays()`: Return array of unique days

**Phase 4: Repository Updates**
1. Update ScheduleRepository:
   - Modify conflict detection to iterate through each time slot object
   - Update queries to use `JSON_CONTAINS()` for time slot filtering
   - Add method: `getSchedulesByDayAndTimeSlot(string $day, int $timeSlotId, int $semesterId)`
   - Update method: `checkConflict(array $timeSlots, int $semesterId, int $excludeScheduleId = null)`
   - Add method: `getSchedulesForDay(string $day, int $semesterId)` for attendance generation
2. Add unit tests for JSON-based queries and conflict detection

**Phase 5: Service Updates**
1. Update ScheduleService:
   - Update conflict detection logic to iterate through time_slots array
   - Update validation to enforce 1-3 time slot rule
   - Add method: `validateTimeSlots(array $timeSlots)`
   - Update method: `checkTeacherConflicts(int $teacherId, array $timeSlots, int $semesterId, int $excludeScheduleId = null)`
2. Update business logic for unit load calculation (no change needed - units are per subject)

**Phase 6: UI Updates**
1. Update schedule list page:
   - Display all time slots in the schedule (e.g., "Mon 7-9AM, Wed 7-9AM, Fri 7-9AM")
   - Add time slot count badge
   - Show time slot details by fetching from time_slots table
2. Update schedule create/edit form:
   - Replace single day dropdown and time slot dropdown with dynamic multi-select
   - Allow adding 1-3 time slot combinations (day + time slot selector pairs)
   - Add validation: must select 1-3 time slot combinations
   - Show selected time slots as cards/chips with day and time range
   - Add real-time conflict detection for each selected time slot combination
   - Show conflict alerts indicating which specific (day, time_slot) has conflict
3. Update conflict detection alerts to show which specific day and time slot has conflict

**Phase 7: Testing**
1. Write unit tests for:
   - JSON casting and accessors
   - Time slot count validation (0 slots, 1 slot, 3 slots, 4+ slots)
   - Duplicate (day, time_slot_id) prevention
   - Conflict detection with multiple time slots
2. Write feature tests for:
   - Creating schedule with 1 time slot
   - Creating schedule with 2 time slots
   - Creating schedule with 3 time slots
   - Rejecting schedule with 0 time slots
   - Rejecting schedule with 4+ time slots
   - Rejecting schedule with duplicate (day, time_slot_id) combinations
   - Conflict detection across multiple time slots
3. Write integration tests for:
   - Full workflow from creation to attendance generation
   - Migration from old to new schema
4. Update existing tests that reference `day_of_week` or `time_slot_id` to use `time_slots`

**Phase 8: Rollback Plan**
1. Create rollback migration to revert to single time slot schema if needed:
   ```php
   // In migration down()
   // 1. Add back day_of_week and time_slot_id columns
   // 2. Extract first (day, time_slot_id) from time_slots JSON array
   // 3. Drop time_slots column
   // 4. Restore old indexes
   ```
2. Document rollback procedure

---

## Migration Strategy Summary

### Option A: In-Place Migration (Recommended)
- **Pros**: Single migration, minimal downtime, data preserved
- **Cons**: Requires careful testing, temporary data duplication during migration
- **Steps**: Add `time_slots` column → Backfill from `day_of_week` + `time_slot_id` → Remove old columns

### Option B: New Table with Data Copy
- **Pros**: Clean slate, can test new table before switching
- **Cons**: More complex, requires application changes to point to new table
- **Steps**: Create `schedules_v2` table → Copy data with transformation → Update models → Drop old table

### Option C: Feature Flag Approach
- **Pros**: Can roll back quickly, test with subset of users
- **Cons**: More complex code, maintains both schemas temporarily
- **Steps**: Add feature flag → Conditionally use old/new schema → Gradual rollout → Remove old code

**Recommended**: Option A (In-Place Migration) for this use case, as the change is straightforward and the application is still in development.

---

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

The schema supports all functional requirements including teacher registration, subject management, schedule assignment, conflict detection, unit load monitoring, attendance tracking with timestamps, and the new Draft Schedule module that allows teachers to propose schedules for faculty review and approval.
