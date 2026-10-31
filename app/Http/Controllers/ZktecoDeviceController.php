<?php

namespace App\Http\Controllers;

use App\Enums\ZktecoDeviceStatus;
use App\Enums\ZktecoMatchStatus;
use App\Http\Requests\ZktecoDeviceRequest;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\ZktecoAttendanceLog;
use App\Models\ZktecoDevice;
use App\Services\Zkteco\ZktecoDeviceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZktecoDeviceController extends Controller
{
    public function __construct(
        protected ZktecoDeviceService $deviceService
    ) {}

    /**
     * Display a listing of ZKTeco devices.
     */
    public function index(Request $request): Response
    {
        $query = ZktecoDevice::query()
            ->with(['classroom'])
            ->withCount('attendanceLogs');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('device_name', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('model_name', 'like', "%{$search}%")
                    ->orWhereHas('classroom', function ($cq) use ($search) {
                        $cq->where('building', 'like', "%{$search}%")
                            ->orWhere('room_number', 'like', "%{$search}%")
                            ->orWhere('room_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $devices = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $totalClassrooms = Classroom::active()->count();
        $assignedClassrooms = ZktecoDevice::count();

        return Inertia::render('zkteco/devices/index', [
            'data' => $devices,
            'filters' => $request->only(['search', 'status', 'per_page']),
            'stats' => [
                'total_devices' => ZktecoDevice::count(),
                'online_devices' => ZktecoDevice::where('status', ZktecoDeviceStatus::ONLINE->value)->count(),
                'offline_devices' => ZktecoDevice::where('status', ZktecoDeviceStatus::OFFLINE->value)->count(),
                'unassigned_classrooms' => max(0, $totalClassrooms - $assignedClassrooms),
            ],
            'teachers' => Teacher::active()->select('id', 'first_name', 'middle_name', 'last_name', 'employee_id', 'biometric_pin')->get(),
        ]);
    }

    /**
     * Show the form for creating a new ZKTeco device.
     */
    public function create(): Response
    {
        $assignedClassroomIds = ZktecoDevice::pluck('classroom_id')->toArray();

        $classrooms = Classroom::active()
            ->orderBy('building')
            ->orderBy('room_number')
            ->get()
            ->map(fn (Classroom $c) => [
                'id' => $c->id,
                'building' => $c->building,
                'room_number' => $c->room_number,
                'room_name' => $c->room_name,
                'room_type' => $c->room_type instanceof \BackedEnum ? $c->room_type->value : $c->room_type,
                'is_assigned' => in_array($c->id, $assignedClassroomIds, true),
            ]);

        return Inertia::render('zkteco/devices/create', [
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Store a newly created ZKTeco device.
     */
    public function store(ZktecoDeviceRequest $request): RedirectResponse
    {
        $this->deviceService->create($request->validated());

        return redirect()->route('zkteco-devices.index')
            ->with('success', 'ZKTeco device registered and exclusively bound to the selected classroom.');
    }

    /**
     * Display the specified ZKTeco device.
     */
    public function show(ZktecoDevice $zktecoDevice): Response
    {
        $zktecoDevice->load(['classroom']);

        $recentLogs = ZktecoAttendanceLog::query()
            ->with(['teacher', 'classroom', 'teacherSchedule.subject', 'attendanceRecord'])
            ->where('zkteco_device_id', $zktecoDevice->id)
            ->latest('punch_time')
            ->limit(25)
            ->get();

        $logStats = [
            'total_punches' => ZktecoAttendanceLog::where('zkteco_device_id', $zktecoDevice->id)->count(),
            'matched_present' => ZktecoAttendanceLog::where('zkteco_device_id', $zktecoDevice->id)
                ->where('match_status', ZktecoMatchStatus::MATCHED->value)
                ->count(),
            'mismatched_room' => ZktecoAttendanceLog::where('zkteco_device_id', $zktecoDevice->id)
                ->where('match_status', ZktecoMatchStatus::MISMATCHED_ROOM->value)
                ->count(),
            'no_schedule' => ZktecoAttendanceLog::where('zkteco_device_id', $zktecoDevice->id)
                ->where('match_status', ZktecoMatchStatus::NO_SCHEDULED_CLASS->value)
                ->count(),
        ];

        return Inertia::render('zkteco/devices/show', [
            'device' => $zktecoDevice,
            'recentLogs' => $recentLogs,
            'logStats' => $logStats,
            'teachers' => Teacher::active()->select('id', 'first_name', 'middle_name', 'last_name', 'employee_id', 'biometric_pin')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified ZKTeco device.
     */
    public function edit(ZktecoDevice $zktecoDevice): Response
    {
        $assignedClassroomIds = ZktecoDevice::where('id', '!=', $zktecoDevice->id)
            ->pluck('classroom_id')
            ->toArray();

        $classrooms = Classroom::active()
            ->orderBy('building')
            ->orderBy('room_number')
            ->get()
            ->map(fn (Classroom $c) => [
                'id' => $c->id,
                'building' => $c->building,
                'room_number' => $c->room_number,
                'room_name' => $c->room_name,
                'room_type' => $c->room_type instanceof \BackedEnum ? $c->room_type->value : $c->room_type,
                'is_assigned' => in_array($c->id, $assignedClassroomIds, true),
            ]);

        return Inertia::render('zkteco/devices/edit', [
            'device' => $zktecoDevice->load('classroom'),
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Update the specified ZKTeco device.
     */
    public function update(ZktecoDeviceRequest $request, ZktecoDevice $zktecoDevice): RedirectResponse
    {
        $this->deviceService->update($zktecoDevice, $request->validated());

        return redirect()->route('zkteco-devices.index')
            ->with('success', 'ZKTeco device configuration updated.');
    }

    /**
     * Remove the specified ZKTeco device.
     */
    public function destroy(ZktecoDevice $zktecoDevice): RedirectResponse
    {
        $this->deviceService->delete($zktecoDevice);

        return redirect()->route('zkteco-devices.index')
            ->with('success', 'ZKTeco device removed and classroom unbound.');
    }

    /**
     * Test connection (Ping) to the specified ZKTeco device.
     */
    public function ping(ZktecoDevice $zktecoDevice): RedirectResponse
    {
        $result = $this->deviceService->testConnection($zktecoDevice);

        return back()->with($result['reachable'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Pull and process attendance logs from the specified ZKTeco device.
     */
    public function sync(ZktecoDevice $zktecoDevice): RedirectResponse
    {
        $result = $this->deviceService->syncDeviceLogs($zktecoDevice);

        return back()->with('success', $result['message']);
    }

    /**
     * Simulate or record a biometric punch on the specified device to verify room-based subject attendance.
     */
    public function simulatePunch(Request $request, ZktecoDevice $zktecoDevice): RedirectResponse
    {
        $validated = $request->validate([
            'biometric_pin' => ['required', 'string', 'max:50'],
            'punch_time' => ['nullable', 'date'],
            'verify_type' => ['required', 'in:fingerprint,face,rfid_card,password,other'],
            'punch_type' => ['required', 'in:auto,check_in,check_out'],
        ]);

        $log = $this->deviceService->simulatePunch(
            device: $zktecoDevice,
            biometricPin: $validated['biometric_pin'],
            punchTime: $validated['punch_time'] ?? null,
            verifyType: $validated['verify_type'],
            punchType: $validated['punch_type']
        );

        $statusValue = $log->match_status instanceof \BackedEnum ? $log->match_status->value : $log->match_status;

        if ($statusValue === ZktecoMatchStatus::MATCHED->value) {
            return back()->with('success', $log->rejection_reason ?? 'Attendance verified and marked PRESENT.');
        }

        return back()->with('error', $log->rejection_reason ?? 'Punch rejected.');
    }
}
