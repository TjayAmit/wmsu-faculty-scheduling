<?php

namespace App\Http\Controllers;

use App\Enums\ZktecoMatchStatus;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\ZktecoAttendanceLog;
use App\Models\ZktecoDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZktecoLogController extends Controller
{
    /**
     * Display the ZKTeco room-verified attendance punch audit log.
     */
    public function index(Request $request): Response
    {
        $query = ZktecoAttendanceLog::query()
            ->with([
                'device',
                'qrKiosk',
                'classroom',
                'teacher',
                'teacherSchedule.subject',
                'attendanceRecord',
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('biometric_pin', 'like', "%{$search}%")
                    ->orWhere('rejection_reason', 'like', "%{$search}%")
                    ->orWhereHas('teacher', function ($tq) use ($search) {
                        $tq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('employee_id', 'like', "%{$search}%");
                    })
                    ->orWhereHas('classroom', function ($cq) use ($search) {
                        $cq->where('building', 'like', "%{$search}%")
                            ->orWhere('room_number', 'like', "%{$search}%")
                            ->orWhere('room_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('device', function ($dq) use ($search) {
                        $dq->where('device_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('match_status') && $request->input('match_status') !== 'all') {
            $query->where('match_status', $request->input('match_status'));
        }

        if ($request->filled('zkteco_device_id') && $request->input('zkteco_device_id') !== 'all') {
            $query->where('zkteco_device_id', $request->input('zkteco_device_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('punch_time', $request->input('date'));
        }

        $logs = $query->latest('punch_time')->paginate($request->input('per_page', 10))->withQueryString();

        return Inertia::render('zkteco/logs/index', [
            'data' => $logs,
            'filters' => $request->only(['search', 'match_status', 'zkteco_device_id', 'date', 'per_page']),
            'stats' => [
                'total' => ZktecoAttendanceLog::count(),
                'matched' => ZktecoAttendanceLog::where('match_status', ZktecoMatchStatus::MATCHED->value)->count(),
                'mismatched_room' => ZktecoAttendanceLog::where('match_status', ZktecoMatchStatus::MISMATCHED_ROOM->value)->count(),
                'no_scheduled_class' => ZktecoAttendanceLog::where('match_status', ZktecoMatchStatus::NO_SCHEDULED_CLASS->value)->count(),
                'teacher_not_found' => ZktecoAttendanceLog::where('match_status', ZktecoMatchStatus::TEACHER_NOT_FOUND->value)->count(),
            ],
            'devices' => ZktecoDevice::with('classroom')->get()->map(fn (ZktecoDevice $d) => [
                'id' => $d->id,
                'device_name' => $d->device_name,
                'classroom_name' => $d->classroom ? "{$d->classroom->building} {$d->classroom->room_number}" : 'Unassigned',
            ]),
            'teachers' => Teacher::active()->select('id', 'first_name', 'middle_name', 'last_name', 'employee_id', 'biometric_pin')->get(),
        ]);
    }
}
