import { Head, Link, useForm } from '@inertiajs/react';
import jsQR from 'jsqr';
import {
    AlertTriangle,
    Camera,
    CameraOff,
    CheckCircle2,
    Cookie,
    DoorOpen,
    KeyRound,
    Keyboard,
    Loader2,
    LogIn,
    QrCode,
    Settings,
    ShieldAlert,
    Sparkles,
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

export default function KioskScannerPage({
    isAuthorized,
    isDisabledKiosk,
    kiosk,
    isAdminLoggedIn,
    classrooms,
    detectedBrowser,
}: ScannerPageProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
                const AudioCtx =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
                'Camera access was denied or no camera was detected. Use a USB QR scanner or enter the token below.',
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

                <div className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
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
    // STATE 2: REGISTERED CLASSROOM QR KIOSK (COMPACT CENTERED CARD)
    // ---------------------------------------------------------------------------
    return (
        <>
            <Head title={`QR Kiosk — ${kiosk?.classroom?.full_label || 'Classroom Scanner'}`} />

            <div className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
                <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* 1. Compact Header: Classroom Info + Live Clock + Camera Toggle */}
                    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-800 text-white">
                                <QrCode className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="truncate text-sm font-bold text-foreground">
                                        {kiosk?.classroom?.full_label || 'Classroom QR Kiosk'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                    <DoorOpen className="size-3 shrink-0 text-red-800" />
                                    <span className="truncate">
                                        {kiosk?.classroom?.room_name || kiosk?.kiosk_name || 'QR Clock-In Terminal'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="text-right mr-1">
                                <div className="font-mono text-sm font-bold text-foreground leading-none">
                                    {currentTime.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {currentTime.toLocaleDateString('en-US', {
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
                                className="size-8"
                                onClick={() => setSoundEnabled((prev) => !prev)}
                                title={soundEnabled ? 'Mute Beep' : 'Unmute Beep'}
                            >
                                {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                            </Button>

                            {isAdminLoggedIn && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    title="Manage QR Kiosks"
                                >
                                    <Link href="/qr-kiosks">
                                        <Settings className="size-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* 2. Instant Scan Result Banner (shown when a QR scan is processed) */}
                    {feedback && (
                        <div
                            className={`border-b px-4 py-3 text-xs ${
                                feedback.success
                                    ? feedback.already_present
                                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                                    : 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200'
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
                                        <span className="font-mono text-[10px] opacity-75">{feedback.timestamp}</span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] leading-snug opacity-90">{feedback.message}</p>
                                    {feedback.teacher && (
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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

                    {/* 3. Optical QR Camera Viewport */}
                    <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-muted/40">
                        <video
                            ref={videoRef}
                            className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                            playsInline
                            muted
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {cameraActive && (
                            <>
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="relative size-44 rounded-2xl border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                                        <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-400 animate-pulse" />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-3 right-3 h-7 text-[11px] gap-1 px-2.5 shadow"
                                    onClick={stopCamera}
                                >
                                    <CameraOff className="size-3" />
                                    Stop Camera
                                </Button>
                            </>
                        )}

                        {!cameraActive && (
                            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                                <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground shadow-xs">
                                    <QrCode className="size-6" />
                                </div>
                                <div className="space-y-0.5 max-w-xs">
                                    <p className="text-xs font-semibold text-foreground">
                                        QR Camera Scanner Ready
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Scan your Faculty QR Pass to clock in as Present.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 bg-red-800 hover:bg-red-900 text-white text-xs gap-1.5 mt-1"
                                    onClick={startCamera}
                                >
                                    <Camera className="size-3.5" />
                                    Start Camera Scanner
                                </Button>
                                {cameraError && (
                                    <p className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 max-w-xs">
                                        {cameraError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. Direct USB Scanner / Token Input */}
                    <form
                        onSubmit={handleManualSubmit}
                        className="border-t border-border bg-card p-3 flex items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <Keyboard className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Scan or enter QR Token / Employee ID..."
                                className="pl-8 h-9 text-xs"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !manualCode.trim()}
                            className="h-9 bg-red-800 hover:bg-red-900 text-white font-semibold text-xs px-4 gap-1.5 shrink-0"
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <KeyRound className="size-3.5" />
                            )}
                            Clock In
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
