<?php

namespace Database\Seeders;

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

        $this->command->info('Users seeded successfully:');
        $this->command->info('  - Faculty Admin: faculty.admin@example.com (password: password)');
        $this->command->info('  - Faculty Member: faculty.member@example.com (password: password)');
        $this->command->info('  - Teacher: teacher@example.com (password: password)');
    }
}
