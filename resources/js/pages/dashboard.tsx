import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as teacherSchedulesIndex } from '@/routes/teacher-schedules';

// ── Types ─────────────────────────────────────────────────────────
interface ScheduleItem {
    id: number;
    scheduled_date: string;
    subject_code: string;
    subject_title: string;
    semester_name: string;
    start_time: string;
    end_time: string;
    room: string | null;
    section: string | null;
    status: 'scheduled' | 'cancelled' | 'completed' | 'postponed';
    is_holiday: boolean;
    holiday_name: string | null;
}

interface TodaySchedule {
    id: number;
    subject_code: string;
    subject_title: string;
    semester_name: string;
    start_time: string;
    end_time: string;
    room: string | null;
    section: string | null;
    status: string;
    is_holiday: boolean;
}

interface DashboardProps {
    stats: { today: number; this_week: number; this_month: number; completed_month: number };
    today_schedules: TodaySchedule[];
    month_schedules: ScheduleItem[];
    current_month: string;
    teacher: { name: string } | null;
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDuration(start: string, end: string) {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function getLive(scheduledDate: string, startTime: string, endTime: string) {
    if (scheduledDate !== toDateStr(new Date())) return null;
    const now = new Date(), start = new Date(startTime), end = new Date(endTime);
    if (now >= start && now < end) return { text: 'Now', pulse: true, cls: 'bg-emerald-500 text-white' };
    const mins = Math.floor((start.getTime() - now.getTime()) / 60000);
    if (mins > 0 && mins <= 60) return { text: `in ${mins}m`, pulse: false, cls: 'bg-primary/10 text-primary' };
    return null;
}

function getCountdown(startTime: string, endTime: string) {
    const now = new Date(), start = new Date(startTime), end = new Date(endTime);
    if (now >= start && now < end) return { text: 'In progress', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
    if (now >= end) return { text: 'Ended', cls: 'bg-muted text-muted-foreground' };
    const mins = Math.floor((start.getTime() - now.getTime()) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    return { text: `Starts in ${h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`}`, cls: 'bg-primary/10 text-primary' };
}

// ── Status colour map ─────────────────────────────────────────────
const S = {
    scheduled: { dot: 'bg-primary',       border: 'border-l-primary',       pill: 'bg-primary/10 text-primary',                          label: 'Scheduled' },
    completed: { dot: 'bg-emerald-500',   border: 'border-l-emerald-500',   pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Completed' },
    cancelled: { dot: 'bg-destructive',   border: 'border-l-destructive',   pill: 'bg-destructive/10 text-destructive',                  label: 'Cancelled' },
    postponed: { dot: 'bg-amber-500',     border: 'border-l-amber-500',     pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',   label: 'Postponed' },
} as const;

type StatusKey = keyof typeof S;

function statusStyle(s: string) { return S[s as StatusKey] ?? S.scheduled; }

// ── Month Calendar ────────────────────────────────────────────────
function MonthCalendar({
    monthSchedules,
    selected,
    currentMonth,
    onSelect,
    onMonthChange,
}: {
    monthSchedules: ScheduleItem[];
    selected: Date;
    currentMonth: string;
    onSelect: (d: Date) => void;
    onMonthChange: (month: string) => void;
}) {
    const today = new Date();
    const [yr, moRaw] = currentMonth.split('-').map(Number);
    const mo = moRaw - 1; // 0-indexed
    const firstDow = new Date(yr, mo, 1).getDay();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const isCurrentCalMonth = yr === today.getFullYear() && mo === today.getMonth();

    const goMonth = (delta: number) => {
        const next = new Date(yr, mo + delta, 1);
        onMonthChange(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    };

    // Map date string → unique statuses (for dots)
    const dateStatusMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        for (const s of monthSchedules) {
            if (!map[s.scheduled_date]) map[s.scheduled_date] = [];
            if (!map[s.scheduled_date].includes(s.status)) map[s.scheduled_date].push(s.status);
        }
        return map;
    }, [monthSchedules]);

    return (
        <div>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">
                    {new Date(yr, mo, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1">
                    {!isCurrentCalMonth && (
                        <Button
                            variant="ghost" size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => {
                                const n = new Date();
                                onMonthChange(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`);
                            }}
                        >
                            Today
                        </Button>
                    )}
                    <button onClick={() => goMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => goMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-1 grid grid-cols-7">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} className="h-11" />;
                    const date = new Date(yr, mo, day);
                    const dateStr = toDateStr(date);
                    const isSel = sameDay(date, selected);
                    const isToday = sameDay(date, today);
                    const statuses = dateStatusMap[dateStr] ?? [];

                    return (
                        <div key={i} className="flex flex-col items-center pb-1">
                            <button
                                onClick={() => onSelect(date)}
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all',
                                    isSel && 'bg-primary text-primary-foreground shadow-sm',
                                    !isSel && isToday && 'ring-2 ring-primary ring-offset-1 text-primary font-semibold hover:bg-primary/10',
                                    !isSel && !isToday && 'text-foreground hover:bg-muted',
                                )}
                            >
                                {day}
                            </button>
                            {/* Status dots */}
                            <div className="mt-0.5 flex h-2 items-center gap-0.5">
                                {statuses.slice(0, 3).map((s, di) => (
                                    <span key={di} className={cn('h-1.5 w-1.5 rounded-full', statusStyle(s).dot, isSel && 'opacity-60')} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3">
                {(Object.entries(S) as [StatusKey, typeof S[StatusKey]][]).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className={cn('h-2 w-2 rounded-full', val.dot)} />
                        {val.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Schedule card for a selected day ─────────────────────────────
function ScheduleCard({ s }: { s: ScheduleItem }) {
    const st = statusStyle(s.status);
    const duration = getDuration(s.start_time, s.end_time);
    const live = getLive(s.scheduled_date, s.start_time, s.end_time);

    return (
        <div className={cn('flex gap-4 rounded-lg border border-border border-l-4 bg-card px-4 py-3 transition-colors hover:bg-muted/30', st.border)}>
            {/* Time column */}
            <div className="flex w-20 shrink-0 flex-col items-start justify-center gap-0.5">
                <span className="text-sm font-bold tabular-nums">{fmtTime(s.start_time)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{fmtTime(s.end_time)}</span>
                <span className="text-[11px] font-medium text-muted-foreground/70">{duration}</span>
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0">
                    <span className="text-sm font-bold">{s.subject_code}</span>
                    {live && (
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', live.cls)}>
                            {live.pulse && <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" /></span>}
                            {live.text}
                        </span>
                    )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.subject_title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {s.room && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room}</span>
                    )}
                    {s.section && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.section}</span>
                    )}
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{s.semester_name}</span>
                </div>
            </div>

            {/* Right badges */}
            <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', st.pill)}>
                    {st.label}
                </span>
                {s.is_holiday && (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {s.holiday_name ?? 'Holiday'}
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Dashboard ─────────────────────────────────────────────────────
export default function Dashboard({ stats, today_schedules, month_schedules, current_month, teacher }: DashboardProps) {
    const today = new Date();

    // Initialise selected day: today if in viewed month, else 1st of viewed month
    const [selectedDay, setSelectedDay] = useState<Date>(() => {
        const [yr, mo] = current_month.split('-').map(Number);
        if (today.getFullYear() === yr && today.getMonth() === mo - 1) return today;
        return new Date(yr, mo - 1, 1);
    });

    // Navigate to a different month → reload page with ?month= param
    const handleMonthChange = (month: string) => {
        router.get(dashboard().url, { month }, { preserveState: false, preserveScroll: false });
    };

    // Schedules for the selected day
    const selDateStr = toDateStr(selectedDay);
    const selSchedules = useMemo(
        () => month_schedules.filter((s) => s.scheduled_date === selDateStr),
        [month_schedules, selDateStr],
    );

    // Next upcoming class today (for right panel)
    const nextClass = today_schedules.find(
        (s) => s.status === 'scheduled' && new Date(s.start_time) > today,
    ) ?? today_schedules.find((s) => s.status === 'scheduled') ?? null;

    const isSelToday = sameDay(selectedDay, today);
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = teacher?.name.split(' ')[0] ?? null;

    const STATS = [
        { label: 'Classes Today', value: stats.today,          icon: Calendar,     iconCls: 'text-primary',                              bgCls: 'bg-primary/10' },
        { label: 'This Week',     value: stats.this_week,       icon: BookOpen,     iconCls: 'text-sky-600 dark:text-sky-400',            bgCls: 'bg-sky-500/10' },
        { label: 'This Month',    value: stats.this_month,      icon: Clock,        iconCls: 'text-violet-600 dark:text-violet-400',      bgCls: 'bg-violet-500/10' },
        { label: 'Completed',     value: stats.completed_month, icon: CheckCircle2, iconCls: 'text-emerald-600 dark:text-emerald-400',    bgCls: 'bg-emerald-500/10' },
    ] as const;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">

                {/* ── Greeting ── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {firstName ? `${greeting}, ${firstName}` : greeting}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {STATS.map(({ label, value, icon: Icon, iconCls, bgCls }) => (
                        <Card key={label} className="gap-0 py-0">
                            <CardContent className="px-5 py-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                                        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                                    </div>
                                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bgCls)}>
                                        <Icon className={cn('h-5 w-5', iconCls)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* ── Calendar + Day Schedule panel (2/3) ── */}
                    <Card className="gap-0 py-0 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-semibold">My Schedule</span>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                                <Link href={teacherSchedulesIndex().url}>View all →</Link>
                            </Button>
                        </div>

                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">

                                {/* Left: Calendar */}
                                <div className="px-5 py-5">
                                    <MonthCalendar
                                        monthSchedules={month_schedules}
                                        selected={selectedDay}
                                        currentMonth={current_month}
                                        onSelect={setSelectedDay}
                                        onMonthChange={handleMonthChange}
                                    />
                                </div>

                                {/* Right: Selected day schedule */}
                                <div className="flex flex-col px-5 py-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {isSelToday ? "Today's Classes" : selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {isSelToday
                                                    ? today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                                    : selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
                                            </p>
                                        </div>
                                        {selSchedules.length > 0 && (
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                                {selSchedules.length} {selSchedules.length === 1 ? 'class' : 'classes'}
                                            </span>
                                        )}
                                    </div>

                                    {selSchedules.length > 0 ? (
                                        <div className="space-y-2 overflow-y-auto">
                                            {selSchedules.map((s) => <ScheduleCard key={s.id} s={s} />)}
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <Calendar className="h-5 w-5 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {isSelToday ? 'No classes today' : 'No classes on this day'}
                                            </p>
                                            <p className="text-xs text-muted-foreground/60">Select another day to view its schedule</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Next class panel (1/3) ── */}
                    <div className="flex flex-col gap-3 lg:col-span-1">
                        <Card className="gap-0 overflow-hidden py-0">
                            <div className="bg-primary px-5 pb-4 pt-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                                    Next Class Today
                                </p>
                                {nextClass ? (
                                    <>
                                        <p className="mt-1.5 text-xl font-bold leading-tight text-primary-foreground">{nextClass.subject_code}</p>
                                        <p className="mt-0.5 truncate text-sm text-primary-foreground/80">{nextClass.subject_title}</p>
                                    </>
                                ) : (
                                    <p className="mt-1.5 text-sm font-medium text-primary-foreground/80">No upcoming classes</p>
                                )}
                            </div>

                            <CardContent className="px-5 py-4">
                                {nextClass ? (
                                    <div className="flex flex-col gap-4">
                                        {(() => {
                                            const c = getCountdown(nextClass.start_time, nextClass.end_time);
                                            return (
                                                <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', c.cls)}>
                                                    <Clock className="h-3 w-3" />{c.text}
                                                </span>
                                            );
                                        })()}

                                        <div className="rounded-xl bg-muted/50 px-4 py-3">
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
                                            <p className="text-base font-bold">{fmtTime(nextClass.start_time)} – {fmtTime(nextClass.end_time)}</p>
                                        </div>

                                        <div className="space-y-2.5">
                                            {nextClass.room && (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Room</p>
                                                        <p className="truncate text-sm font-semibold">{nextClass.room}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {nextClass.section && (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Section</p>
                                                        <p className="truncate text-sm font-semibold">{nextClass.section}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Semester</p>
                                                    <p className="truncate text-sm font-semibold">{nextClass.semester_name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {nextClass.is_holiday && (
                                            <Badge variant="outline" className="w-fit">Holiday</Badge>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <CheckCircle2 className="h-6 w-6 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm font-semibold">All done for today</p>
                                        <p className="text-xs text-muted-foreground">No more classes remaining</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={teacherSchedulesIndex().url}>
                                <Calendar className="mr-2 h-4 w-4" />
                                View full schedule
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: dashboard().url }]}>
        {page}
    </AppLayout>
);
