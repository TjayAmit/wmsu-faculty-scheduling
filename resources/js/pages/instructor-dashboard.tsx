import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Fingerprint,
    MapPin,
    QrCode,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { QrPassModal } from '@/components/qr-pass-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface TeacherProfile {
    id: number;
    full_name: string;
    email: string;
    employee_id: string;
    department: string;
    rank: string;
    employment_type: string;
    biometric_pin: string | null;
    has_biometric: boolean;
    qr_payload?: string;
}

interface SemesterInfo {
    id: number;
    name: string;
    academic_year: string;
    is_current: boolean;
}

interface ClassItem {
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    room: string;
    start_time: string;
    end_time: string;
    duration: string;
    is_live: boolean;
    is_past: boolean;
    display_status: 'live' | 'upcoming' | 'completed' | 'past' | 'cancelled';
    is_holiday: boolean;
    holiday_name: string | null;
    punched_in: boolean;
    punch_time: string | null;
    punch_device: string | null;
}

interface WeeklySlot {
    schedule_id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    room: string;
    start_time: string;
    end_time: string;
    units: number;
}

interface AssignedCourse {
    id: number;
    schedule_id: number;
    subject_code: string;
    subject_title: string;
    units: number;
    lec_hours: number;
    lab_hours: number;
    section: string;
    room: string;
    schedule_display: string;
}

interface PunchLog {
    id: number;
    punch_time: string;
    time_ago: string;
    room: string;
    device: string;
    punch_type: string;
    verify_type: string;
    match_status: string;
    is_matched: boolean;
    rejection_reason: string | null;
}

interface RequestItem {
    id: number;
    type: 'leave' | 'substitute';
    title: string;
    date_range: string;
    status: string;
    reason: string | null;
    created_at: string;
    url: string;
}

interface InstructorDashboardProps {
    teacher: TeacherProfile | null;
    semester: SemesterInfo | null;
    stats: {
        today_classes: number;
        today_completed: number;
        total_units: number;
        assigned_courses_count: number;
        weekly_hours: number;
        monthly_attended: number;
        monthly_total: number;
        attendance_rate: number;
        pending_requests: number;
    };
    today_classes: ClassItem[];
    current_or_next_class: ClassItem | null;
    weekly_schedule: Record<string, WeeklySlot[]>;
    assigned_courses: AssignedCourse[];
    recent_punches: PunchLog[];
    recent_requests: RequestItem[];
    today_date_display: string;
}

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Mon', full: 'Monday' },
    { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
    { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
    { key: 'thursday', label: 'Thu', full: 'Thursday' },
    { key: 'friday', label: 'Fri', full: 'Friday' },
    { key: 'saturday', label: 'Sat', full: 'Saturday' },
];

export default function InstructorDashboard({
    teacher,
    semester,
    stats,
    today_classes = [],
    current_or_next_class,
    weekly_schedule = {},
    assigned_courses = [],
    recent_punches = [],
    recent_requests = [],
    today_date_display,
}: InstructorDashboardProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [scheduleTab, setScheduleTab] = useState<'today' | 'weekly'>('today');
    const [selectedDay, setSelectedDay] = useState<string>(() => {
        const todayDay = new Date()
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();
        return DAYS_OF_WEEK.some((d) => d.key === todayDay) ? todayDay : 'monday';
    });
    const [activityTab, setActivityTab] = useState<'punches' | 'requests'>('punches');
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Real-time ticking clock for Date & Time Card
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const greeting = useMemo(() => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, [currentTime]);

    const formattedTime = useMemo(() => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    }, [currentTime]);

    const formattedDate = useMemo(() => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, [currentTime]);

    const daySlots = useMemo(() => {
        return weekly_schedule[selectedDay] || [];
    }, [weekly_schedule, selectedDay]);

    const readableRank = useMemo(() => {
        if (!teacher?.rank) return null;
        return /^\d+$/.test(teacher.rank.trim()) ? null : teacher.rank;
    }, [teacher]);

    return (
        <>
            <Head title="Instructor Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-5 w-full min-w-0">
                {/* 1. Compact Header with Integrated Faculty Metadata & Quick Actions */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/70 pb-3.5">
                    <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl truncate">
                                {teacher ? `${greeting}, ${teacher.full_name}` : greeting}
                            </h1>
                            {semester && (
                                <Badge
                                    variant="outline"
                                    className="border-primary/25 bg-primary/5 text-primary text-[11px] font-medium px-2 py-0.5"
                                >
                                    {semester.name} ({semester.academic_year})
                                </Badge>
                            )}
                        </div>

                        {teacher ? (
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/90">{teacher.department}</span>
                                {readableRank && (
                                    <>
                                        <span>&bull;</span>
                                        <span>{readableRank}</span>
                                    </>
                                )}
                                <span>&bull;</span>
                                <span className="capitalize">{teacher.employment_type.replace('_', ' ')}</span>
                                <span>&bull;</span>
                                <span className="font-mono text-[11px]">ID: {teacher.employee_id}</span>
                                {teacher.biometric_pin && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Fingerprint className="h-3 w-3" />
                                            PIN #{teacher.biometric_pin}
                                        </span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Daily schedule, room assignments, and academic workload overview
                            </p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {teacher?.qr_payload && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 h-8 text-xs border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                                onClick={() => setQrModalOpen(true)}
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                My QR Pass
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                            <Link href="/teacher-schedules">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                My Schedule
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                            <Link href="/leave-requests/create">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                File Leave
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/substitute-requests/create">
                                <Users className="h-3.5 w-3.5" />
                                Request Substitute
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Profile Link Warning if unlinked */}
                {!teacher && (
                    <Card className="py-0 gap-0 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                        <CardContent className="flex items-center gap-3 px-4 py-3">
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="text-xs">
                                <span className="font-semibold">Instructor profile not connected:</span> Your user account is not yet linked to an instructor profile. Please contact the Faculty Administrator.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Compact KPI Metric Strip */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {/* Card 1: Live Date & Time */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] px-3.5 py-2.5 shadow-xs">
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Date & Time
                            </span>
                            <div className="mt-0.5 text-lg sm:text-xl font-bold tracking-tight text-foreground font-mono leading-tight truncate">
                                {formattedTime}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                                <span className="truncate">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Card 2: Today's Classes */}
                    <button
                        type="button"
                        onClick={() => setScheduleTab('today')}
                        className={cn(
                            'flex items-center justify-between gap-3 text-left rounded-xl border px-3.5 py-2.5 shadow-xs transition-all min-w-0',
                            scheduleTab === 'today'
                                ? 'border-blue-500/40 bg-blue-500/[0.05] ring-1 ring-blue-500/20'
                                : 'border-border bg-card hover:border-blue-500/40'
                        )}
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Today's Classes
                            </span>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                                    {stats.today_classes}
                                </span>
                                {current_or_next_class?.is_live && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        1 Live
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                {stats.today_classes > 0
                                    ? `${stats.today_completed} done • ${stats.today_classes - stats.today_completed} remaining`
                                    : 'No classes today'}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <CalendarCheck className="h-4 w-4" />
                        </div>
                    </button>

                    {/* Card 3: Weekly Teaching Load */}
                    <button
                        type="button"
                        onClick={() => setScheduleTab('weekly')}
                        className={cn(
                            'flex items-center justify-between gap-3 text-left rounded-xl border px-3.5 py-2.5 shadow-xs transition-all min-w-0',
                            scheduleTab === 'weekly'
                                ? 'border-purple-600/40 bg-purple-500/[0.05] ring-1 ring-purple-500/20'
                                : 'border-border bg-card hover:border-purple-500/40'
                        )}
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Weekly Load
                            </span>
                            <div className="mt-0.5 flex items-baseline gap-1.5">
                                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                                    {stats.total_units}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">units</span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                {stats.assigned_courses_count} {stats.assigned_courses_count === 1 ? 'subject' : 'subjects'} &bull; {stats.weekly_hours} hrs/wk
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <BookOpen className="h-4 w-4" />
                        </div>
                    </button>

                    {/* Card 4: Pending Requests */}
                    <button
                        type="button"
                        onClick={() => setActivityTab('requests')}
                        className={cn(
                            'flex items-center justify-between gap-3 text-left rounded-xl border px-3.5 py-2.5 shadow-xs transition-all min-w-0',
                            stats.pending_requests > 0
                                ? 'border-amber-500/40 bg-amber-500/[0.05] hover:border-amber-500 ring-1 ring-amber-500/20'
                                : 'border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50'
                        )}
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Pending Requests
                            </span>
                            <div className="mt-0.5 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                                {stats.pending_requests}
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                {stats.pending_requests > 0 ? `${stats.pending_requests} awaiting approval` : 'All requests up to date'}
                            </p>
                        </div>
                        <div className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            stats.pending_requests > 0
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        )}>
                            <FileText className="h-4 w-4" />
                        </div>
                    </button>
                </div>

                {/* 3. Balanced 3-Column High-Density Workspace */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
                    {/* Column 1 (5 cols on desktop): Teaching Schedule */}
                    <Card className="py-0 gap-0 border-border bg-card shadow-xs overflow-hidden lg:col-span-5 min-w-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <div className="min-w-0">
                                <CardTitle className="text-sm font-semibold">Teaching Schedule</CardTitle>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {today_date_display}
                                </p>
                            </div>

                            {/* Schedule Tab Switcher */}
                            <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setScheduleTab('today')}
                                    className={cn(
                                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                        scheduleTab === 'today'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Today ({today_classes.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleTab('weekly')}
                                    className={cn(
                                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                        scheduleTab === 'weekly'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Weekly
                                </button>
                            </div>
                        </CardHeader>

                        {/* Compact Live/Next Banner when viewing Weekly tab or when a session is active */}
                        {current_or_next_class && scheduleTab === 'weekly' && (
                            <div className={cn(
                                'flex items-center justify-between gap-2 border-b px-4 py-2 text-xs',
                                current_or_next_class.is_live
                                    ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                                    : 'border-primary/20 bg-primary/[0.03]'
                            )}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <Badge className={cn(
                                        'text-[10px] px-1.5 py-0 h-4 shrink-0',
                                        current_or_next_class.is_live
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-primary/15 text-primary'
                                    )}>
                                        {current_or_next_class.is_live ? 'Live Now' : 'Up Next'}
                                    </Badge>
                                    <span className="font-semibold text-foreground truncate">
                                        {current_or_next_class.subject_code}
                                    </span>
                                    <span className="text-muted-foreground truncate">
                                        {current_or_next_class.start_time} &ndash; {current_or_next_class.end_time}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                                    {current_or_next_class.room}
                                </span>
                            </div>
                        )}

                        <CardContent className="p-3.5">
                            {scheduleTab === 'today' ? (
                                /* Today's Schedule List */
                                <div className="space-y-2">
                                    {today_classes.length > 0 ? (
                                        today_classes.map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className={cn(
                                                    'flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-all',
                                                    item.is_live
                                                        ? 'border-emerald-500/50 bg-emerald-500/[0.05] ring-1 ring-emerald-500/20'
                                                        : 'border-border bg-background/60 hover:bg-muted/30'
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={cn(
                                                        'flex flex-col items-center justify-center rounded-md border px-2 py-1 text-center min-w-[72px] shrink-0',
                                                        item.is_live
                                                            ? 'border-emerald-500/40 bg-emerald-500/10'
                                                            : 'border-border bg-muted/50'
                                                    )}>
                                                        <span className="text-[11px] font-bold text-foreground leading-tight">
                                                            {item.start_time}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground leading-tight">
                                                            {item.end_time}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 space-y-0.5">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className="font-bold text-xs sm:text-sm text-foreground">
                                                                {item.subject_code}
                                                            </span>
                                                            {item.is_live && (
                                                                <Badge className="bg-emerald-500 text-white text-[10px] h-4 px-1.5">
                                                                    In Session
                                                                </Badge>
                                                            )}
                                                            {item.punched_in && (
                                                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] h-4 px-1.5">
                                                                    Present
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {item.subject_title}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                                                            <span>Sec: <strong className="text-foreground">{item.section}</strong></span>
                                                            <span>&bull;</span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                                <span className="truncate">{item.room}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right pl-2">
                                                    {item.punched_in ? (
                                                        <div className="inline-flex flex-col items-end rounded-md bg-emerald-500/10 px-2 py-1">
                                                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Clocked In
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">{item.punch_time}</span>
                                                        </div>
                                                    ) : item.is_live ? (
                                                        <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                                            <Fingerprint className="h-3 w-3 animate-pulse" />
                                                            Scan in
                                                        </div>
                                                    ) : item.is_past ? (
                                                        <span className="text-[11px] text-muted-foreground font-medium">Completed</span>
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground font-medium">Upcoming</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <CalendarCheck className="h-7 w-7 text-muted-foreground/40" />
                                            <p className="mt-1.5 text-xs font-semibold text-foreground">No classes scheduled for today</p>
                                            <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                                                Switch to the Weekly tab to view your regular class days.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setScheduleTab('weekly')}
                                                className="mt-2.5 h-7 text-xs"
                                            >
                                                View Weekly Program
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Weekly Program Tab */
                                <div className="space-y-2.5">
                                    {/* Day Pills */}
                                    <div className="grid grid-cols-6 gap-1">
                                        {DAYS_OF_WEEK.map((day) => {
                                            const count = weekly_schedule[day.key]?.length || 0;
                                            const isSelected = selectedDay === day.key;
                                            return (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    onClick={() => setSelectedDay(day.key)}
                                                    className={cn(
                                                        'flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    )}
                                                >
                                                    <span>{day.label}</span>
                                                    {count > 0 && (
                                                        <span className={cn(
                                                            'rounded-full px-1 text-[9px] font-bold',
                                                            isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-foreground'
                                                        )}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Day Classes */}
                                    <div className="space-y-2">
                                        {daySlots.length > 0 ? (
                                            daySlots.map((slot, sIdx) => (
                                                <div
                                                    key={sIdx}
                                                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 p-2.5 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-start gap-2.5 min-w-0">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-xs text-foreground">
                                                                    {slot.subject_code}
                                                                </span>
                                                                <Badge variant="outline" className="text-[9px] h-4 px-1">
                                                                    Sec {slot.section}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground truncate">
                                                                {slot.subject_title}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0 pl-2">
                                                        <p className="text-xs font-semibold text-foreground">
                                                            {slot.start_time} &ndash; {slot.end_time}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                                                            <MapPin className="h-2.5 w-2.5 text-primary" />
                                                            {slot.room}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-5 text-center text-xs text-muted-foreground">
                                                No classes on {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.full}.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <div className="border-t border-border px-3.5 py-2 bg-muted/20 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                                {stats.monthly_attended}/{stats.monthly_total} monthly sessions attended
                            </span>
                            <Link
                                href="/teacher-schedules"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                Full Timetable <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </Card>

                    {/* Column 2 (4 cols on desktop): Assigned Subjects */}
                    <Card className="py-0 gap-0 border-border bg-card shadow-xs overflow-hidden lg:col-span-4 min-w-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <div className="min-w-0">
                                <CardTitle className="text-sm font-semibold">Assigned Subjects</CardTitle>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    Current semester teaching load
                                </p>
                            </div>
                            <Badge variant="secondary" className="font-semibold text-xs shrink-0">
                                {assigned_courses.length} {assigned_courses.length === 1 ? 'Course' : 'Courses'}
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-3.5 space-y-2">
                            {assigned_courses.length > 0 ? (
                                assigned_courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="rounded-lg border border-border bg-background/60 p-2.5 hover:border-primary/30 transition-all space-y-1.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-xs text-foreground">
                                                        {course.subject_code}
                                                    </span>
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal">
                                                        {course.units} Units
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                                                    {course.subject_title}
                                                </p>
                                            </div>
                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] shrink-0">
                                                Sec {course.section}
                                            </Badge>
                                        </div>

                                        <div className="pt-1.5 border-t border-border/60 flex flex-col gap-1 text-[11px] text-muted-foreground">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                    <span className="truncate">{course.room}</span>
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-snug break-words">
                                                {course.schedule_display}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                                    <p className="mt-1.5 text-xs font-semibold text-foreground">No subjects assigned yet</p>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                                        Teaching assignments for this semester will appear here once finalized.
                                    </p>
                                </div>
                            )}
                        </CardContent>

                        <div className="border-t border-border px-3.5 py-2 bg-muted/20 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                                {stats.total_units} units &bull; {stats.weekly_hours} hrs/week
                            </span>
                            <Link
                                href="/draft-schedules"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                Request Schedule <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </Card>

                    {/* Column 3 (3 cols on desktop): Activity & History */}
                    <Card className="py-0 gap-0 border-border bg-card shadow-xs overflow-hidden lg:col-span-3 min-w-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <div className="min-w-0">
                                <CardTitle className="text-sm font-semibold">Activity & Logs</CardTitle>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    Scans & requests
                                </p>
                            </div>

                            <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActivityTab('punches')}
                                    className={cn(
                                        'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                        activityTab === 'punches'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Scans ({recent_punches.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActivityTab('requests')}
                                    className={cn(
                                        'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                        activityTab === 'requests'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Requests ({recent_requests.length})
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-3.5 max-h-[340px] overflow-y-auto">
                            {activityTab === 'punches' ? (
                                <div className="space-y-2">
                                    {recent_punches.length > 0 ? (
                                        recent_punches.map((punch) => (
                                            <div
                                                key={punch.id}
                                                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/60 p-2 text-xs"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className={cn(
                                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                                                        punch.is_matched
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    )}>
                                                        <Fingerprint className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-foreground text-xs truncate">
                                                                {punch.room}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-[9px] h-3.5 px-1 shrink-0',
                                                                    punch.is_matched
                                                                        ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                                        : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                                                                )}
                                                            >
                                                                {punch.is_matched ? 'Matched' : punch.match_status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {punch.device} &bull; {punch.verify_type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="font-medium text-foreground text-[11px]">{punch.punch_time}</p>
                                                    <p className="text-[9px] text-muted-foreground">{punch.time_ago}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-xs text-muted-foreground">
                                            No biometric scan logs recorded yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recent_requests.length > 0 ? (
                                        recent_requests.map((req) => (
                                            <div
                                                key={`${req.type}-${req.id}`}
                                                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/60 p-2 text-xs"
                                            >
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-foreground text-xs truncate">
                                                            {req.title}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'text-[9px] h-3.5 px-1 capitalize shrink-0',
                                                                req.status === 'approved'
                                                                    ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                                    : req.status === 'rejected'
                                                                    ? 'border-rose-500/30 text-rose-600 dark:text-rose-400'
                                                                    : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                                                            )}
                                                        >
                                                            {req.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {req.date_range}
                                                    </p>
                                                </div>

                                                <Button asChild variant="ghost" size="sm" className="h-6 text-[11px] px-2 shrink-0">
                                                    <Link href={req.url}>View</Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-xs text-muted-foreground">
                                            No recent leave or substitute requests.
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {teacher && teacher.qr_payload && (
                <QrPassModal
                    open={qrModalOpen}
                    onOpenChange={setQrModalOpen}
                    teacher={{
                        id: teacher.id,
                        full_name: teacher.full_name,
                        employee_id: teacher.employee_id,
                        department: teacher.department,
                        rank: teacher.rank,
                        qr_payload: teacher.qr_payload,
                    }}
                />
            )}
        </>
    );
}

InstructorDashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Instructor Dashboard', href: '/instructor/dashboard' }]}>
        {page}
    </AppLayout>
);
