<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Subjects
            'subjects.view',
            'subjects.create',
            'subjects.edit',
            'subjects.delete',

            // Teachers
            'teachers.view',
            'teachers.create',
            'teachers.edit',
            'teachers.delete',

            // Semesters
            'semesters.view',
            'semesters.create',
            'semesters.edit',
            'semesters.delete',

            // Schedules
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.delete',

            // Time Slots
            'time_slots.view',
            'time_slots.create',
            'time_slots.edit',
            'time_slots.delete',

            // Teacher Assignments
            'teacher_assignments.view',
            'teacher_assignments.create',
            'teacher_assignments.edit',
            'teacher_assignments.delete',

            // Attendance Records
            'attendance_records.view',
            'attendance_records.create',
            'attendance_records.edit',
            'attendance_records.delete',

            // Activity Logs
            'activity_logs.view',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Admin - Full access to everything
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Faculty Admin - View all, actions on faculty data scheduling management, teachers profiles, view activity logs
        $facultyAdminRole = Role::firstOrCreate(['name' => 'Faculty Admin']);
        $facultyAdminRole->givePermissionTo([
            // Full access to scheduling management (Subjects, Schedules, Time Slots, Teacher Assignments)
            'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete',
            'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
            'time_slots.view', 'time_slots.create', 'time_slots.edit', 'time_slots.delete',
            'teacher_assignments.view', 'teacher_assignments.create', 'teacher_assignments.edit', 'teacher_assignments.delete',
            
            // Full access to teachers profiles
            'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete',
            
            // Full access to semesters
            'semesters.view', 'semesters.create', 'semesters.edit', 'semesters.delete',
            
            // View attendance records
            'attendance_records.view',
            
            // View activity logs only
            'activity_logs.view',
            
            // View users
            'users.view',
        ]);

        // Faculty Staff - Actions without delete in scheduling management and teacher profiles
        $facultyStaffRole = Role::firstOrCreate(['name' => 'Faculty Staff']);
        $facultyStaffRole->givePermissionTo([
            // Scheduling management without delete
            'subjects.view', 'subjects.create', 'subjects.edit',
            'schedules.view', 'schedules.create', 'schedules.edit',
            'time_slots.view', 'time_slots.create', 'time_slots.edit',
            'teacher_assignments.view', 'teacher_assignments.create', 'teacher_assignments.edit',
            
            // Teachers profiles without delete
            'teachers.view', 'teachers.create', 'teachers.edit',
            
            // View semesters
            'semesters.view',
            
            // View and manage attendance
            'attendance_records.view', 'attendance_records.create', 'attendance_records.edit',
        ]);

        // Teacher - View personal data only (subjects assigned, schedules, personal information)
        $teacherRole = Role::firstOrCreate(['name' => 'Teacher']);
        $teacherRole->givePermissionTo([
            'teachers.view', // Can view own profile
            'schedules.view', // Can view own schedules
            'subjects.view', // Can view assigned subjects
        ]);
    }
}
