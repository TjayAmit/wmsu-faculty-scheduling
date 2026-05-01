<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\UserRepositoryInterface::class,
            \App\Repositories\Eloquent\UserRepository::class
        );

        $this->app->bind(
            \App\Repositories\TeacherRepositoryInterface::class,
            \App\Repositories\Eloquent\TeacherRepository::class
        );

        $this->app->bind(
            \App\Repositories\SubjectRepositoryInterface::class,
            \App\Repositories\Eloquent\SubjectRepository::class
        );

        $this->app->bind(
            \App\Repositories\SemesterRepositoryInterface::class,
            \App\Repositories\Eloquent\SemesterRepository::class
        );

        $this->app->bind(
            \App\Repositories\TimeSlotRepositoryInterface::class,
            \App\Repositories\Eloquent\TimeSlotRepository::class
        );

        $this->app->bind(
            \App\Repositories\ScheduleRepositoryInterface::class,
            \App\Repositories\Eloquent\ScheduleRepository::class
        );

        $this->app->bind(
            \App\Repositories\TeacherAssignmentRepositoryInterface::class,
            \App\Repositories\Eloquent\TeacherAssignmentRepository::class
        );

        $this->app->bind(
            \App\Repositories\AttendanceRecordRepositoryInterface::class,
            \App\Repositories\Eloquent\AttendanceRecordRepository::class
        );
    }
}
