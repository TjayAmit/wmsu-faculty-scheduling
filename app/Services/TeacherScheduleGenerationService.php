<?php

namespace App\Services;

use App\DTOs\TeacherAssignmentData;
use App\DTOs\TeacherScheduleData;
use App\Enums\DayOfWeek;
use App\Models\DraftSchedule;
use App\Models\Semester;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Models\TimeSlot;
use App\Repositories\DraftScheduleRepository;
use App\Repositories\TeacherAssignmentRepository;
use App\Repositories\TeacherScheduleRepository;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeacherScheduleGenerationService
{
    public function __construct(
        private TeacherScheduleRepository $repository,
        private TeacherAssignmentRepository $teacherAssignmentRepository,
        private DraftScheduleRepository $draftScheduleRepository
    ) {}

    /**
     * Generate teacher schedules for an approved draft schedule.
     */
    public function generateFromDraft(DraftSchedule $draftSchedule): Collection
    {
        try {
            if (! $draftSchedule->isApproved()) {
                throw new \InvalidArgumentException('Draft schedule must be approved');
            }

            $schedules = null;
            $teacherAssignment = null;
            $semester = null;

            DB::transaction(function () use ($draftSchedule, &$schedules, &$teacherAssignment, &$semester) {
                $schedule = $draftSchedule->schedule;
                $semester = $schedule->semester;

                // Create TeacherAssignment if it doesn't exist
                if (! $draftSchedule->teacher_assignment_id) {
                    $teacherAssignment = $this->createTeacherAssignment($draftSchedule);
                    $this->draftScheduleRepository->update($draftSchedule->id, [
                        'teacher_assignment_id' => $teacherAssignment->id,
                    ]);
                } else {
                    $teacherAssignment = $draftSchedule->teacherAssignment;
                }

                $schedules = collect();

                foreach ($schedule->time_slots as $timeSlot) {
                    $dayOfWeek = DayOfWeek::from($timeSlot['day']);

                    // Get TimeSlot details if time_slot_id is provided
                    if (isset($timeSlot['time_slot_id'])) {
                        $timeSlotModel = TimeSlot::find($timeSlot['time_slot_id']);
                        if (! $timeSlotModel) {
                            throw new \InvalidArgumentException("Time slot with ID {$timeSlot['time_slot_id']} not found");
                        }
                        $startTime = $timeSlotModel->start_time->format('H:i');
                        $endTime = $timeSlotModel->end_time->format('H:i');
                    } else {
                        // Fallback to direct start_time/end_time if available
                        $startTime = $timeSlot['start_time'] ?? '09:00';
                        $endTime = $timeSlot['end_time'] ?? '11:00';
                    }

                    $sessionSchedules = $this->generateSessionsForDay(
                        $teacherAssignment,
                        $draftSchedule,
                        $semester,
                        $dayOfWeek,
                        $startTime,
                        $endTime,
                        $schedule->room,
                        $schedule->section
                    );

                    $schedules = $schedules->merge($sessionSchedules);
                }
            });

            // Log activity AFTER transaction commits to ensure data integrity
            $this->logActivity('generated_schedules', $draftSchedule, [
                'draft_schedule_id' => $draftSchedule->id,
                'schedules_count' => $schedules->count(),
                'semester' => $semester->name,
                'teacher' => $teacherAssignment->teacher->name,
                'subject' => $teacherAssignment->schedule->subject->name,
            ]);

            return $schedules;

        } catch (Exception $e) {
            Log::error('Schedule generation failed', [
                'draft_schedule_id' => $draftSchedule->id,
                'error' => $e->getMessage(),
                'service' => static::class,
            ]);

            throw new Exception('Failed to generate teacher schedules: '.$e->getMessage());
        }
    }

    /**
     * Create TeacherAssignment from approved DraftSchedule.
     */
    private function createTeacherAssignment(DraftSchedule $draftSchedule): TeacherAssignment
    {
        $data = new TeacherAssignmentData(
            teacher_id: $draftSchedule->teacher_id,
            schedule_id: $draftSchedule->schedule_id,
            assigned_at: now()->toDateTimeString(),
            assigned_by: $draftSchedule->reviewed_by, // User who approved the draft
            is_active: true,
        );

        return $this->teacherAssignmentRepository->create($data->toArray());
    }

    /**
     * Generate session schedules for a specific day of the week.
     */
    private function generateSessionsForDay(
        TeacherAssignment $teacherAssignment,
        DraftSchedule $draftSchedule,
        Semester $semester,
        DayOfWeek $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room,
        ?string $section
    ): Collection {
        $schedules = collect();

        $period = CarbonPeriod::create($semester->start_date, $semester->end_date);

        foreach ($period as $date) {
            if ($this->matchesDayOfWeek($date, $dayOfWeek)) {
                $teacherSchedule = $this->createTeacherSchedule(
                    $teacherAssignment,
                    $draftSchedule,
                    $semester,
                    $date,
                    $dayOfWeek,
                    $startTime,
                    $endTime,
                    $room,
                    $section
                );

                $schedules->push($teacherSchedule);
            }
        }

        return $schedules;
    }

    /**
     * Check if a date matches the given day of week.
     */
    private function matchesDayOfWeek(Carbon $date, DayOfWeek $dayOfWeek): bool
    {
        return match ($dayOfWeek) {
            DayOfWeek::MONDAY => $date->isMonday(),
            DayOfWeek::TUESDAY => $date->isTuesday(),
            DayOfWeek::WEDNESDAY => $date->isWednesday(),
            DayOfWeek::THURSDAY => $date->isThursday(),
            DayOfWeek::FRIDAY => $date->isFriday(),
            DayOfWeek::SATURDAY => $date->isSaturday(),
        };
    }

    /**
     * Create a teacher schedule record.
     */
    private function createTeacherSchedule(
        TeacherAssignment $teacherAssignment,
        DraftSchedule $draftSchedule,
        Semester $semester,
        Carbon $date,
        DayOfWeek $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room,
        ?string $section
    ): TeacherSchedule {
        // Check if date is a holiday (this could be enhanced with a holidays table)
        $isHoliday = $this->isHoliday($date);
        $holidayName = $isHoliday ? $this->getHolidayName($date) : null;

        $data = TeacherScheduleData::forGeneration(
            teacherAssignmentId: $teacherAssignment->id,
            draftScheduleId: $draftSchedule->id,
            subjectId: $teacherAssignment->schedule->subject_id,
            semesterId: $semester->id,
            teacherId: $teacherAssignment->teacher_id,
            scheduledDate: $date->format('Y-m-d'),
            dayOfWeek: $dayOfWeek->value,
            startTime: $startTime,
            endTime: $endTime,
            room: $room,
            section: $section,
            isHoliday: $isHoliday,
            holidayName: $holidayName,
        );

        return $this->repository->create($data->toArray());
    }

    /**
     * Check if a date is a holiday.
     * This is a basic implementation - could be enhanced with a holidays table.
     */
    private function isHoliday(Carbon $date): bool
    {
        // Basic holiday checks - this should be enhanced with a proper holidays table
        $holidays = [
            // Fixed dates
            '01-01', // New Year's Day
            '04-09', // Day of Valor
            '05-01', // Labor Day
            '06-12', // Independence Day
            '12-25', // Christmas Day
            '12-30', // Rizal Day
        ];

        $monthDay = $date->format('m-d');

        return in_array($monthDay, $holidays);
    }

    /**
     * Get holiday name for a date.
     */
    private function getHolidayName(Carbon $date): ?string
    {
        $holidayNames = [
            '01-01' => 'New Year\'s Day',
            '04-09' => 'Day of Valor',
            '05-01' => 'Labor Day',
            '06-12' => 'Independence Day',
            '12-25' => 'Christmas Day',
            '12-30' => 'Rizal Day',
        ];

        $monthDay = $date->format('m-d');

        return $holidayNames[$monthDay] ?? null;
    }

    /**
     * Regenerate schedules for a draft (useful for modifications).
     */
    public function regenerateFromDraft(DraftSchedule $draftSchedule): Collection
    {
        try {
            $schedules = null;

            DB::transaction(function () use ($draftSchedule, &$schedules) {
                // Delete existing schedules
                $this->repository->deleteByDraftSchedule($draftSchedule->id);

                // Generate new schedules
                $schedules = $this->generateFromDraft($draftSchedule);
            });

            // Log activity after successful regeneration
            $this->logActivity('regenerated_schedules', $draftSchedule, [
                'draft_schedule_id' => $draftSchedule->id,
                'schedules_count' => $schedules->count(),
            ]);

            return $schedules;

        } catch (Exception $e) {
            Log::error('Schedule regeneration failed', [
                'draft_schedule_id' => $draftSchedule->id,
                'error' => $e->getMessage(),
                'service' => static::class,
            ]);

            throw new Exception('Failed to regenerate teacher schedules: '.$e->getMessage());
        }
    }

    /**
     * Bulk generate schedules for multiple draft schedules.
     */
    public function bulkGenerate(array $draftScheduleIds): Collection
    {
        try {
            $allSchedules = null;

            DB::transaction(function () use ($draftScheduleIds, &$allSchedules) {
                $allSchedules = collect();

                foreach ($draftScheduleIds as $draftScheduleId) {
                    $draftSchedule = $this->draftScheduleRepository->findById($draftScheduleId);

                    if (! $draftSchedule) {
                        throw new \InvalidArgumentException("Draft schedule with ID {$draftScheduleId} not found");
                    }

                    if ($draftSchedule->isApproved()) {
                        $schedules = $this->generateFromDraft($draftSchedule);
                        $allSchedules = $allSchedules->merge($schedules);
                    }
                }
            });

            // Log activity after successful bulk generation
            $this->logActivity('bulk_generated_schedules', null, [
                'draft_schedule_ids' => $draftScheduleIds,
                'total_schedules_count' => $allSchedules->count(),
                'processed_drafts_count' => count($draftScheduleIds),
            ]);

            return $allSchedules;

        } catch (Exception $e) {
            Log::error('Bulk schedule generation failed', [
                'draft_schedule_ids' => $draftScheduleIds,
                'error' => $e->getMessage(),
                'service' => static::class,
            ]);

            throw new Exception('Failed to bulk generate teacher schedules: '.$e->getMessage());
        }
    }

    /**
     * Log activity for schedule generation operations.
     */
    private function logActivity(string $action, ?Model $model, array $data = []): void
    {
        $properties = [];

        // Set properties based on action type
        if (in_array($action, ['generated_schedules', 'regenerated_schedules', 'bulk_generated_schedules'])) {
            $properties = $data;
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model ?: (new class extends Model {})) // Use anonymous model if no model provided
            ->withProperties($properties)
            ->log("{$action} TeacherSchedule");
    }
}
