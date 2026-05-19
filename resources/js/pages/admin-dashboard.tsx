import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    LayoutGrid,
    MapPin,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as leaveRequests } from '@/routes/leave-requests';
import { index as substituteRequests } from '@/routes/substitute-requests';

// ── Types ─────────────────────────────────────────────────────────
interface AdminStats {
    active_teachers: number;
    active_sections: number;
    pending_leave: number;
    pending_substitutes: number;
}

interface AdminScheduleItem {
    id: number;
    scheduled_date: string;
    subject_code: string;
    subject_title: string;
    semester_name: string;
    section: string | null;
    teacher_name: string | null;
    room: string | null;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'cancelled' | 'completed' | 'postponed';
}

interface PendingRequest {
    id: number;
    type: 'leave' | 'substitute';
    teacher_name: string;
    label: string;
    status: string;
    created_at: string;
    url: string;
}

interface AdminDashboardProps {
    stats: AdminStats;
    month_schedules: AdminScheduleItem[];
    pending_requests: PendingRequest[];
    current_month: string;
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

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
return 'Just now';
}

    if (diffMins < 60) {
return `${diffMins}m ago`;
}

    if (diffHours < 24) {
return `${diffHours}h ago`;
}

    if (diffDays === 1) {
return '1 day ago';
}

    if (diffDays < 30) {
return `${diffDays} days ago`;
}

    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths === 1) {
return '1 month ago';
}

    return `${diffMonths} months ago`;
}

// ── Status colour map ─────────────────────────────────────────────
const S = {
    scheduled: { dot: 'bg-primary',     border: 'border-l-primary',     pill: 'bg-primary/10 text-primary',                              label: 'Scheduled' },
    completed: { dot: 'bg-emerald-500', border: 'border-l-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Completed' },
    cancelled: { dot: 'bg-destructive', border: 'border-l-destructive', pill: 'bg-destructive/10 text-destructive',                      label: 'Cancelled' },
    postponed: { dot: 'bg-amber-500',   border: 'border-l-amber-500',   pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',       label: 'Postponed' },
} as const;

type StatusKey = keyof typeof S;

function statusStyle(s: string) {
 return S[s as StatusKey] ?? S.scheduled; 
}

// ── Admin Month Calendar ──────────────────────────────────────────
function AdminMonthCalendar({
    monthSchedules,
    selected,
    currentMonth,
    onSelect,
    onMonthChange,
}: {
    monthSchedules: AdminScheduleItem[];
    selected: Date;
    currentMonth: string;
    onSelect: (d: Date) => void;
    onMonthChange: (month: string) => void;
}) {
    const today = new Date();
    const [yr, moRaw] = currentMonth.split('-').map(Number);
    const mo = moRaw - 1;
    const firstDow = new Date(yr, mo, 1).getDay();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) {
cells.push(null);
}

    const isCurrentCalMonth = yr === today.getFullYear() && mo === today.getMonth();

    const goMonth = (delta: number) => {
        const next = new Date(yr, mo + delta, 1);
        onMonthChange(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    };

    // For admin: just track which dates have any schedules
    const datesWithClasses = useMemo(() => {
        const set = new Set<string>();

        for (const s of monthSchedules) {
            set.add(s.scheduled_date);
        }

        return set;
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
                    <button
                        onClick={() => goMonth(-1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => goMonth(1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Next month"
                    >
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
                    if (!day) {
return <div key={i} className="h-11" />;
}

                    const date = new Date(yr, mo, day);
                    const dateStr = toDateStr(date);
                    const isSel = sameDay(date, selected);
                    const isToday = sameDay(date, today);
                    const hasClasses = datesWithClasses.has(dateStr);

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
                                aria-label={`Select ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                                aria-pressed={isSel}
                            >
                                {day}
                            </button>
                            <div className="mt-0.5 flex h-2 items-center justify-center">
                                {hasClasses && (
                                    <span className={cn('h-1.5 w-1.5 rounded-full bg-primary', isSel && 'opacity-60')} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Classes scheduled
                </span>
            </div>
        </div>
    );
}

// ── Day classes table ─────────────────────────────────────────────
function DayClassesPanel({
    schedules,
    selectedDay,
    isSelToday,
}: {
    schedules: AdminScheduleItem[];
    selectedDay: Date;
    isSelToday: boolean;
}) {
    const label = isSelToday
        ? "Today's Classes"
        : selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {isSelToday
                            ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            : selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {schedules.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {schedules.length} {schedules.length === 1 ? 'class' : 'classes'}
                    </span>
                )}
            </div>

            {schedules.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                                <th className="pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Section</th>
                                <th className="pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</th>
                                <th className="pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Teacher</th>
                                <th className="pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Room</th>
                                <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {schedules.map((s) => {
                                const st = statusStyle(s.status);

                                return (
                                    <tr key={s.id} className="group transition-colors hover:bg-muted/30">
                                        <td className="py-2.5 pr-3">
                                            <span className="block text-sm font-semibold tabular-nums">{fmtTime(s.start_time)}</span>
                                            <span className="block text-xs text-muted-foreground tabular-nums">{fmtTime(s.end_time)}</span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <span className="text-sm font-medium">{s.section ?? '—'}</span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <span className="block text-sm font-semibold">{s.subject_code}</span>
                                            <span className="block max-w-[140px] truncate text-xs text-muted-foreground">{s.subject_title}</span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <span className="text-sm">{s.teacher_name ?? '—'}</span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            {s.room ? (
                                                <span className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground/60" />
                                                    {s.room}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground/60">—</span>
                                            )}
                                        </td>
                                        <td className="py-2.5">
                                            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', st.pill)}>
                                                {st.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No classes scheduled</p>
                    <p className="text-xs text-muted-foreground/60">Select another day to view its classes</p>
                </div>
            )}
        </div>
    );
}

// ── Pending Requests panel ────────────────────────────────────────
function PendingRequestsPanel({ requests }: { requests: PendingRequest[] }) {
    return (
        <Card className="gap-0 py-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                        <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold">Pending Requests</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                    <Link href={leaveRequests().url}>View all →</Link>
                </Button>
            </div>

            <CardContent className="p-0">
                {requests.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {requests.map((req) => (
                            <li key={`${req.type}-${req.id}`}>
                                <Link
                                    href={req.url}
                                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                                >
                                    <div className={cn(
                                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                        req.type === 'leave' ? 'bg-amber-500/10' : 'bg-rose-500/10',
                                    )}>
                                        {req.type === 'leave' ? (
                                            <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <Users className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                            <span className="truncate text-sm font-semibold">{req.teacher_name}</span>
                                            <Badge
                                                variant="secondary"
                                                className="h-4 shrink-0 px-1.5 py-0 text-[10px] font-semibold"
                                            >
                                                pending
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{req.label}</p>
                                        <p className="mt-1 text-[10px] text-muted-foreground/60">{timeAgo(req.created_at)}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <CheckCircle2 className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-semibold">No pending requests</p>
                        <p className="text-xs text-muted-foreground">All requests have been handled</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Admin Dashboard ───────────────────────────────────────────────
export default function AdminDashboard({ stats, month_schedules, pending_requests, current_month }: AdminDashboardProps) {
    const today = new Date();

    const [selectedDay, setSelectedDay] = useState<Date>(() => {
        const [yr, mo] = current_month.split('-').map(Number);

        if (today.getFullYear() === yr && today.getMonth() === mo - 1) {
return today;
}

        return new Date(yr, mo - 1, 1);
    });

    const handleMonthChange = (month: string) => {
        router.get(adminDashboard().url, { month }, { preserveState: false, preserveScroll: false });
    };

    const selDateStr = toDateStr(selectedDay);
    const selSchedules = useMemo(
        () => month_schedules.filter((s) => s.scheduled_date === selDateStr),
        [month_schedules, selDateStr],
    );

    const isSelToday = sameDay(selectedDay, today);

    const STATS = [
        {
            label: 'Active Teachers',
            value: stats.active_teachers,
            icon: GraduationCap,
            iconCls: 'text-blue-600 dark:text-blue-400',
            bgCls: 'bg-blue-500/10',
            href: null as string | null,
        },
        {
            label: 'Active Sections',
            value: stats.active_sections,
            icon: LayoutGrid,
            iconCls: 'text-violet-600 dark:text-violet-400',
            bgCls: 'bg-violet-500/10',
            href: null as string | null,
        },
        {
            label: 'Pending Leave',
            value: stats.pending_leave,
            icon: Calendar,
            iconCls: 'text-amber-600 dark:text-amber-400',
            bgCls: 'bg-amber-500/10',
            href: leaveRequests().url,
        },
        {
            label: 'Pending Substitutes',
            value: stats.pending_substitutes,
            icon: Users,
            iconCls: 'text-rose-600 dark:text-rose-400',
            bgCls: 'bg-rose-500/10',
            href: substituteRequests().url,
        },
    ] as const;

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">

                {/* ── Greeting ── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Faculty Administration</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {STATS.map(({ label, value, icon: Icon, iconCls, bgCls, href }) => {
                        const inner = (
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
                        );

                        return (
                            <Card key={label} className={cn('gap-0 py-0', href && 'transition-shadow hover:shadow-md')}>
                                {href ? (
                                    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
                                        {inner}
                                    </Link>
                                ) : inner}
                            </Card>
                        );
                    })}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* ── Calendar + Day Classes panel (2/3) ── */}
                    <Card className="gap-0 py-0 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-semibold">Faculty Schedule</span>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">

                                {/* Left: Calendar */}
                                <div className="px-5 py-5">
                                    <AdminMonthCalendar
                                        monthSchedules={month_schedules}
                                        selected={selectedDay}
                                        currentMonth={current_month}
                                        onSelect={setSelectedDay}
                                        onMonthChange={handleMonthChange}
                                    />
                                </div>

                                {/* Right: Selected day classes */}
                                <div className="overflow-x-auto px-5 py-5">
                                    <DayClassesPanel
                                        schedules={selSchedules}
                                        selectedDay={selectedDay}
                                        isSelToday={isSelToday}
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Pending Requests panel (1/3) ── */}
                    <div className="lg:col-span-1">
                        <PendingRequestsPanel requests={pending_requests} />
                    </div>

                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: adminDashboard().url }]}>
        {page}
    </AppLayout>
);
