<?php

namespace App\Providers;

use App\Repositories\Eloquent\{
    EloquentAttendanceRecordRepository,
    EloquentClassroomRepository,
    EloquentCurriculumRepository,
    EloquentDepartmentRepository,
    EloquentDraftScheduleRepository,
    EloquentLeaveRequestRepository,
    EloquentScheduleRepository,
    EloquentSectionRepository,
    EloquentSemesterRepository,
    EloquentSubjectRepository,
    EloquentSubstituteRequestRepository,
    EloquentTeacherAssignmentRepository,
    EloquentTeacherRepository,
    EloquentTeacherScheduleRepository,
    EloquentTimeSlotRepository,
    EloquentUserRepository,
    EloquentProgramRepository,
    EloquentRoomScheduleRepository,
    EloquentTeachingHistoryRepository,
    EloquentTeacherHistoryRepository,
};

use App\Repositories\{
    AttendanceRecordRepository,
    ClassroomRepository,
    CurriculumRepository,
    DepartmentRepository,
    DraftScheduleRepository,
    LeaveRequestRepository,
    ScheduleRepository,
    SectionRepository,
    SemesterRepository,
    SubjectRepository,
    SubstituteRequestRepository,
    TeacherAssignmentRepository,
    TeacherRepository,
    TeacherScheduleRepository,
    TimeSlotRepository,
    UserRepository,
    ProgramRepository,
    RoomScheduleRepository,
    TeachingHistoryRepository,
    TeacherHistoryRepository,
};

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
    }
}
