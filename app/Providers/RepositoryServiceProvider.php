<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Repositories\{
    AttendanceRecordRepository,
    DraftScheduleRepository,
    SemesterRepository,
    ScheduleRepository,
    SubjectRepository,
    TeacherAssignmentRepository,
    TeacherRepository,
    TeacherScheduleRepository,
    TimeSlotRepository,
    UserRepository,
};

use App\Repositories\Eloquent\{
    EloquentAttendanceRecordRepository,
    EloquentDraftScheduleRepository,
    EloquentSemesterRepository,
    EloquentScheduleRepository,
    EloquentSubjectRepository,
    EloquentTeacherAssignmentRepository,
    EloquentTeacherRepository,
    EloquentTeacherScheduleRepository,
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

        $this->app->bind(
            DraftScheduleRepository::class,
            EloquentDraftScheduleRepository::class
        );

        $this->app->bind(
            TeacherScheduleRepository::class,
            EloquentTeacherScheduleRepository::class
        );
    }
}
