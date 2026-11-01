<?php

namespace App\Http\Controllers;

use App\Enums\ZktecoMatchStatus;
use App\Models\Classroom;
use App\Models\QrKiosk;
use App\Models\Teacher;
use App\Models\ZktecoAttendanceLog;
use App\Services\Zkteco\QrKioskAttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QrKioskController extends Controller
{
    public function __construct(
        protected QrKioskAttendanceService $kioskService
    ) {}

    /**
     * Admin view: Manage registered classroom QR Kiosk browsers and register the current browser.
     */
    public function index(Request $request): Response
    {
        $currentCookieToken = $request->cookie(QrKiosk::COOKIE_NAME);
        $currentBrowserKiosk = $currentCookieToken
            ? QrKiosk::with('classroom')->where('kiosk_token', $currentCookieToken)->first()
            : null;

        $kiosks = QrKiosk::query()
            ->with(['classroom', 'registeredByUser'])
            ->latest('registered_at')
            ->get()
            ->map(fn (QrKiosk $k) => [
                'id' => $k->id,
                'kiosk_name' => $k->kiosk_name,
                'classroom_id' => $k->classroom_id,
                'classroom' => $k->classroom ? [
                    'id' => $k->classroom->id,
                    'building' => $k->classroom->building,
                    'room_number' => $k->classroom->room_number,
                    'room_name' => $k->classroom->room_name,
                ] : null,
                'browser_name' => $k->browser_name,
                'ip_address' => $k->ip_address,
                'registered_by_name' => $k->registeredByUser?->name ?? 'Administrator',
                'registered_at' => $k->registered_at?->format('M d, Y g:i A'),
                'last_used_at' => $k->last_used_at?->diffForHumans(),
                'scans_count' => $k->scans_count,
                'is_active' => $k->is_active,
                'notes' => $k->notes,
                'is_this_browser' => $currentBrowserKiosk && $currentBrowserKiosk->id === $k->id,
            ]);

        $classrooms = Classroom::active()
            ->orderBy('building')
            ->orderBy('room_number')
            ->get()
            ->map(fn (Classroom $c) => [
                'id' => $c->id,
                'building' => $c->building,
                'room_number' => $c->room_number,
                'room_name' => $c->room_name,
                'label' => "{$c->building} - Room {$c->room_number}".($c->room_name ? " ({$c->room_name})" : ''),
            ]);

        $teachers = Teacher::active()
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Teacher $t) => [
                'id' => $t->id,
                'full_name' => $t->full_name,
                'employee_id' => $t->employee_id,
                'department' => $t->department,
                'rank' => $t->rank,
                'qr_payload' => $this->kioskService->generateTeacherQrPayload($t),
            ]);

        return Inertia::render('zkteco/kiosks/index', [
            'kiosks' => $kiosks,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'currentBrowserKiosk' => $currentBrowserKiosk ? [
                'id' => $currentBrowserKiosk->id,
                'kiosk_name' => $currentBrowserKiosk->kiosk_name,
                'classroom_id' => $currentBrowserKiosk->classroom_id,
                'classroom_label' => $currentBrowserKiosk->classroom
                    ? "{$currentBrowserKiosk->classroom->building} - Room {$currentBrowserKiosk->classroom->room_number}"
                    : 'Assigned Classroom',
                'browser_name' => $currentBrowserKiosk->browser_name,
                'is_active' => $currentBrowserKiosk->is_active,
                'registered_at' => $currentBrowserKiosk->registered_at?->format('M d, Y g:i A'),
            ] : null,
            'detectedBrowser' => $this->parseBrowserDescription($request->userAgent()),
        ]);
    }

    /**
     * Admin action: Register the current browser session to a specific classroom via long-lived cookie.
     */
    public function registerBrowser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'kiosk_name' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'launch_scanner' => ['nullable', 'boolean'],
        ]);

        $classroom = Classroom::findOrFail($validated['classroom_id']);
        $browserDesc = $this->parseBrowserDescription($request->userAgent());
        $kioskName = trim($validated['kiosk_name'] ?? '') ?: "{$classroom->building} {$classroom->room_number} — {$browserDesc}";

        $existingToken = $request->cookie(QrKiosk::COOKIE_NAME);
        $kiosk = $existingToken
            ? QrKiosk::where('kiosk_token', $existingToken)->first()
            : null;

        $newToken = Str::random(64);

        if ($kiosk) {
            $kiosk->update([
                'classroom_id' => $classroom->id,
                'kiosk_name' => $kioskName,
                'kiosk_token' => $newToken,
                'browser_name' => $browserDesc,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'registered_by' => auth()->id(),
                'registered_at' => now(),
                'last_used_at' => now(),
                'is_active' => true,
                'notes' => $validated['notes'] ?? $kiosk->notes,
            ]);
        } else {
            $kiosk = QrKiosk::create([
                'classroom_id' => $classroom->id,
                'kiosk_name' => $kioskName,
                'kiosk_token' => $newToken,
                'browser_name' => $browserDesc,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'registered_by' => auth()->id(),
                'registered_at' => now(),
                'last_used_at' => now(),
                'scans_count' => 0,
                'is_active' => true,
                'notes' => $validated['notes'] ?? null,
            ]);
        }

        $cookie = Cookie::forever(QrKiosk::COOKIE_NAME, $newToken);

        if ($request->boolean('launch_scanner')) {
            return redirect()->route('kiosk.scanner')
                ->withCookie($cookie)
                ->with('success', "This browser is now registered as the QR Kiosk for {$classroom->building} - Room {$classroom->room_number}.");
        }

        return redirect()->route('qr-kiosks.index')
            ->withCookie($cookie)
            ->with('success', "Browser successfully registered as QR Kiosk for {$classroom->building} - Room {$classroom->room_number}.");
    }

    /**
     * Admin action: Unregister the current browser (clears cookie & deactivates record).
     */
    public function unregisterBrowser(Request $request): RedirectResponse
    {
        $token = $request->cookie(QrKiosk::COOKIE_NAME);
        if ($token) {
            QrKiosk::where('kiosk_token', $token)->delete();
        }

        return redirect()->route('qr-kiosks.index')
            ->withCookie(Cookie::forget(QrKiosk::COOKIE_NAME))
            ->with('success', 'This browser has been unbound and unregistered as a classroom QR Kiosk.');
    }

    /**
     * Admin action: Toggle active status of a registered kiosk browser.
     */
    public function toggleStatus(QrKiosk $qrKiosk): RedirectResponse
    {
        $qrKiosk->update([
            'is_active' => ! $qrKiosk->is_active,
        ]);

        $statusLabel = $qrKiosk->is_active ? 'enabled' : 'disabled';

        return back()->with('success', "QR Kiosk '{$qrKiosk->kiosk_name}' has been {$statusLabel}.");
    }

    /**
     * Admin action: Revoke and delete a registered kiosk browser.
     */
    public function destroy(Request $request, QrKiosk $qrKiosk): RedirectResponse
    {
        $isCurrentBrowser = $request->cookie(QrKiosk::COOKIE_NAME) === $qrKiosk->kiosk_token;
        $name = $qrKiosk->kiosk_name;
        $qrKiosk->delete();

        $response = back()->with('success', "QR Kiosk '{$name}' has been revoked and removed.");

        if ($isCurrentBrowser) {
            $response->withCookie(Cookie::forget(QrKiosk::COOKIE_NAME));
        }

        return $response;
    }

    /**
     * Public Unauthenticated Kiosk Scanner Page (/kiosk/scanner).
     * Accessible without login — authorized strictly by the browser's registered cookie.
     */
    public function scanner(Request $request): Response
    {
        $token = $request->cookie(QrKiosk::COOKIE_NAME);
        $kiosk = $token
            ? QrKiosk::with('classroom')->where('kiosk_token', $token)->first()
            : null;

        $isAuthorized = $kiosk !== null && $kiosk->is_active && $kiosk->classroom !== null;

        $todaySessions = [];
        $recentLogs = [];

        if ($isAuthorized) {
            $kiosk->update(['last_used_at' => now()]);
            $todaySessions = $this->kioskService->getTodayClassroomSessions($kiosk->classroom);
            $recentLogs = $this->getRecentKioskLogs($kiosk);
        }

        $user = auth()->user();
        $isAdminLoggedIn = $user && ($user->hasAnyRole(['Admin', 'admin', 'Faculty Admin', 'faculty_admin', 'Faculty Staff']) || ! $user->isTeacher());

        $classrooms = $isAdminLoggedIn
            ? Classroom::active()
                ->orderBy('building')
                ->orderBy('room_number')
                ->get()
                ->map(fn (Classroom $c) => [
                    'id' => $c->id,
                    'building' => $c->building,
                    'room_number' => $c->room_number,
                    'room_name' => $c->room_name,
                    'label' => "{$c->building} - Room {$c->room_number}".($c->room_name ? " ({$c->room_name})" : ''),
                ])
            : [];

        return Inertia::render('kiosk/scanner', [
            'isAuthorized' => $isAuthorized,
            'isDisabledKiosk' => $kiosk !== null && ! $kiosk->is_active,
            'kiosk' => $kiosk ? [
                'id' => $kiosk->id,
                'kiosk_name' => $kiosk->kiosk_name,
                'browser_name' => $kiosk->browser_name,
                'scans_count' => $kiosk->scans_count,
                'registered_at' => $kiosk->registered_at?->format('M d, Y'),
                'classroom' => $kiosk->classroom ? [
                    'id' => $kiosk->classroom->id,
                    'building' => $kiosk->classroom->building,
                    'room_number' => $kiosk->classroom->room_number,
                    'room_name' => $kiosk->classroom->room_name,
                    'full_label' => "{$kiosk->classroom->building} • Room {$kiosk->classroom->room_number}",
                ] : null,
            ] : null,
            'todaySessions' => $todaySessions,
            'recentLogs' => $recentLogs,
            'isAdminLoggedIn' => (bool) $isAdminLoggedIn,
            'classrooms' => $classrooms,
            'detectedBrowser' => $this->parseBrowserDescription($request->userAgent()),
        ]);
    }

    /**
     * Public Unauthenticated Scan Endpoint (POST /kiosk/scan).
     * Verifies browser cookie registration and records single-clock-in PRESENT attendance.
     */
    public function scan(Request $request): JsonResponse
    {
        $token = $request->cookie(QrKiosk::COOKIE_NAME);
        $kiosk = $token
            ? QrKiosk::with('classroom')->where('kiosk_token', $token)->first()
            : null;

        if (! $kiosk || ! $kiosk->is_active || ! $kiosk->classroom) {
            return response()->json([
                'success' => false,
                'status' => 'unauthorized_browser',
                'title' => 'Unauthorized Kiosk Browser',
                'message' => 'This browser is not registered as an active Classroom QR Kiosk. Please ask an Administrator to register this browser.',
            ], 403);
        }

        $validated = $request->validate([
            'qr_code' => ['required', 'string', 'max:255'],
        ]);

        $result = $this->kioskService->processQrScan($kiosk, $validated['qr_code']);

        $todaySessions = $this->kioskService->getTodayClassroomSessions($kiosk->classroom);
        $recentLogs = $this->getRecentKioskLogs($kiosk);

        return response()->json([
            ...$result,
            'todaySessions' => $todaySessions,
            'recentLogs' => $recentLogs,
            'scansCount' => $kiosk->fresh()->scans_count,
        ]);
    }

    /**
     * Get recent scan logs for this classroom kiosk today.
     */
    protected function getRecentKioskLogs(QrKiosk $kiosk): array
    {
        return ZktecoAttendanceLog::query()
            ->with(['teacher', 'teacherSchedule.subject'])
            ->where('qr_kiosk_id', $kiosk->id)
            ->whereDate('punch_time', today())
            ->latest('punch_time')
            ->limit(15)
            ->get()
            ->map(function (ZktecoAttendanceLog $log) {
                $statusVal = $log->match_status instanceof \BackedEnum
                    ? $log->match_status->value
                    : $log->match_status;

                return [
                    'id' => $log->id,
                    'teacher_name' => $log->teacher?->full_name ?? 'Unknown User',
                    'employee_id' => $log->teacher?->employee_id ?? $log->biometric_pin,
                    'subject_code' => $log->teacherSchedule?->subject?->code,
                    'section' => $log->teacherSchedule?->section,
                    'punch_time' => $log->punch_time->format('g:i:s A'),
                    'match_status' => $statusVal,
                    'is_matched' => $statusVal === ZktecoMatchStatus::MATCHED->value,
                    'message' => $log->rejection_reason,
                ];
            })
            ->toArray();
    }

    /**
     * Parse a friendly browser + OS label from the User-Agent string.
     */
    protected function parseBrowserDescription(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Web Browser';
        }

        $browser = 'Browser';
        if (str_contains($userAgent, 'Edg/')) {
            $browser = 'Microsoft Edge';
        } elseif (str_contains($userAgent, 'Chrome/') && ! str_contains($userAgent, 'Edg/')) {
            $browser = 'Google Chrome';
        } elseif (str_contains($userAgent, 'Firefox/')) {
            $browser = 'Mozilla Firefox';
        } elseif (str_contains($userAgent, 'Safari/') && ! str_contains($userAgent, 'Chrome/')) {
            $browser = 'Apple Safari';
        }

        $os = 'Device';
        if (str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'iPad')) {
            $os = 'iPadOS';
        } elseif (str_contains($userAgent, 'iPhone')) {
            $os = 'iOS';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'Macintosh') || str_contains($userAgent, 'Mac OS')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        }

        return "{$browser} ({$os})";
    }
}
