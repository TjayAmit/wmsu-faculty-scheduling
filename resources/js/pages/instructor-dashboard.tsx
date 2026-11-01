import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    ExternalLink,
    FileText,
    Fingerprint,
    GraduationCap,
    MapPin,
    QrCode,
    ShieldAlert,
    Sparkles,
    User,
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

    return (
        <>
            <Head title="Instructor Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header: Professional Greeting for Instructor */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {teacher ? `${greeting}, ${teacher.full_name}` : greeting}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {teacher ? (
                                <>
                                    {teacher.department} &bull; <span className="font-medium text-foreground">{teacher.rank}</span> &bull; Daily schedule, room assignments, and academic workload overview
                                </>
                            ) : (
                                "Daily schedule, room assignments, and academic workload overview"
                            )}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {teacher?.qr_payload && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 h-9 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                                onClick={() => setQrModalOpen(true)}
                            >
                                <QrCode className="h-4 w-4" />
                                My QR Pass
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="gap-2 h-9">
                            <Link href="/teacher-schedules">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                My Schedule
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-2 h-9">
                            <Link href="/leave-requests/create">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                File Leave
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-2 h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/substitute-requests/create">
                                <Users className="h-4 w-4" />
                                Request Substitute
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Profile Link Warning if unlinked */}
                {!teacher && (
                    <Card className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                        <CardContent className="flex items-center gap-3 p-4">
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="text-sm">
                                <span className="font-semibold">Instructor profile not connected:</span> Your user account is not yet linked to an instructor profile. Please contact the Faculty Administrator.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Overview Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Live Date & Time */}
                    <div className="rounded-xl border border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]/20 dark:bg-[#800000]/10 p-4 shadow-sm transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Date & Time
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground font-mono">
                            {formattedTime}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>

                    {/* Card 2: Today's Classes */}
                    <button
                        type="button"
                        onClick={() => setScheduleTab('today')}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            scheduleTab === 'today'
                                ? 'border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20 dark:bg-blue-500/10'
                                : 'border-border bg-card hover:border-blue-500/40'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Today's Classes
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <CalendarCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.today_classes}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.today_classes > 0
                                ? `${stats.today_completed} completed • ${stats.today_classes - stats.today_completed} remaining`
                                : 'No classes scheduled today'}
                        </p>
                    </button>

                    {/* Card 3: Weekly Teaching Load */}
                    <button
                        type="button"
                        onClick={() => setScheduleTab('weekly')}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            scheduleTab === 'weekly'
                                ? 'border-purple-600/40 bg-purple-500/5 ring-1 ring-purple-500/20 dark:bg-purple-500/10'
                                : 'border-border bg-card hover:border-purple-500/40'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Weekly Load
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <BookOpen className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.total_units}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.assigned_courses_count} {stats.assigned_courses_count === 1 ? 'subject' : 'subjects'} • {stats.weekly_hours} hrs/week
                        </p>
                    </button>

                    {/* Card 4: Pending Requests */}
                    <button
                        type="button"
                        onClick={() => setActivityTab('requests')}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            stats.pending_requests > 0
                                ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 ring-1 ring-amber-500/20'
                                : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Pending Requests
                            </span>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                stats.pending_requests > 0
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                <FileText className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.pending_requests}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.pending_requests > 0 ? `${stats.pending_requests} awaiting approval` : 'All requests up to date'}
                        </p>
                    </button>
                </div>

                {/* 3. Compact Spotlight Banner: Live Class OR Day Status */}
                {current_or_next_class ? (
                    <Card className={cn(
                        'border transition-all shadow-sm',
                        current_or_next_class.is_live
                            ? 'border-emerald-500/50 bg-emerald-500/[0.04]'
                            : 'border-primary/30 bg-primary/[0.02]'
                    )}>
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3.5">
                                <div className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white',
                                    current_or_next_class.is_live ? 'bg-emerald-500 animate-pulse' : 'bg-primary'
                                )}>
                                    <Clock className="h-5 w-5" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={cn(
                                            'text-xs px-2 py-0.5',
                                            current_or_next_class.is_live
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        )}>
                                            {current_or_next_class.is_live ? 'Class In Session Now' : 'Next Scheduled Class'}
                                        </Badge>
                                        <span className="text-xs font-semibold text-foreground">
                                            {current_or_next_class.start_time} &ndash; {current_or_next_class.end_time}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            ({current_or_next_class.duration})
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold text-foreground">
                                        {current_or_next_class.subject_code} &mdash; {current_or_next_class.subject_title}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span>Section: <strong className="text-foreground">{current_or_next_class.section}</strong></span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-primary" />
                                            Room: <strong className="text-foreground">{current_or_next_class.room}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Clock In Status Indicator */}
                            <div className="shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-4">
                                {current_or_next_class.punched_in ? (
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Clocked In ({current_or_next_class.punch_time})</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                                        <Fingerprint className="h-4 w-4 text-primary animate-pulse" />
                                        <span>Clock in at {current_or_next_class.room}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border bg-card/60 shadow-sm">
                        <CardContent className="flex items-center justify-between p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground">All Clear for Today</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        No scheduled classes remaining for {today_date_display}.
                                    </p>
                                </div>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                                <Link href="/teacher-schedules">View Timetable &rarr;</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* 4. Streamlined Two-Column Layout (Reduced empty space, tighter cohesion) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column (7 cols): Schedule Hub & Activity/Requests */}
                    <div className="space-y-6 lg:col-span-7">
                        {/* Schedule Hub Card */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3.5 sm:p-4">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold">Teaching Schedule</CardTitle>
                                    <p className="text-[11px] text-muted-foreground">
                                        Daily schedule & regular weekly program
                                    </p>
                                </div>

                                {/* Schedule Tab Switcher */}
                                <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setScheduleTab('today')}
                                        className={cn(
                                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                            scheduleTab === 'today'
                                                ? 'bg-background text-foreground shadow-sm'
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
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Weekly Program
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3.5 sm:p-4">
                                {scheduleTab === 'today' ? (
                                    /* Today's Schedule List */
                                    <div className="space-y-2.5">
                                        {today_classes.length > 0 ? (
                                            today_classes.map((item, idx) => (
                                                <div
                                                    key={item.id || idx}
                                                    className={cn(
                                                        'flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border p-3 transition-all',
                                                        item.is_live
                                                            ? 'border-emerald-500/40 bg-emerald-500/[0.03]'
                                                            : 'border-border bg-background/50 hover:bg-muted/30'
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-center min-w-[78px] shrink-0">
                                                            <span className="text-xs font-bold text-foreground">
                                                                {item.start_time}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {item.end_time}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-0.5 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="font-bold text-sm text-foreground">
                                                                    {item.subject_code}
                                                                </span>
                                                                {item.is_live && (
                                                                    <Badge className="bg-emerald-500 text-white text-[10px] h-4 px-1.5">
                                                                        Live
                                                                    </Badge>
                                                                )}
                                                                {item.punched_in && (
                                                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] h-4 px-1.5">
                                                                        Present
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate max-w-sm">
                                                                {item.subject_title}
                                                            </p>
                                                            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                                                                <span>Sec: <strong className="text-foreground">{item.section}</strong></span>
                                                                <span>&bull;</span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 text-primary" />
                                                                    {item.room}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-1.5 sm:pt-0 border-border text-xs">
                                                        {item.punched_in ? (
                                                            <div className="text-right">
                                                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Clocked In
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">{item.punch_time}</span>
                                                            </div>
                                                        ) : item.is_past ? (
                                                            <span className="text-[11px] text-muted-foreground">Completed</span>
                                                        ) : (
                                                            <span className="text-[11px] text-muted-foreground">Upcoming</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            /* Reduced Empty State */
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <CalendarCheck className="h-8 w-8 text-muted-foreground/40" />
                                                <p className="mt-2 text-xs font-semibold text-foreground">No classes scheduled for today</p>
                                                <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                                                    Check your Weekly Program tab to see schedule for other days.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setScheduleTab('weekly')}
                                                    className="mt-3 h-7 text-xs"
                                                >
                                                    View Weekly Program
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Weekly Program Tab */
                                    <div className="space-y-3">
                                        {/* Day Pills */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                            {DAYS_OF_WEEK.map((day) => {
                                                const count = weekly_schedule[day.key]?.length || 0;
                                                const isSelected = selectedDay === day.key;
                                                return (
                                                    <button
                                                        key={day.key}
                                                        type="button"
                                                        onClick={() => setSelectedDay(day.key)}
                                                        className={cn(
                                                            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all shrink-0',
                                                            isSelected
                                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                                        )}
                                                    >
                                                        <span>{day.label}</span>
                                                        {count > 0 && (
                                                            <span className={cn(
                                                                'rounded-full px-1.5 text-[9px] font-bold',
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
                                        <div className="space-y-2 pt-1">
                                            {daySlots.length > 0 ? (
                                                daySlots.map((slot, sIdx) => (
                                                    <div
                                                        key={sIdx}
                                                        className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 shadow-sm hover:border-primary/30 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-2.5 min-w-0">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
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

                                                        <div className="text-right shrink-0 pl-3">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                {slot.start_time} - {slot.end_time}
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
                        </Card>

                        {/* Recent Activity & Requests Hub */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3.5 sm:p-4">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold">Activity & History</CardTitle>
                                    <p className="text-[11px] text-muted-foreground">
                                        Biometric scans & faculty request logs
                                    </p>
                                </div>

                                <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setActivityTab('punches')}
                                        className={cn(
                                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                            activityTab === 'punches'
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Scans ({recent_punches.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActivityTab('requests')}
                                        className={cn(
                                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                            activityTab === 'requests'
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Requests ({recent_requests.length})
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3.5 sm:p-4">
                                {activityTab === 'punches' ? (
                                    <div className="space-y-2">
                                        {recent_punches.length > 0 ? (
                                            recent_punches.map((punch) => (
                                                <div
                                                    key={punch.id}
                                                    className="flex items-center justify-between rounded-lg border border-border/80 bg-background/50 p-2.5 text-xs"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={cn(
                                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                                                            punch.is_matched
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        )}>
                                                            <Fingerprint className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground text-xs">
                                                                    {punch.room}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[9px] h-4 px-1',
                                                                        punch.is_matched
                                                                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                                            : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                                                                    )}
                                                                >
                                                                    {punch.is_matched ? 'Matched' : punch.match_status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {punch.device} &bull; {punch.verify_type}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0 pl-2">
                                                        <p className="font-medium text-foreground text-xs">{punch.punch_time}</p>
                                                        <p className="text-[9px] text-muted-foreground">{punch.time_ago}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-xs text-muted-foreground">
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
                                                    className="flex items-center justify-between rounded-lg border border-border/80 bg-background/50 p-2.5 text-xs"
                                                >
                                                    <div className="space-y-0.5 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-foreground text-xs">
                                                                {req.title}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-[9px] h-4 px-1 capitalize',
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
                                                            {req.date_range} &bull; {req.reason || 'No reason specified'}
                                                        </p>
                                                    </div>

                                                    <Button asChild variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                                                        <Link href={req.url}>View</Link>
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-xs text-muted-foreground">
                                                No recent leave or substitute requests.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (5 cols): Assigned Courses & Faculty Profile */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Assigned Courses Load */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3.5 sm:p-4">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold">Assigned Subjects</CardTitle>
                                    <p className="text-[11px] text-muted-foreground">
                                        Current semester academic teaching load
                                    </p>
                                </div>
                                <Badge variant="secondary" className="font-semibold text-xs">
                                    {assigned_courses.length} Courses
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-3.5 sm:p-4 space-y-2.5">
                                {assigned_courses.length > 0 ? (
                                    assigned_courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="rounded-lg border border-border bg-background/50 p-3 hover:border-primary/30 transition-all space-y-1.5"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-xs text-foreground">
                                                            {course.subject_code}
                                                        </span>
                                                        <Badge variant="outline" className="text-[9px] h-3.5 px-1 font-normal">
                                                            {course.units} Units
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">
                                                        {course.subject_title}
                                                    </p>
                                                </div>
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] shrink-0">
                                                    Sec {course.section}
                                                </Badge>
                                            </div>

                                            <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                                                <span className="truncate max-w-[180px]">
                                                    {course.schedule_display}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium text-foreground shrink-0">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    {course.room}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Reduced Empty State */
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                                        <p className="mt-2 text-xs font-semibold text-foreground">No subjects assigned yet</p>
                                        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                                            Teaching assignments for this semester will appear here once finalized.
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <div className="border-t border-border p-2.5 bg-muted/20">
                                <Button asChild variant="ghost" size="sm" className="w-full justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8">
                                    <Link href="/draft-schedules">
                                        Request Schedule Adjustment
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        {/* Faculty Profile Card (Tightly integrated, no wasted space) */}
                        {teacher && (
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b border-border p-3.5 sm:p-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">Faculty Information</CardTitle>
                                        {teacher.biometric_pin && (
                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1">
                                                <Fingerprint className="h-3 w-3" />
                                                PIN: #{teacher.biometric_pin}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3.5 sm:p-4 space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Employee ID</span>
                                        <span className="font-mono font-semibold text-foreground">{teacher.employee_id}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Department</span>
                                        <span className="font-semibold text-foreground">{teacher.department}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Academic Rank</span>
                                        <span className="font-semibold text-foreground">{teacher.rank}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-muted-foreground">Employment</span>
                                        <span className="font-semibold text-foreground capitalize">
                                            {teacher.employment_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
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
