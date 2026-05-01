<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Repositories\{
    AttendanceRecordRepository,
    SemesterRepository,
    ScheduleRepository,
    SubjectRepository,
    TeacherAssignmentRepository,
    TeacherRepository,
    TimeSlotRepository,
    UserRepository,
};

use App\Repositories\Eloquent\{
    EloquentAttendanceRecordRepository,
    EloquentSemesterRepository,
    EloquentScheduleRepository,
    EloquentSubjectRepository,
    EloquentTeacherAssignmentRepository,
    EloquentTeacherRepository,
    EloquentTimeSlotRepository,
    EloquentUserRepository,
};

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            UserRepository::class,
            EloquentUserRepository::class
        );

        $this->app->bind(
            TeacherRepository::class,
            EloquentTeacherRepository::class
        );

        $this->app->bind(
            SubjectRepository::class,
            EloquentSubjectRepository::class
        );

        $this->app->bind(
            SemesterRepository::class,
            EloquentSemesterRepository::class
        );

        $this->app->bind(
            TimeSlotRepository::class,
            EloquentTimeSlotRepository::class
        );

        $this->app->bind(
            ScheduleRepository::class,
            EloquentScheduleRepository::class
        );

        $this->app->bind(
            TeacherAssignmentRepository::class,
            EloquentTeacherAssignmentRepository::class
        );

        $this->app->bind(
            AttendanceRecordRepository::class,
            EloquentAttendanceRecordRepository::class
        );
    }
}
