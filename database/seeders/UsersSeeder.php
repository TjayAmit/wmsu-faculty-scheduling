<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Models\DraftSchedule;
use App\Models\RoomSchedule;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Keeps exactly 1 Faculty Admin and 1 Teacher for clean, focused demos.
     */
    public function run(): void
    {
        // 1. Single College of Education Faculty Administrator (Dean)
        $facultyAdmin = User::updateOrCreate(
            ['email' => 'faculty.admin@example.com'],
            [
                'name' => 'Dr. Lourdes Fernandez (COEd Dean)',
                'email' => 'faculty.admin@example.com',
                'password' => Hash::make('password'),
            ]
        );
        $facultyAdmin->syncRoles(['Faculty Admin', 'Faculty Staff']);

        // 2. Single College of Education Teacher (Prof. Juan Ibarra)
        $teacherUser = User::updateOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Juan Ibarra',
                'email' => 'teacher@example.com',
                'password' => Hash::make('password'),
            ]
        );
        $teacherUser->syncRoles(['Teacher']);

        $teacher = Teacher::updateOrCreate(
            ['employee_id' => 'COED-T001'],
            [
                'user_id' => $teacherUser->id,
                'email' => 'teacher@example.com',
                'first_name' => 'Juan',
                'middle_name' => 'Crisostomo',
                'last_name' => 'Ibarra',
                'employee_id' => 'COED-T001',
                'biometric_pin' => '1001',
                'department' => 'College of Education',
                'rank' => 'Instructor II',
                'employment_type' => EmploymentType::FULL_TIME->value,
                'date_hired' => '2021-08-01',
                'phone' => '(062) 991-1771',
                'address' => 'College of Education Building, WMSU Main Campus, Zamboanga City',
                'is_active' => true,
            ]
        );

        // 3. Clean up all other teachers and users to eliminate ambiguity during demos
        $otherTeacherIds = Teacher::where('employee_id', '!=', 'COED-T001')->pluck('id');

        if ($otherTeacherIds->isNotEmpty()) {
            TeacherSchedule::whereIn('teacher_id', $otherTeacherIds)->forceDelete();
            TeacherAssignment::whereIn('teacher_id', $otherTeacherIds)->forceDelete();
            DraftSchedule::whereIn('teacher_id', $otherTeacherIds)->forceDelete();
            
            // Clean up any other related tables referencing extra teachers
            DB::table('sections')->whereIn('adviser_id', $otherTeacherIds)->update(['adviser_id' => null]);
            DB::table('departments')->whereIn('head_id', $otherTeacherIds)->update(['head_id' => null]);
            DB::table('zkteco_attendance_logs')->whereIn('teacher_id', $otherTeacherIds)->delete();
            DB::table('teaching_histories')->whereIn('teacher_id', $otherTeacherIds)->delete();
            DB::table('leave_requests')->whereIn('teacher_id', $otherTeacherIds)->delete();
            DB::table('substitute_requests')->whereIn('requesting_teacher_id', $otherTeacherIds)
                ->orWhereIn('substitute_teacher_id', $otherTeacherIds)->delete();
            DB::table('schedule_conflicts')->whereIn('teacher_id', $otherTeacherIds)->delete();

            Teacher::whereIn('id', $otherTeacherIds)->forceDelete();
        }

        // Keep only standard users: Admin, Faculty Admin, and Teacher
        $keepEmails = [
            'admin@example.com',
            'faculty.admin@example.com',
            'teacher@example.com',
        ];

        $extraUserIds = User::whereNotIn('email', $keepEmails)->pluck('id');
        if ($extraUserIds->isNotEmpty()) {
            DB::table('attendance_records')->whereIn('recorded_by', $extraUserIds)->delete();
            DB::table('leave_requests')->whereIn('approved_by', $extraUserIds)->delete();
            DB::table('substitute_requests')->whereIn('approved_by', $extraUserIds)->delete();
            DB::table('schedule_conflicts')->whereIn('resolved_by', $extraUserIds)->delete();
            DB::table('draft_schedules')->whereIn('reviewed_by', $extraUserIds)->update(['reviewed_by' => $facultyAdmin->id]);
            DB::table('teacher_assignments')->whereIn('assigned_by', $extraUserIds)->update(['assigned_by' => $facultyAdmin->id]);
            
            User::whereIn('id', $extraUserIds)->forceDelete();
        }

        $this->command->info('Users seeded cleanly for demo:');
        $this->command->info('  1. Admin: admin@example.com (Role: Admin)');
        $this->command->info('  2. Faculty Admin: faculty.admin@example.com (Role: Faculty Admin & Staff)');
        $this->command->info('  3. Teacher: teacher@example.com (Role: Teacher, Profile: Prof. Juan Ibarra)');
    }
}
