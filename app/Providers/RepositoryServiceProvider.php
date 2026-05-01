<?php

namespace App\Providers;

use App\Repositories\AttendanceRecordRepository;
use App\Repositories\DraftScheduleRepository;
use App\Repositories\Eloquent\EloquentAttendanceRecordRepository;
use App\Repositories\Eloquent\EloquentDraftScheduleRepository;
use App\Repositories\Eloquent\EloquentScheduleRepository;
use App\Repositories\Eloquent\EloquentSemesterRepository;
use App\Repositories\Eloquent\EloquentSubjectRepository;
use App\Repositories\Eloquent\EloquentTeacherAssignmentRepository;
use App\Repositories\Eloquent\EloquentTeacherRepository;
use App\Repositories\Eloquent\EloquentTeacherScheduleRepository;
use App\Repositories\Eloquent\EloquentTimeSlotRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Repositories\ScheduleRepository;
use App\Repositories\SemesterRepository;
use App\Repositories\SubjectRepository;
use App\Repositories\TeacherAssignmentRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\TeacherScheduleRepository;
use App\Repositories\TimeSlotRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

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
