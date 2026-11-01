import { Head, Link, useForm } from '@inertiajs/react';
import jsQR from 'jsqr';
import {
    AlertTriangle,
    Camera,
    CameraOff,
    CheckCircle2,
    Cookie,
    Delete,
    DoorOpen,
    Keyboard,
    Loader2,
    LogIn,
    QrCode,
    ShieldAlert,
    Sparkles,
    UserCheck,
    X,
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
    isAdminLoggedIn: boolean;
    classrooms: ClassroomOption[];
    detectedBrowser: string;
}

const KEYPAD_NUM_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['-', '0', 'BACKSPACE'],
];

const KEYPAD_ALPHA_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '-', 'BACKSPACE'],
];

export default function KioskScannerPage({
    isAuthorized,
    isDisabledKiosk,
    kiosk,
    isAdminLoggedIn,
    classrooms,
    detectedBrowser,
}: ScannerPageProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'qr' | 'id'>('qr');
    const [keyboardLayout, setKeyboardLayout] = useState<'num' | 'alpha'>('num');

    // Camera & QR state
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [teacherIdInput, setTeacherIdInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

    // Auto-clear feedback banner after 8 seconds
    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 8000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const submitClockIn = useCallback(
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
                    setTeacherIdInput('');
                }
            } catch {
                setFeedback({
                    success: false,
                    status: 'network_error',
                    title: 'Connection Error',
                    message: 'Unable to reach the attendance server. Please check your network connection.',
                    timestamp: new Date().toLocaleTimeString(),
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [isSubmitting],
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
                'Camera unavailable or permission denied. You can switch to the Teacher ID tab to clock in.',
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
                        if (
                            code.data !== lastScannedCodeRef.current.code ||
                            now - lastScannedCodeRef.current.time > 5000
                        ) {
                            lastScannedCodeRef.current = { code: code.data, time: now };
                            submitClockIn(code.data);
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
    }, [cameraActive, submitClockIn]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleTabChange = (tab: 'qr' | 'id') => {
        setActiveTab(tab);
        if (tab === 'id' && cameraActive) {
            stopCamera();
        }
    };

    const handleKeyPress = (key: string) => {
        if (key === 'BACKSPACE') {
            setTeacherIdInput((prev) => prev.slice(0, -1));
        } else if (key === 'CLEAR') {
            setTeacherIdInput('');
        } else {
            setTeacherIdInput((prev) => (prev.length < 24 ? prev + key : prev));
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherIdInput.trim()) return;
        submitClockIn(teacherIdInput.trim());
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

                <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4 text-foreground">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                                <ShieldAlert className="size-6" />
                            </div>

                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 text-[11px]">
                                {isDisabledKiosk ? 'Kiosk Disabled' : 'Unregistered Browser'}
                            </Badge>

                            <h1 className="text-lg font-bold tracking-tight">
                                {isDisabledKiosk
                                    ? 'Classroom Kiosk Disabled'
                                    : 'Browser Not Registered to a Classroom'}
                            </h1>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {isDisabledKiosk
                                    ? 'An Administrator has disabled this browser kiosk. Re-enable it from the QR Kiosk Terminals page.'
                                    : 'Only browsers registered via cookie session by an Administrator can operate as a Classroom QR Clock-In Kiosk.'}
                            </p>
                        </div>

                        {isAdminLoggedIn ? (
                            <form onSubmit={handleInlineRegister} className="mt-5 pt-5 border-t border-border space-y-3.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                    <Sparkles className="size-3.5" />
                                    <span>Register This Browser ({detectedBrowser}):</span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="inline_classroom_id" className="text-xs">
                                        Assign Classroom <span className="text-destructive">*</span>
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
                                        <SelectTrigger id="inline_classroom_id" className="w-full h-9 text-xs">
                                            <SelectValue placeholder="Choose classroom..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {classrooms.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.classroom_id && (
                                        <p className="text-xs text-destructive">{errors.classroom_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="inline_kiosk_name" className="text-xs">
                                        Kiosk Label <span className="text-muted-foreground">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="inline_kiosk_name"
                                        value={data.kiosk_name}
                                        onChange={(e) => setData('kiosk_name', e.target.value)}
                                        placeholder="e.g. Room 101 Front Desk"
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-9 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold gap-1.5"
                                    disabled={processing || !data.classroom_id}
                                >
                                    <Cookie className="size-3.5" />
                                    Register Browser &amp; Open Scanner
                                </Button>
                            </form>
                        ) : (
                            <div className="mt-5 pt-5 border-t border-border">
                                <Button asChild className="w-full h-9 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold gap-1.5">
                                    <Link href="/qr-kiosks">
                                        <LogIn className="size-3.5" />
                                        Admin Sign In to Register Browser
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // ---------------------------------------------------------------------------
    // STATE 2: REGISTERED CLASSROOM QR KIOSK
    // ---------------------------------------------------------------------------
    return (
        <>
            <Head title={`QR Kiosk — ${kiosk?.classroom?.full_label || 'Classroom Scanner'}`} />

            <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4 text-foreground">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                    {/* 1. Header: Classroom Identity & Live Time */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-800 text-white shadow-xs">
                                <QrCode className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-bold text-foreground">
                                    {kiosk?.classroom?.full_label || 'Classroom Kiosk'}
                                </h1>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                    <DoorOpen className="size-3 shrink-0 text-red-800" />
                                    <span className="truncate">
                                        {kiosk?.classroom?.room_name || 'Faculty Attendance Terminal'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="font-mono text-sm font-bold text-foreground">
                                {currentTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                {currentTime.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. Mode Switcher Tabs: Scan QR Code vs Teacher ID */}
                    <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1">
                        <button
                            type="button"
                            onClick={() => handleTabChange('qr')}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                                activeTab === 'qr'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <QrCode className="size-3.5" />
                            Scan QR Code
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('id')}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                                activeTab === 'id'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Keyboard className="size-3.5" />
                            Teacher ID
                        </button>
                    </div>

                    {/* 3. Instant Scan / Clock-In Result Alert */}
                    {feedback && (
                        <div
                            className={`rounded-xl border p-3.5 text-xs ${
                                feedback.success
                                    ? feedback.already_present
                                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                                    : 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100'
                            }`}
                        >
                            <div className="flex items-start gap-2.5">
                                {feedback.success ? (
                                    <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                                ) : (
                                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold">{feedback.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFeedback(null)}
                                            className="opacity-60 hover:opacity-100"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                    <p className="mt-0.5 text-[11px] leading-snug opacity-90">{feedback.message}</p>
                                    {feedback.teacher && (
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                {feedback.teacher.full_name} ({feedback.teacher.employee_id})
                                            </Badge>
                                            {feedback.session && (
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {feedback.session.subject_code} • {feedback.session.clock_in_time}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4A. TAB 1: QR CAMERA SCANNER */}
                    {activeTab === 'qr' && (
                        <div className="space-y-3">
                            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
                                <video
                                    ref={videoRef}
                                    className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                                    playsInline
                                    muted
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Clean Corner-Only Viewfinder (No Horizontal Center Line, No Overflowing Shadow) */}
                                {cameraActive && (
                                    <>
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="relative size-48">
                                                <span className="absolute top-0 left-0 size-7 rounded-tl-xl border-t-3 border-l-3 border-white/90" />
                                                <span className="absolute top-0 right-0 size-7 rounded-tr-xl border-t-3 border-r-3 border-white/90" />
                                                <span className="absolute bottom-0 left-0 size-7 rounded-bl-xl border-b-3 border-l-3 border-white/90" />
                                                <span className="absolute bottom-0 right-0 size-7 rounded-br-xl border-b-3 border-r-3 border-white/90" />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="absolute bottom-3 right-3 h-8 text-xs gap-1.5 bg-background/90 hover:bg-background text-foreground shadow-sm"
                                            onClick={stopCamera}
                                        >
                                            <CameraOff className="size-3.5" />
                                            Stop Camera
                                        </Button>
                                    </>
                                )}

                                {!cameraActive && (
                                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                                        <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-xs">
                                            <QrCode className="size-7" />
                                        </div>
                                        <div className="space-y-1 max-w-xs">
                                            <p className="text-sm font-semibold text-foreground">
                                                QR Pass Scanner
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Position your Faculty QR Pass in front of the camera to clock in as Present.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={startCamera}
                                            className="h-9 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold gap-2 px-4"
                                        >
                                            <Camera className="size-4" />
                                            Start Camera
                                        </Button>
                                        {cameraError && (
                                            <p className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 max-w-xs">
                                                {cameraError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4B. TAB 2: TEACHER ID / PIN INPUT WITH ON-SCREEN KEYBOARD */}
                    {activeTab === 'id' && (
                        <form onSubmit={handleManualSubmit} className="space-y-3">
                            {/* Display Input */}
                            <div className="relative">
                                <Input
                                    value={teacherIdInput}
                                    onChange={(e) => setTeacherIdInput(e.target.value.toUpperCase())}
                                    placeholder="Enter Employee ID or PIN (e.g. COED-T001)"
                                    className="h-11 pr-9 text-center font-mono text-base font-bold tracking-wider uppercase"
                                    autoFocus
                                />
                                {teacherIdInput && (
                                    <button
                                        type="button"
                                        onClick={() => setTeacherIdInput('')}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        title="Clear"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            {/* Keyboard Mode Switch (Numbers vs Letters) */}
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground">
                                    On-Screen Keypad
                                </span>
                                <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setKeyboardLayout('num')}
                                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                            keyboardLayout === 'num'
                                                ? 'bg-background text-foreground shadow-2xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        123 / PIN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setKeyboardLayout('alpha')}
                                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                            keyboardLayout === 'alpha'
                                                ? 'bg-background text-foreground shadow-2xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        ABC
                                    </button>
                                </div>
                            </div>

                            {/* Numeric Keypad */}
                            {keyboardLayout === 'num' ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {KEYPAD_NUM_ROWS.flat().map((key) => (
                                        <Button
                                            key={key}
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleKeyPress(key)}
                                            className="h-11 font-mono text-sm font-bold active:scale-95 transition-transform"
                                        >
                                            {key === 'BACKSPACE' ? (
                                                <Delete className="size-4 text-muted-foreground" />
                                            ) : (
                                                key
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                /* Alpha Keyboard (QWERTY) */
                                <div className="space-y-1.5">
                                    {KEYPAD_ALPHA_ROWS.map((row, rowIdx) => (
                                        <div key={rowIdx} className="flex justify-center gap-1">
                                            {row.map((key) => (
                                                <Button
                                                    key={key}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleKeyPress(key)}
                                                    className={`h-9 px-0 font-mono text-xs font-bold active:scale-95 transition-transform ${
                                                        key === 'BACKSPACE' ? 'w-12' : 'flex-1 max-w-9'
                                                    }`}
                                                >
                                                    {key === 'BACKSPACE' ? (
                                                        <Delete className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        key
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !teacherIdInput.trim()}
                                className="w-full h-10 bg-red-800 hover:bg-red-900 text-white font-semibold text-xs gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <UserCheck className="size-4" />
                                )}
                                Clock In as Present
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
