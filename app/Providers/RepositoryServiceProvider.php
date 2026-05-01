<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\UserRepository::class,
            \App\Repositories\Eloquent\EloquentUserRepository::class
        );

        $this->app->bind(
            \App\Repositories\TeacherRepository::class,
            \App\Repositories\Eloquent\EloquentTeacherRepository::class
        );

        $this->app->bind(
            \App\Repositories\SubjectRepository::class,
            \App\Repositories\Eloquent\EloquentSubjectRepository::class
        );

        $this->app->bind(
            \App\Repositories\SemesterRepository::class,
            \App\Repositories\Eloquent\EloquentSemesterRepository::class
        );

        $this->app->bind(
            \App\Repositories\TimeSlotRepository::class,
            \App\Repositories\Eloquent\EloquentTimeSlotRepository::class
        );

        $this->app->bind(
            \App\Repositories\ScheduleRepository::class,
            \App\Repositories\Eloquent\EloquentScheduleRepository::class
        );

        $this->app->bind(
            \App\Repositories\TeacherAssignmentRepository::class,
            \App\Repositories\Eloquent\EloquentTeacherAssignmentRepository::class
        );

        $this->app->bind(
            \App\Repositories\AttendanceRecordRepository::class,
            \App\Repositories\Eloquent\EloquentAttendanceRecordRepository::class
        );
    }
}
