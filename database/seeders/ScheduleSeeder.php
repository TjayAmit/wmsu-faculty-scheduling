<?php

namespace Database\Seeders;

use App\Enums\DayOfWeek;
use App\Enums\DraftScheduleStatus;
use App\Models\Classroom;
use App\Models\DraftSchedule;
use App\Models\Holiday;
use App\Models\RoomSchedule;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TeacherSchedule;
use App\Models\TimeSlot;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemester = Semester::where('is_current', true)->first();

        if (! $currentSemester) {
            $this->command->warn('No active current semester found. Skipping schedule seeder.');
            return;
        }

        $adminUser = User::where('email', 'faculty.admin@example.com')->first()
            ?? User::where('email', 'admin@example.com')->first();

        // Fetch required time slots
        $p2 = TimeSlot::where('name', 'Period 2 (08:30 - 09:30)')->first();
        $p3 = TimeSlot::where('name', 'Period 3 (09:30 - 10:30)')->first();
        $p4 = TimeSlot::where('name', 'Period 4 (10:30 - 11:30)')->first();
        $tth1 = TimeSlot::where('name', 'TTh Block 1 (07:30 - 09:00)')->first();
        $tth2 = TimeSlot::where('name', 'TTh Block 2 (09:00 - 10:30)')->first();
        $tth3 = TimeSlot::where('name', 'TTh Block 3 (10:30 - 12:00)')->first();
        $labWed = TimeSlot::where('name', '3-Hour Afternoon Lab (13:00 - 16:00)')->first();

        if (! $p2 || ! $tth1) {
            $this->command->warn('Time slots not found. Please ensure TimeSlotSeeder runs before ScheduleSeeder.');
            return;
        }

        // Clean slate for demo consistency
        Schema::disableForeignKeyConstraints();
        DB::table('zkteco_attendance_logs')->truncate();
        TeacherSchedule::truncate();
        RoomSchedule::truncate();
        TeacherAssignment::truncate();
        DraftSchedule::truncate();
        Schedule::truncate();
        Schema::enableForeignKeyConstraints();

        // Defined course offerings: 3 assigned to Juan Ibarra + 3 unassigned (for assigning demo)
        $offerings = [
            // 1. Assigned to Juan Ibarra (MWF 08:30 - 09:30)
            [
                'subject_code' => 'EDUC 101',
                'section' => 'BEEd-1A',
                'room_number' => '101',
                'building' => 'Education Building',
                'teacher_email' => 'teacher@example.com',
                'slots' => [
                    ['day' => DayOfWeek::MONDAY->value, 'time_slot_id' => $p2->id, 'start' => $p2->start_time->format('H:i'), 'end' => $p2->end_time->format('H:i')],
                    ['day' => DayOfWeek::WEDNESDAY->value, 'time_slot_id' => $p2->id, 'start' => $p2->start_time->format('H:i'), 'end' => $p2->end_time->format('H:i')],
                    ['day' => DayOfWeek::FRIDAY->value, 'time_slot_id' => $p2->id, 'start' => $p2->start_time->format('H:i'), 'end' => $p2->end_time->format('H:i')],
                ],
                'notes' => 'The Child and Adolescent Learners and Learning Principles lecture.',
            ],

            // 2. Assigned to Juan Ibarra (MWF 09:30 - 10:30)
            [
                'subject_code' => 'EDUC 102',
                'section' => 'BEEd-1A',
                'room_number' => '101',
                'building' => 'Education Building',
                'teacher_email' => 'teacher@example.com',
                'slots' => [
                    ['day' => DayOfWeek::MONDAY->value, 'time_slot_id' => $p3->id, 'start' => $p3->start_time->format('H:i'), 'end' => $p3->end_time->format('H:i')],
                    ['day' => DayOfWeek::WEDNESDAY->value, 'time_slot_id' => $p3->id, 'start' => $p3->start_time->format('H:i'), 'end' => $p3->end_time->format('H:i')],
                    ['day' => DayOfWeek::FRIDAY->value, 'time_slot_id' => $p3->id, 'start' => $p3->start_time->format('H:i'), 'end' => $p3->end_time->format('H:i')],
                ],
                'notes' => 'Facilitating Learner-Centered Teaching lecture session.',
            ],

            // 3. Assigned to Juan Ibarra (TTh 07:30 - 09:00)
            [
                'subject_code' => 'EED 101',
                'section' => 'BEEd-2A',
                'room_number' => '102',
                'building' => 'Education Building',
                'teacher_email' => 'teacher@example.com',
                'slots' => [
                    ['day' => DayOfWeek::TUESDAY->value, 'time_slot_id' => $tth1->id, 'start' => $tth1->start_time->format('H:i'), 'end' => $tth1->end_time->format('H:i')],
                    ['day' => DayOfWeek::THURSDAY->value, 'time_slot_id' => $tth1->id, 'start' => $tth1->start_time->format('H:i'), 'end' => $tth1->end_time->format('H:i')],
                ],
                'notes' => 'Teaching English in Elementary Grades (Language Arts).',
            ],

            // 4. UNASSIGNED - EDUC 103 (Ready to assign during demo)
            [
                'subject_code' => 'EDUC 103',
                'section' => 'BEEd-1A',
                'room_number' => '102',
                'building' => 'Education Building',
                'teacher_email' => null,
                'slots' => [
                    ['day' => DayOfWeek::MONDAY->value, 'time_slot_id' => $p4->id, 'start' => $p4->start_time->format('H:i'), 'end' => $p4->end_time->format('H:i')],
                    ['day' => DayOfWeek::WEDNESDAY->value, 'time_slot_id' => $p4->id, 'start' => $p4->start_time->format('H:i'), 'end' => $p4->end_time->format('H:i')],
                    ['day' => DayOfWeek::FRIDAY->value, 'time_slot_id' => $p4->id, 'start' => $p4->start_time->format('H:i'), 'end' => $p4->end_time->format('H:i')],
                ],
                'notes' => 'The Teaching Profession core course for elementary education teachers.',
            ],

            // 5. UNASSIGNED - GEC 104 (Ready to assign during demo)
            [
                'subject_code' => 'GEC 104',
                'section' => 'BEEd-1A',
                'room_number' => '103',
                'building' => 'Education Building',
                'teacher_email' => null,
                'slots' => [
                    ['day' => DayOfWeek::TUESDAY->value, 'time_slot_id' => $tth2->id, 'start' => $tth2->start_time->format('H:i'), 'end' => $tth2->end_time->format('H:i')],
                    ['day' => DayOfWeek::THURSDAY->value, 'time_slot_id' => $tth2->id, 'start' => $tth2->start_time->format('H:i'), 'end' => $tth2->end_time->format('H:i')],
                ],
                'notes' => 'Mathematics in the Modern World lecture block for BEEd 1st year.',
            ],

            // 6. UNASSIGNED - ENG 102 (Ready to assign during demo)
            [
                'subject_code' => 'ENG 102',
                'section' => 'BSEd-Eng-1A',
                'room_number' => '104',
                'building' => 'Education Building',
                'teacher_email' => null,
                'slots' => [
                    ['day' => DayOfWeek::TUESDAY->value, 'time_slot_id' => $tth3->id, 'start' => $tth3->start_time->format('H:i'), 'end' => $tth3->end_time->format('H:i')],
                    ['day' => DayOfWeek::THURSDAY->value, 'time_slot_id' => $tth3->id, 'start' => $tth3->start_time->format('H:i'), 'end' => $tth3->end_time->format('H:i')],
                ],
                'notes' => 'Structure of English major course for secondary education english majors.',
            ],
        ];

        // Fetch holiday dates for semester to mark holiday sessions
        $holidayMap = Holiday::pluck('name', 'date')->toArray();
        $semesterPeriod = CarbonPeriod::create($currentSemester->start_date, $currentSemester->end_date);

        $schedulesCount = 0;
        $totalSessionsCount = 0;

        foreach ($offerings as $item) {
            $subject = Subject::where('code', $item['subject_code'])->first();
            $classroom = Classroom::where('building', $item['building'])
                ->where('room_number', $item['room_number'])
                ->first();
            $teacher = $item['teacher_email'] ? Teacher::where('email', $item['teacher_email'])->first() : null;

            if (! $subject || ! $classroom) {
                continue;
            }

            $roomLabel = "{$item['building']} - {$item['room_number']}";

            // Format slots payload
            $timeSlotsPayload = array_map(function ($s) {
                return [
                    'day' => $s['day'],
                    'time_slot_id' => (string) $s['time_slot_id'],
                ];
            }, $item['slots']);

            // 1. Create Schedule
            $schedule = Schedule::create([
                'subject_id' => $subject->id,
                'semester_id' => $currentSemester->id,
                'classroom_id' => $classroom->id,
                'time_slots' => $timeSlotsPayload,
                'room' => $roomLabel,
                'section' => $item['section'],
                'is_active' => true,
            ]);

            // If assigned to teacher, create assignment, draft, and timetable sessions
            if ($teacher) {
                // 2. Create approved DraftSchedule
                $draftSchedule = DraftSchedule::create([
                    'teacher_id' => $teacher->id,
                    'schedule_id' => $schedule->id,
                    'status' => DraftScheduleStatus::APPROVED->value,
                    'notes' => $item['notes'],
                    'reviewed_by' => $adminUser?->id,
                    'reviewed_at' => now(),
                    'review_comments' => 'Approved schedule assignment for College of Education.',
                ]);

                // 3. Create TeacherAssignment
                $teacherAssignment = TeacherAssignment::create([
                    'teacher_id' => $teacher->id,
                    'schedule_id' => $schedule->id,
                    'assigned_at' => now(),
                    'assigned_by' => $adminUser?->id,
                    'is_active' => true,
                ]);

                $draftSchedule->update(['teacher_assignment_id' => $teacherAssignment->id]);

                // 4. Generate TeacherSchedule & RoomSchedule occurrences across the semester
                foreach ($item['slots'] as $slot) {
                    $targetDay = strtolower($slot['day']);

                    foreach ($semesterPeriod as $date) {
                        $dayName = strtolower($date->format('l'));
                        if ($dayName !== $targetDay) {
                            continue;
                        }

                        $dateStr = $date->format('Y-m-d');
                        $isHoliday = isset($holidayMap[$dateStr]);
                        $holidayName = $isHoliday ? $holidayMap[$dateStr] : null;

                        TeacherSchedule::create([
                            'teacher_assignment_id' => $teacherAssignment->id,
                            'draft_schedule_id' => $draftSchedule->id,
                            'subject_id' => $subject->id,
                            'semester_id' => $currentSemester->id,
                            'teacher_id' => $teacher->id,
                            'scheduled_date' => $dateStr,
                            'day_of_week' => $targetDay,
                            'start_time' => $slot['start'],
                            'end_time' => $slot['end'],
                            'room' => $roomLabel,
                            'section' => $item['section'],
                            'status' => 'scheduled',
                            'is_holiday' => $isHoliday,
                            'holiday_name' => $holidayName,
                        ]);

                        if (! $isHoliday) {
                            RoomSchedule::create([
                                'classroom_id' => $classroom->id,
                                'schedule_id' => $schedule->id,
                                'date' => $dateStr,
                                'start_time' => $slot['start'],
                                'end_time' => $slot['end'],
                                'notes' => "{$subject->code} ({$item['section']}) - {$teacher->full_name}",
                                'is_active' => true,
                            ]);
                        }

                        $totalSessionsCount++;
                    }
                }
            } else {
                // For unassigned schedules, still book the room slots so classroom timetable reflects the course
                foreach ($item['slots'] as $slot) {
                    $targetDay = strtolower($slot['day']);

                    foreach ($semesterPeriod as $date) {
                        if (strtolower($date->format('l')) !== $targetDay) {
                            continue;
                        }

                        $dateStr = $date->format('Y-m-d');
                        if (! isset($holidayMap[$dateStr])) {
                            RoomSchedule::create([
                                'classroom_id' => $classroom->id,
                                'schedule_id' => $schedule->id,
                                'date' => $dateStr,
                                'start_time' => $slot['start'],
                                'end_time' => $slot['end'],
                                'notes' => "{$subject->code} ({$item['section']}) - Available for Assignment",
                                'is_active' => true,
                            ]);
                        }
                    }
                }
            }

            $schedulesCount++;
        }

        // 7. Seed 1 Pending Draft Schedule for Demo Review Workflow
        $teacher = Teacher::where('email', 'teacher@example.com')->first();
        $draftSubject = Subject::where('code', 'EDUC 104')->first();
        $mediaLab = Classroom::where('room_number', '203')->first();

        if ($teacher && $draftSubject && $mediaLab && $labWed) {
            $draftCourseSchedule = Schedule::create([
                'subject_id' => $draftSubject->id,
                'semester_id' => $currentSemester->id,
                'classroom_id' => $mediaLab->id,
                'time_slots' => [
                    [
                        'day' => DayOfWeek::WEDNESDAY->value,
                        'time_slot_id' => (string) $labWed->id,
                    ],
                ],
                'room' => "{$mediaLab->building} - {$mediaLab->room_number}",
                'section' => 'BEEd-2A',
                'is_active' => true,
            ]);

            DraftSchedule::create([
                'teacher_id' => $teacher->id,
                'schedule_id' => $draftCourseSchedule->id,
                'status' => DraftScheduleStatus::PENDING_REVIEW->value,
                'notes' => 'Faculty schedule proposal submitted by Prof. Juan Ibarra for EdTech Media Lab hands-on sessions.',
                'reviewed_by' => null,
                'reviewed_at' => null,
                'review_comments' => null,
            ]);
        }

        $this->command->info("Schedules seeded cleanly: {$schedulesCount} course offerings with {$totalSessionsCount} weekly sessions, plus 1 pending draft proposal.");
    }
}
