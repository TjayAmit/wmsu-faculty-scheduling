<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Faculty Admin User
        $facultyAdmin = User::firstOrCreate(
            ['email' => 'faculty.admin@example.com'],
            [
                'name' => 'Faculty Admin',
                'email' => 'faculty.admin@example.com',
                'password' => Hash::make('password'),
            ]
        );
        $facultyAdmin->assignRole('Faculty Admin');

        // Faculty Member User (using Faculty Staff role)
        $facultyMember = User::firstOrCreate(
            ['email' => 'faculty.member@example.com'],
            [
                'name' => 'Faculty Member',
                'email' => 'faculty.member@example.com',
                'password' => Hash::make('password'),
            ]
        );
        $facultyMember->assignRole('Faculty Staff');

        // Teacher User
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Teacher',
                'email' => 'teacher@example.com',
                'password' => Hash::make('password'),
            ]
        );
        $teacher->assignRole('Teacher');

        // Create Teacher record linked to the user
        Teacher::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'user_id' => $teacher->id,
                'email' => 'teacher@example.com',
                'first_name' => 'Sample',
                'last_name' => 'Teacher',
                'employee_id' => 'T-0001',
                'department' => 'College of Computing Studies',
                'rank' => 'Instructor',
                'employment_type' => 'full_time',
                'date_hired' => now(),
                'phone' => '(062) 992-2955',
                'address' => 'WMSU Main Campus, Zamboanga City',
                'is_active' => true,
            ]
        );

        $this->command->info('Users seeded successfully:');
        $this->command->info('  - Faculty Admin: faculty.admin@example.com (password: password)');
        $this->command->info('  - Faculty Member: faculty.member@example.com (password: password)');
        $this->command->info('  - Teacher: teacher@example.com (password: password)');
    }
}
