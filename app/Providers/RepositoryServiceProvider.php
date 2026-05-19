<?php

namespace App\Providers;

use App\Repositories\AttendanceRecordRepository;
use App\Repositories\ClassroomRepository;
use App\Repositories\CurriculumRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\DraftScheduleRepository;
use App\Repositories\Eloquent\EloquentAttendanceRecordRepository;
use App\Repositories\Eloquent\EloquentClassroomRepository;
use App\Repositories\Eloquent\EloquentCurriculumRepository;
use App\Repositories\Eloquent\EloquentDepartmentRepository;
use App\Repositories\Eloquent\EloquentDraftScheduleRepository;
use App\Repositories\Eloquent\EloquentFeatureFlagRepository;
use App\Repositories\Eloquent\EloquentLeaveRequestRepository;
use App\Repositories\Eloquent\EloquentProgramRepository;
use App\Repositories\Eloquent\EloquentRoomScheduleRepository;
use App\Repositories\Eloquent\EloquentScheduleRepository;
use App\Repositories\Eloquent\EloquentSectionRepository;
use App\Repositories\Eloquent\EloquentSemesterRepository;
use App\Repositories\Eloquent\EloquentSubjectRepository;
use App\Repositories\Eloquent\EloquentSubstituteRequestRepository;
use App\Repositories\Eloquent\EloquentTeacherAssignmentRepository;
use App\Repositories\Eloquent\EloquentTeacherHistoryRepository;
use App\Repositories\Eloquent\EloquentTeacherRepository;
use App\Repositories\Eloquent\EloquentTeacherScheduleRepository;
use App\Repositories\Eloquent\EloquentTeachingHistoryRepository;
use App\Repositories\Eloquent\EloquentTimeSlotRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Repositories\FeatureFlagRepository;
use App\Repositories\LeaveRequestRepository;
use App\Repositories\ProgramRepository;
use App\Repositories\RoomScheduleRepository;
use App\Repositories\ScheduleRepository;
use App\Repositories\SectionRepository;
use App\Repositories\SemesterRepository;
use App\Repositories\SubjectRepository;
use App\Repositories\SubstituteRequestRepository;
use App\Repositories\TeacherAssignmentRepository;
use App\Repositories\TeacherHistoryRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\TeacherScheduleRepository;
use App\Repositories\TeachingHistoryRepository;
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
            ClassroomRepository::class,
            EloquentClassroomRepository::class
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

        $this->app->bind(
            CurriculumRepository::class,
            EloquentCurriculumRepository::class
        );

        $this->app->bind(
            DepartmentRepository::class,
            EloquentDepartmentRepository::class
        );

        $this->app->bind(
            ProgramRepository::class,
            EloquentProgramRepository::class
        );

        $this->app->bind(
            RoomScheduleRepository::class,
            EloquentRoomScheduleRepository::class
        );

        $this->app->bind(
            TeachingHistoryRepository::class,
            EloquentTeachingHistoryRepository::class
        );

        $this->app->bind(
            SubstituteRequestRepository::class,
            EloquentSubstituteRequestRepository::class
        );

        $this->app->bind(
            LeaveRequestRepository::class,
            EloquentLeaveRequestRepository::class
        );

        $this->app->bind(
            SectionRepository::class,
            EloquentSectionRepository::class
        );

        $this->app->bind(
            TeacherHistoryRepository::class,
            EloquentTeacherHistoryRepository::class
        );

        $this->app->bind(
            FeatureFlagRepository::class,
            EloquentFeatureFlagRepository::class
        );
    }
}
