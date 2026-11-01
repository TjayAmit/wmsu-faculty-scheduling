<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\TimeSlot;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Support\Collection;

class ClassroomAvailabilityService
{
    public const OP_START_HOUR = 7;   // 07:00 AM
    public const OP_END_HOUR = 19;    // 07:00 PM
    public const OP_START_MINUTES = 420;  // 7 * 60
    public const OP_END_MINUTES = 1140;   // 19 * 60
    public const DAILY_CAPACITY_MINUTES = 720; // 12 hours * 60
    public const DAILY_CAPACITY_HOURS = 12.0;

    public const OPERATIONAL_DAYS = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];

    /**
     * Calculate availability and schedule metrics for a single classroom.
     */
    public function calculateForClassroom(Classroom $classroom, ?Collection $timeSlots = null): array
    {
        if ($timeSlots === null) {
            $timeSlots = TimeSlot::active()->get()->keyBy('id');
        }

        $dailyStats = [];
        $totalBookedMinutes = 0;

        foreach (self::OPERATIONAL_DAYS as $day) {
            $intervals = [];

            if ($classroom->relationLoaded('schedules')) {
                $schedules = $classroom->schedules;
            } else {
                $schedules = $classroom->schedules()->where('is_active', true)->with('subject')->get();
            }

            foreach ($schedules as $schedule) {
                if (! $schedule->is_active || ! is_array($schedule->time_slots)) {
                    continue;
                }

                foreach ($schedule->time_slots as $slot) {
                    if (strtolower($slot['day'] ?? '') !== $day) {
                        continue;
                    }

                    $slotId = $slot['time_slot_id'] ?? null;
                    $slotModel = $slotId ? ($timeSlots[$slotId] ?? null) : null;
                    if (! $slotModel) {
                        continue;
                    }

                    $startStr = $slotModel->start_time instanceof DateTimeInterface
                        ? $slotModel->start_time->format('H:i')
                        : (string) $slotModel->start_time;

                    $endStr = $slotModel->end_time instanceof DateTimeInterface
                        ? $slotModel->end_time->format('H:i')
                        : (string) $slotModel->end_time;

                    if (str_contains($startStr, 'T')) {
                        $startStr = substr(explode('T', $startStr)[1], 0, 5);
                    } else {
                        $startStr = substr($startStr, 0, 5);
                    }

                    if (str_contains($endStr, 'T')) {
                        $endStr = substr(explode('T', $endStr)[1], 0, 5);
                    } else {
                        $endStr = substr($endStr, 0, 5);
                    }

                    $startMin = max(self::OP_START_MINUTES, $this->timeToMinutes($startStr));
                    $endMin = min(self::OP_END_MINUTES, $this->timeToMinutes($endStr));

                    if ($endMin > $startMin) {
                        $intervals[] = [
                            'start' => $startMin,
                            'end' => $endMin,
                            'start_time' => $startStr,
                            'end_time' => $endStr,
                            'subject_code' => $schedule->subject?->code,
                            'subject_title' => $schedule->subject?->title,
                            'section' => $schedule->section,
                            'schedule_id' => $schedule->id,
                        ];
                    }
                }
            }

            // Sort intervals chronologically
            usort($intervals, fn ($a, $b) => $a['start'] <=> $b['start']);

            // Merge contiguous or overlapping intervals
            $merged = [];
            foreach ($intervals as $iv) {
                if (empty($merged)) {
                    $merged[] = $iv;
                } else {
                    $last = &$merged[count($merged) - 1];
                    if ($iv['start'] <= $last['end']) {
                        $last['end'] = max($last['end'], $iv['end']);
                    } else {
                        $merged[] = $iv;
                    }
                }
            }

            $dayBookedMinutes = 0;
            foreach ($merged as $m) {
                $dayBookedMinutes += ($m['end'] - $m['start']);
            }
            $dayAvailableMinutes = max(0, self::DAILY_CAPACITY_MINUTES - $dayBookedMinutes);

            // Compute exact available / free time windows between 7:00 AM and 7:00 PM
            $freeWindows = [];
            $curr = self::OP_START_MINUTES;
            foreach ($merged as $m) {
                if ($m['start'] > $curr) {
                    $durationMins = $m['start'] - $curr;
                    $freeWindows[] = [
                        'start' => $this->minutesToTime($curr),
                        'end' => $this->minutesToTime($m['start']),
                        'duration_minutes' => $durationMins,
                        'duration_hours' => round($durationMins / 60, 1),
                        'formatted' => $this->formatTimeWindow($curr, $m['start']),
                    ];
                }
                $curr = max($curr, $m['end']);
            }
            if ($curr < self::OP_END_MINUTES) {
                $durationMins = self::OP_END_MINUTES - $curr;
                $freeWindows[] = [
                    'start' => $this->minutesToTime($curr),
                    'end' => $this->minutesToTime(self::OP_END_MINUTES),
                    'duration_minutes' => $durationMins,
                    'duration_hours' => round($durationMins / 60, 1),
                    'formatted' => $this->formatTimeWindow($curr, self::OP_END_MINUTES),
                ];
            }

            $totalBookedMinutes += $dayBookedMinutes;
            $dailyStats[$day] = [
                'day' => ucfirst($day),
                'booked_hours' => round($dayBookedMinutes / 60, 1),
                'available_hours' => round($dayAvailableMinutes / 60, 1),
                'utilization_rate' => round(($dayBookedMinutes / self::DAILY_CAPACITY_MINUTES) * 100, 1),
                'booked_intervals' => $intervals,
                'free_windows' => $freeWindows,
                'is_full' => $dayAvailableMinutes <= 60, // 1 hour or less available
            ];
        }

        $weeklyCapacityHours = self::DAILY_CAPACITY_HOURS * count(self::OPERATIONAL_DAYS); // 72 hrs
        $weeklyCapacityMinutes = self::DAILY_CAPACITY_MINUTES * count(self::OPERATIONAL_DAYS); // 4320 mins
        $weeklyBookedHours = round($totalBookedMinutes / 60, 1);
        $weeklyAvailableHours = round(($weeklyCapacityMinutes - $totalBookedMinutes) / 60, 1);
        $weeklyUtilization = round(($totalBookedMinutes / $weeklyCapacityMinutes) * 100, 1);

        $status = 'available';
        if ($weeklyUtilization >= 80 || $weeklyAvailableHours <= 8) {
            $status = 'full';
        } elseif ($weeklyUtilization >= 50) {
            $status = 'busy';
        } elseif ($weeklyUtilization >= 20) {
            $status = 'moderate';
        }

        return [
            'operating_hours' => '7:00 AM - 7:00 PM',
            'daily_capacity_hours' => self::DAILY_CAPACITY_HOURS,
            'weekly_capacity_hours' => $weeklyCapacityHours,
            'weekly_booked_hours' => $weeklyBookedHours,
            'weekly_available_hours' => $weeklyAvailableHours,
            'weekly_utilization_rate' => $weeklyUtilization,
            'status' => $status,
            'is_full' => $status === 'full',
            'daily' => $dailyStats,
        ];
    }

    /**
     * Convert "HH:MM" string to minutes from midnight.
     */
    protected function timeToMinutes(string $time): int
    {
        $parts = explode(':', $time);

        return ((int) $parts[0]) * 60 + ((int) ($parts[1] ?? 0));
    }

    /**
     * Convert minutes from midnight to "HH:MM" format.
     */
    protected function minutesToTime(int $minutes): string
    {
        $h = floor($minutes / 60);
        $m = $minutes % 60;

        return sprintf('%02d:%02d', $h, $m);
    }

    /**
     * Format time window into friendly 12-hour AM/PM label (e.g. "07:00 AM - 08:30 AM").
     */
    protected function formatTimeWindow(int $startMins, int $endMins): string
    {
        $startStr = $this->minutesToTime($startMins);
        $endStr = $this->minutesToTime($endMins);

        $startFormatted = date('g:i A', strtotime($startStr));
        $endFormatted = date('g:i A', strtotime($endStr));

        return "{$startFormatted} - {$endFormatted}";
    }
}
