<?php

use App\Enums\AttendanceStatus;
use App\Enums\RoomType;
use App\Enums\SemesterType;
use App\Enums\ZktecoMatchStatus;
use App\Models\AttendanceRecord;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\ZktecoDevice;
use App\Services\Zkteco\ZktecoAttendanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('each zkteco device can only apply to one classroom', function () {
    $admin = User::factory()->create();

    $classroomA = Classroom::create([
        'building' => 'CCS Building',
        'room_number' => '101',
        'room_name' => 'CCS Lab 1',
        'capacity' => 40,
        'room_type' => RoomType::LAB->value,
        'is_active' => true,
    ]);

    // First device binds to Classroom A
    $this->actingAs($admin)
        ->post(route('zkteco-devices.store'), [
            'classroom_id' => $classroomA->id,
            'device_name' => 'CCS Lab 1 Terminal',
            'ip_address' => '192.168.1.201',
            'port' => 4370,
            'connection_type' => 'tcp',
            'is_active' => true,
        ])
        ->assertRedirect(route('zkteco-devices.index'));

    expect(ZktecoDevice::where('classroom_id', $classroomA->id)->count())->toBe(1);

    // Attempting to bind a second device to the same Classroom A must fail validation
    $this->actingAs($admin)
        ->post(route('zkteco-devices.store'), [
            'classroom_id' => $classroomA->id,
            'device_name' => 'Duplicate Room Terminal',
            'ip_address' => '192.168.1.202',
            'port' => 4370,
            'connection_type' => 'tcp',
            'is_active' => true,
        ])
        ->assertSessionHasErrors(['classroom_id']);
});

test('teacher is marked present only when clocking in on the device assigned to the subject classroom', function () {
    $teacherUser = User::factory()->create();

    $teacher = Teacher::create([
        'user_id' => $teacherUser->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan.delacruz@wmsu.edu.ph',
        'employee_id' => 'T-1042',
        'biometric_pin' => '1042',
        'department' => 'College of Computing Studies',
        'rank' => 'Associate Professor',
        'employment_type' => 'full_time',
        'is_active' => true,
    ]);

    $classroomLab1 = Classroom::create([
        'building' => 'CCS Building',
        'room_number' => '101',
        'room_name' => 'CCS Lab 1',
        'capacity' => 40,
        'room_type' => RoomType::LAB->value,
        'is_active' => true,
    ]);

    $classroomRoom204 = Classroom::create([
        'building' => 'Science Building',
        'room_number' => '204',
        'room_name' => 'Lecture Room 204',
        'capacity' => 50,
        'room_type' => RoomType::CLASSROOM->value,
        'is_active' => true,
    ]);

    $deviceLab1 = ZktecoDevice::create([
        'classroom_id' => $classroomLab1->id,
        'device_name' => 'CCS Lab 1 Biometric Clock',
        'ip_address' => '192.168.1.101',
        'port' => 4370,
        'connection_type' => 'tcp',
        'status' => 'online',
        'is_active' => true,
    ]);

    $deviceRoom204 = ZktecoDevice::create([
        'classroom_id' => $classroomRoom204->id,
        'device_name' => 'Room 204 Biometric Clock',
        'ip_address' => '192.168.1.204',
        'port' => 4370,
        'connection_type' => 'tcp',
        'status' => 'online',
        'is_active' => true,
    ]);

    $subject = Subject::create([
        'code' => 'CS 311',
        'title' => 'Software Engineering',
        'units' => 3,
        'is_active' => true,
    ]);

    $semester = Semester::create([
        'name' => '1st Semester 2026-2027',
        'academic_year' => '2026-2027',
        'semester_type' => SemesterType::FIRST->value,
        'start_date' => '2026-08-01',
        'end_date' => '2026-12-20',
        'is_current' => true,
    ]);

    $timeSlot = TimeSlot::create([
        'name' => 'Morning Block 1',
        'start_time' => '08:00:00',
        'end_time' => '10:00:00',
        'is_active' => true,
    ]);

    // Schedule CS 311 on Monday 08:00-10:00 in CCS Building 101 (Classroom Lab 1)
    $schedule = Schedule::create([
        'subject_id' => $subject->id,
        'semester_id' => $semester->id,
        'classroom_id' => $classroomLab1->id,
        'time_slots' => [
            ['day' => 'monday', 'time_slot_id' => $timeSlot->id],
        ],
        'room' => 'CCS Building 101',
        'section' => 'BSCS 3A',
        'is_active' => true,
    ]);

    $assignment = TeacherAssignment::create([
        'teacher_id' => $teacher->id,
        'schedule_id' => $schedule->id,
        'assigned_at' => now(),
        'assigned_by' => $teacherUser->id,
        'is_active' => true,
    ]);

    $service = app(ZktecoAttendanceService::class);

    // Monday 2026-10-26 at 08:05 AM (During scheduled CS 311 class)
    $mondayPunchTime = Carbon::parse('2026-10-26 08:05:00');

    // CASE 1: Teacher clocks in at the WRONG classroom device (Room 204 instead of CCS Lab 1)
    $wrongRoomLog = $service->processPunch(
        device: $deviceRoom204,
        biometricPin: '1042',
        punchTime: $mondayPunchTime,
    );

    expect($wrongRoomLog->match_status)->toBe(ZktecoMatchStatus::MISMATCHED_ROOM)
        ->and($wrongRoomLog->attendance_record_id)->toBeNull()
        ->and($wrongRoomLog->rejection_reason)->toContain('Wrong Classroom');

    // Verify teacher is NOT marked present for CS 311 when clocking in at the wrong room
    expect(AttendanceRecord::where('teacher_assignment_id', $assignment->id)->count())->toBe(0);

    // CASE 2: Teacher clocks in at the RIGHT classroom device (CCS Lab 1)
    $rightRoomLog = $service->processPunch(
        device: $deviceLab1,
        biometricPin: '1042',
        punchTime: $mondayPunchTime,
    );

    expect($rightRoomLog->match_status)->toBe(ZktecoMatchStatus::MATCHED)
        ->and($rightRoomLog->attendance_record_id)->not->toBeNull();

    // Verify teacher IS marked PRESENT for CS 311
    $attendance = AttendanceRecord::where('teacher_assignment_id', $assignment->id)->first();
    expect($attendance)->not->toBeNull()
        ->and($attendance->status)->toBe(AttendanceStatus::PRESENT);
});
