<?php

namespace App\Repositories\Eloquent;

use App\Models\TeacherSchedule;
use App\Repositories\TeacherScheduleRepository;

class EloquentTeacherScheduleRepository implements TeacherScheduleRepository
{
    public function all(): iterable
    {
        return TeacherSchedule::all();
    }

    public function findById(int $id): ?TeacherSchedule
    {
        return TeacherSchedule::find($id);
    }

    public function create(array $data): TeacherSchedule
    {
        return TeacherSchedule::create($data);
    }

    public function update(int $id, array $data): TeacherSchedule
    {
        $teacherSchedule = $this->findById($id);
        $teacherSchedule->update($data);
        return $teacherSchedule;
    }

    public function delete(int $id): bool
    {
        $teacherSchedule = $this->findById($id);
        return $teacherSchedule->delete();
    }

    public function findByTeacherAndSemester(int $teacherId, int $semesterId): iterable
    {
        return TeacherSchedule::forTeacherSemester($teacherId, $semesterId)
                              ->orderBy('scheduled_date')
                              ->get();
    }

    public function findByDraftSchedule(int $draftScheduleId): iterable
    {
        return TeacherSchedule::where('draft_schedule_id', $draftScheduleId)
                              ->orderBy('scheduled_date')
                              ->get();
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return TeacherSchedule::betweenDates($startDate, $endDate)
                              ->orderBy('scheduled_date')
                              ->get();
    }

    public function findByStatus(string $status): iterable
    {
        return TeacherSchedule::where('status', $status)
                              ->orderBy('scheduled_date')
                              ->get();
    }

    public function deleteByDraftSchedule(int $draftScheduleId): bool
    {
        return TeacherSchedule::where('draft_schedule_id', $draftScheduleId)->delete() > 0;
    }
}
