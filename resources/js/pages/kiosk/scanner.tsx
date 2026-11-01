import { Head, Link, useForm } from '@inertiajs/react';
import jsQR from 'jsqr';
import {
    AlertTriangle,
    Camera,
    CameraOff,
    CheckCircle2,
    Clock,
    Cookie,
    DoorOpen,
    KeyRound,
    Keyboard,
    Laptop,
    Loader2,
    LogIn,
    QrCode,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserCheck,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface KioskClassroom {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    full_label: string;
}

interface KioskInfo {
    id: number;
    kiosk_name: string;
    browser_name?: string | null;
    scans_count: number;
    registered_at?: string | null;
    classroom?: KioskClassroom | null;
}

interface ClassroomSessionItem {
    id: number;
    subject_code: string;
    subject_title: string;
    section?: string | null;
    teacher_name: string;
    teacher_employee_id?: string | null;
    start_time: string;
    end_time: string;
    is_present: boolean;
    clock_in_time?: string | null;
    is_live_window: boolean;
}

interface RecentKioskLog {
    id: number;
    teacher_name: string;
    employee_id: string;
    subject_code?: string | null;
    section?: string | null;
    punch_time: string;
    match_status: string;
    is_matched: boolean;
    message?: string | null;
}

interface ClassroomOption {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    label: string;
}

interface ScanFeedback {
    success: boolean;
    already_present?: boolean;
    status: string;
    title: string;
    message: string;
    teacher?: {
        id: number;
        full_name: string;
        employee_id: string;
        department?: string | null;
    } | null;
    session?: {
        id: number;
        subject_code: string;
        subject_title: string;
        section?: string | null;
        time_slot: string;
        clock_in_time: string;
        is_late: boolean;
        minutes_late?: number;
    } | null;
    timestamp: string;
}

interface ScannerPageProps {
    isAuthorized: boolean;
    isDisabledKiosk: boolean;
    kiosk: KioskInfo | null;
    todaySessions: ClassroomSessionItem[];
    recentLogs: RecentKioskLog[];
    isAdminLoggedIn: boolean;
    classrooms: ClassroomOption[];
    detectedBrowser: string;
}

export default function KioskScannerPage({
    isAuthorized,
    isDisabledKiosk,
    kiosk,
    todaySessions: initialSessions,
    recentLogs: initialLogs,
    isAdminLoggedIn,
    classrooms,
    detectedBrowser,
}: ScannerPageProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [sessions, setSessions] = useState<ClassroomSessionItem[]>(initialSessions || []);
    const [logs, setLogs] = useState<RecentKioskLog[]>(initialLogs || []);
    const [scansCount, setScansCount] = useState<number>(kiosk?.scans_count ?? 0);

    // Camera & QR state
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [feedback, setFeedback] = useState<ScanFeedback | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

    // Inline Admin Registration Form (when visiting on an unregistered browser)
    const { data, setData, post, processing, errors } = useForm({
        classroom_id: '',
        kiosk_name: '',
        notes: '',
        launch_scanner: true,
    });

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Web Audio API Beep for Kiosk Feedback
    const playBeep = useCallback(
        (type: 'success' | 'info' | 'error') => {
            if (!soundEnabled) return;
            try {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                if (type === 'success') {
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.18, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.35);
                } else if (type === 'info') {
                    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.25);
                } else {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, ctx.currentTime);
                    gain.gain.setValueAtTime(0.18, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.4);
                }
            } catch {
                // Ignore audio errors if blocked by browser autoplay policy
            }
        },
        [soundEnabled],
    );

    const submitQrCode = useCallback(
        async (rawCode: string) => {
            const code = rawCode.trim();
            if (!code || isSubmitting) return;

            setIsSubmitting(true);
            try {
                const csrfToken =
                    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
                const xsrfCookie = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

                const res = await fetch('/kiosk/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                        ...(xsrfCookie ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) } : {}),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ qr_code: code }),
                });

                const json = await res.json();

                if (json.todaySessions) {
                    setSessions(json.todaySessions);
                }
                if (json.recentLogs) {
                    setLogs(json.recentLogs);
                }
                if (typeof json.scansCount === 'number') {
                    setScansCount(json.scansCount);
                }

                const nowStr = new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                });

                setFeedback({
                    success: Boolean(json.success),
                    already_present: Boolean(json.already_present),
                    status: json.status || (json.success ? 'matched' : 'error'),
                    title: json.title || (json.success ? 'Clock-In Recorded' : 'Scan Rejected'),
                    message: json.message || 'Scan processed.',
                    teacher: json.teacher || null,
                    session: json.session || null,
                    timestamp: nowStr,
                });

                if (json.success) {
                    playBeep(json.already_present ? 'info' : 'success');
                } else {
                    playBeep('error');
                }
            } catch {
                setFeedback({
                    success: false,
                    status: 'network_error',
                    title: 'Connection Error',
                    message: 'Unable to reach the attendance server. Please check your network connection.',
                    timestamp: new Date().toLocaleTimeString(),
                });
                playBeep('error');
            } finally {
                setIsSubmitting(false);
            }
        },
        [isSubmitting, playBeep],
    );

    // Stop Camera Stream
    const stopCamera = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    // Start Camera Stream & QR Frame Loop
    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraActive(true);
        } catch {
            setCameraError(
                'Camera access was denied or no camera was detected on this device. You can still use a USB QR scanner or enter the QR token below.',
            );
            setCameraActive(false);
        }
    }, []);

    useEffect(() => {
        if (!cameraActive) return;

        let active = true;
        const scanFrame = () => {
            if (!active) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code && code.data) {
                        const now = Date.now();
                        // Debounce identical QR code within 5 seconds
                        if (
                            code.data !== lastScannedCodeRef.current.code ||
                            now - lastScannedCodeRef.current.time > 5000
                        ) {
                            lastScannedCodeRef.current = { code: code.data, time: now };
                            submitQrCode(code.data);
                        }
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animFrameRef.current = requestAnimationFrame(scanFrame);

        return () => {
            active = false;
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [cameraActive, submitQrCode]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        const codeToSubmit = manualCode.trim();
        setManualCode('');
        submitQrCode(codeToSubmit);
    };

    const handleInlineRegister = (e: React.FormEvent) => {
        e.preventDefault();
        post('/qr-kiosks/register-browser');
    };

    // ---------------------------------------------------------------------------
    // STATE 1: BROWSER IS NOT REGISTERED TO A CLASSROOM
    // ---------------------------------------------------------------------------
    if (!isAuthorized) {
        return (
            <>
                <Head title="Unregistered Classroom QR Kiosk" />

                <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-red-900/40 border border-red-700/40 text-red-400">
                                <QrCode className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-wide uppercase text-white">
                                    Western Mindanao State University
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Classroom QR Clock-In Kiosk Terminal
                                </p>
                            </div>
                        </div>

                        <div className="text-right font-mono text-xs text-slate-400">
                            {currentTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </div>
                    </div>

                    {/* Center Lock Card */}
                    <div className="mx-auto my-auto w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                <ShieldAlert className="size-8" />
                            </div>

                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
                                {isDisabledKiosk ? 'Kiosk Terminal Disabled' : 'Unregistered Browser Session'}
                            </Badge>

                            <h2 className="text-2xl font-bold text-white">
                                {isDisabledKiosk
                                    ? 'This Classroom Kiosk is Currently Disabled'
                                    : 'This Browser is Not Registered to a Classroom'}
                            </h2>

                            <p className="text-xs text-slate-400 leading-relaxed">
                                {isDisabledKiosk
                                    ? 'An Administrator has temporarily disabled this browser kiosk. Please re-enable it from the QR Kiosk Terminals management panel.'
                                    : 'For security and room-verified attendance, only browsers explicitly registered via encrypted cookie session by an Administrator can operate as a Classroom QR Clock-In Kiosk.'}
                            </p>
                        </div>

                        {isAdminLoggedIn ? (
                            <form onSubmit={handleInlineRegister} className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                                    <Sparkles className="size-4" />
                                    <span>Admin Session Detected — Register This Browser ({detectedBrowser}) Now:</span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="inline_classroom_id" className="text-xs text-slate-300">
                                        Select Classroom for This Device <span className="text-red-400">*</span>
                                    </Label>
                                    <Select
                                        value={data.classroom_id}
                                        onValueChange={(val) => {
                                            const room = classrooms.find((c) => String(c.id) === val);
                                            setData({
                                                ...data,
                                                classroom_id: val,
                                                kiosk_name: room
                                                    ? `${room.building} ${room.room_number} — ${detectedBrowser}`
                                                    : data.kiosk_name,
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="inline_classroom_id" className="w-full h-10 text-xs bg-slate-950 border-slate-700 text-white">
                                            <SelectValue placeholder="Choose classroom to bind to this browser..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64">
                                            {classrooms.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.classroom_id && (
                                        <p className="text-xs text-red-400">{errors.classroom_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="inline_kiosk_name" className="text-xs text-slate-300">
                                        Kiosk Name <span className="text-slate-500">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="inline_kiosk_name"
                                        value={data.kiosk_name}
                                        onChange={(e) => setData('kiosk_name', e.target.value)}
                                        placeholder="e.g. Room 102 Front Desk Browser"
                                        className="h-9 text-xs bg-slate-950 border-slate-700 text-white"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-red-800 hover:bg-red-700 text-white font-semibold gap-2"
                                    disabled={processing || !data.classroom_id}
                                >
                                    <Cookie className="size-4" />
                                    Register This Browser & Activate Kiosk
                                </Button>

                                <div className="text-center pt-1">
                                    <Link
                                        href="/qr-kiosks"
                                        className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                                    >
                                        Go to QR Kiosk Management Dashboard
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-3">
                                <Button asChild className="w-full h-10 bg-red-800 hover:bg-red-700 text-white font-semibold gap-2">
                                    <Link href="/qr-kiosks">
                                        <LogIn className="size-4" />
                                        Admin Sign In to Register This Browser
                                    </Link>
                                </Button>
                                <p className="text-[11px] text-center text-slate-500">
                                    Once registered by an Administrator, this browser will remember its assigned classroom automatically even after logging out.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-600">
                        WMSU Faculty Scheduling & Room-Verified Attendance System
                    </div>
                </div>
            </>
        );
    }

    // ---------------------------------------------------------------------------
    // STATE 2: REGISTERED & AUTHORIZED CLASSROOM QR KIOSK TERMINAL (CENTERED DESIGN)
    // ---------------------------------------------------------------------------
    return (
        <>
            <Head title={`QR Kiosk — ${kiosk?.classroom?.full_label || 'Classroom Scanner'}`} />

            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-6 sm:px-6">
                {/* Top Minimal Bar */}
                <header className="mx-auto flex w-full max-w-2xl items-center justify-between border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-red-900 text-white shadow-md">
                            <QrCode className="size-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                                    WMSU Classroom QR Clock-In Kiosk
                                </h1>
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                                    <ShieldCheck className="size-3" />
                                    Registered
                                </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Single Scan = Present (No Time-Out Required)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                            <div className="font-mono text-base font-bold text-white tracking-tight sm:text-lg">
                                {currentTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                            onClick={() => setSoundEnabled((prev) => !prev)}
                            title={soundEnabled ? 'Mute Beep Sound' : 'Enable Beep Sound'}
                        >
                            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                        </Button>

                        {isAdminLoggedIn && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs gap-1.5"
                            >
                                <Link href="/qr-kiosks">
                                    <Settings className="size-3.5" />
                                    <span className="hidden sm:inline">Manage</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Centered Kiosk Container */}
                <main className="mx-auto my-auto flex w-full max-w-2xl flex-col gap-4 py-6">
                    {/* Centered Classroom Identity Banner */}
                    <div className="text-center space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                            <DoorOpen className="size-3.5" />
                            <span>
                                {kiosk?.classroom?.full_label}
                                {kiosk?.classroom?.room_name ? ` (${kiosk.classroom.room_name})` : ''}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Hold your Faculty QR Pass in front of the camera or scan via reader to record attendance.
                        </p>
                    </div>

                    {/* Instant Scan Feedback Banner */}
                    {feedback ? (
                        <div
                            className={`rounded-2xl border p-4 shadow-lg transition-all ${
                                feedback.success
                                    ? feedback.already_present
                                        ? 'border-sky-500/40 bg-sky-950/40 text-sky-100'
                                        : 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100'
                                    : 'border-red-500/50 bg-red-950/50 text-red-100'
                            }`}
                        >
                            <div className="flex items-start gap-3.5">
                                <div
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                        feedback.success
                                            ? feedback.already_present
                                                ? 'bg-sky-500/20 text-sky-400'
                                                : 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}
                                >
                                    {feedback.success ? (
                                        <CheckCircle2 className="size-6" />
                                    ) : (
                                        <AlertTriangle className="size-6" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h2 className="text-base font-bold text-white">
                                            {feedback.title}
                                        </h2>
                                        <span className="text-xs font-mono opacity-75">
                                            {feedback.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed opacity-90">
                                        {feedback.message}
                                    </p>

                                    {feedback.teacher && (
                                        <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
                                            <Badge className="bg-white/15 text-white border-white/20">
                                                {feedback.teacher.full_name} ({feedback.teacher.employee_id})
                                            </Badge>
                                            {feedback.session && (
                                                <>
                                                    <Badge className="bg-white/15 text-white border-white/20">
                                                        {feedback.session.subject_code}
                                                        {feedback.session.section
                                                            ? ` • Sec ${feedback.session.section}`
                                                            : ''}
                                                    </Badge>
                                                    <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30">
                                                        Present at {feedback.session.clock_in_time}
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-red-900/30 text-red-400">
                                    <UserCheck className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white">
                                        Ready for Faculty QR Clock-In
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        {kiosk?.kiosk_name}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-[11px] shrink-0">
                                {scansCount} Total Scans
                            </Badge>
                        </div>
                    )}

                    {/* Centered Camera Viewport & Scanner Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <Camera className="size-4 text-red-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                                    Optical QR Camera Scanner
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant={cameraActive ? 'destructive' : 'default'}
                                className={`h-8 text-xs gap-1.5 ${
                                    !cameraActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                                }`}
                                onClick={() => (cameraActive ? stopCamera() : startCamera())}
                            >
                                {cameraActive ? (
                                    <>
                                        <CameraOff className="size-3.5" />
                                        Stop Camera
                                    </>
                                ) : (
                                    <>
                                        <Camera className="size-3.5" />
                                        Start Camera Scanner
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="relative flex aspect-video w-full items-center justify-center bg-slate-950">
                            <video
                                ref={videoRef}
                                className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                                playsInline
                                muted
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {cameraActive && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="relative size-56 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(2,6,23,0.45)]">
                                        <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-400/90 shadow-[0_0_12px_#34d399] animate-pulse" />
                                    </div>
                                </div>
                            )}

                            {!cameraActive && (
                                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                                        <QrCode className="size-8" />
                                    </div>
                                    <div className="space-y-1 max-w-md">
                                        <p className="text-sm font-semibold text-slate-200">
                                            Camera Scanner Standby
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Click <strong>Start Camera Scanner</strong> above to scan QR passes using this device&apos;s webcam, or use the USB scanner / token input below.
                                        </p>
                                    </div>
                                    {cameraError && (
                                        <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2 max-w-md">
                                            {cameraError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hardware USB Scanner / Manual Token Input Bar */}
                        <form
                            onSubmit={handleManualSubmit}
                            className="border-t border-slate-800 bg-slate-900/90 p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center"
                        >
                            <div className="relative flex-1">
                                <Keyboard className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="USB QR Scanner input or paste QR Token / Employee ID"
                                    className="pl-9 h-10 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !manualCode.trim()}
                                className="h-10 bg-red-800 hover:bg-red-700 text-white font-semibold text-xs px-5 gap-2 shrink-0"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <KeyRound className="size-4" />
                                )}
                                Clock In (Present)
                            </Button>
                        </form>
                    </div>

                    {/* Compact Centered Room Schedule & Recent Scans */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Today's Scheduled Classes in This Classroom */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-amber-400" />
                                    Room Schedule Today
                                </h3>
                                <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                                    {sessions.length} {sessions.length === 1 ? 'Class' : 'Classes'}
                                </Badge>
                            </div>

                            {sessions.length === 0 ? (
                                <div className="py-4 text-center text-[11px] text-slate-500">
                                    No scheduled classes in this room today.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={`rounded-xl border p-2.5 text-xs ${
                                                session.is_present
                                                    ? 'border-emerald-500/30 bg-emerald-950/20'
                                                    : session.is_live_window
                                                      ? 'border-amber-500/40 bg-amber-950/20'
                                                      : 'border-slate-800 bg-slate-950/60'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="font-semibold text-white truncate">
                                                    {session.subject_code}
                                                </div>
                                                {session.is_present ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] shrink-0">
                                                        Present
                                                    </Badge>
                                                ) : session.is_live_window ? (
                                                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] shrink-0">
                                                        Open
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-slate-700 text-slate-400 text-[9px] shrink-0">
                                                        Scheduled
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {session.teacher_name}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-500 mt-1">
                                                {session.start_time} – {session.end_time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Scans at This Kiosk Today */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Laptop className="size-3.5 text-emerald-400" />
                                    Today&apos;s Clock-In Log
                                </h3>
                                <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                                    {logs.length}
                                </Badge>
                            </div>

                            {logs.length === 0 ? (
                                <div className="py-4 text-center text-[11px] text-slate-500">
                                    No QR scans recorded today yet.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-start justify-between gap-2 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-semibold text-white truncate text-[11px]">
                                                    {log.teacher_name}
                                                </div>
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    {log.message}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <Badge
                                                    className={
                                                        log.is_matched
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]'
                                                            : 'bg-red-500/20 text-red-300 border-red-500/30 text-[9px]'
                                                    }
                                                >
                                                    {log.is_matched ? 'Present' : 'Rejected'}
                                                </Badge>
                                                <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                                                    {log.punch_time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center text-[11px] text-slate-600">
                    WMSU Faculty Scheduling &amp; Room-Verified Attendance System
                </footer>
            </div>
        </>
    );
}
