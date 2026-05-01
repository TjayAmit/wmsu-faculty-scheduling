<?php

namespace App\Observers;

use App\Models\DraftSchedule;
use App\Services\TeacherScheduleGenerationService;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class DraftScheduleObserver implements ShouldHandleEventsAfterCommit
{
    public function __construct(
        private TeacherScheduleGenerationService $generationService
    ) {}

    /**
     * Handle the DraftSchedule "created" event.
     */
    public function created(DraftSchedule $draftSchedule): void
    {
        //
    }

    /**
     * Handle the DraftSchedule "updated" event.
     */
    public function updated(DraftSchedule $draftSchedule): void
    {
        // Check if status was changed to approved
        if ($draftSchedule->wasChanged('status') && $draftSchedule->isApproved()) {
            $this->generateSchedules($draftSchedule);
        }
    }

    /**
     * Handle the DraftSchedule "deleted" event.
     */
    public function deleted(DraftSchedule $draftSchedule): void
    {
        // Teacher schedules will be automatically deleted due to CASCADE constraint
    }

    /**
     * Handle the DraftSchedule "restored" event.
     */
    public function restored(DraftSchedule $draftSchedule): void
    {
        // Regenerate schedules if the draft is restored and approved
        if ($draftSchedule->isApproved()) {
            $this->generateSchedules($draftSchedule);
        }
    }

    /**
     * Handle the DraftSchedule "force deleted" event.
     */
    public function forceDeleted(DraftSchedule $draftSchedule): void
    {
        // Teacher schedules will be automatically deleted due to CASCADE constraint
    }

    /**
     * Generate teacher schedules for an approved draft schedule.
     */
    private function generateSchedules(DraftSchedule $draftSchedule): void
    {
        try {
            $this->generationService->generateFromDraft($draftSchedule);
        } catch (\Exception $e) {
            // Log the error but don't fail the observer
            \Log::error('Failed to generate teacher schedules for draft ' . $draftSchedule->id, [
                'error' => $e->getMessage(),
                'draft_schedule_id' => $draftSchedule->id
            ]);
        }
    }
}
