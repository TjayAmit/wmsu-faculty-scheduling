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
    BookOpen,
    UserCheck,
    Plus,
    Clock,
    ArrowUpRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as leaveRequests } from '@/routes/leave-requests';
import { index as substituteRequests, create as substituteRequestsCreate } from '@/routes/substitute-requests';
import { index as teachersRoute } from '@/routes/teachers';
import { index as curriculaRoute } from '@/routes/curricula';
import { index as sectionsRoute } from '@/routes/sections';

// ── Types ─────────────────────────────────────────────────────────
interface AdminStats {
    total_teachers: number;
    active_teachers: number;
    total_curricula: number;
    programs_with_curriculum?: number;
    active_sections: number;
    pending_leave: number;
    total_substitutes: number;
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

interface DashboardSubstituteItem {
    id: number;
    requesting_teacher: string;
    substitute_teacher: string;
    subject_code: string | null;
    subject_title: string | null;
    section: string | null;
    date: string | null;
    reason: string | null;
    status: string;
    created_at: string | null;
    url: string;
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
    substitute_requests?: DashboardSubstituteItem[];
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

    // For admin: track which dates have any schedules
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

// ── Requests & Substitute Hub panel ───────────────────────────────
function RequestsHubPanel({
    substituteRequestsList = [],
    pendingRequests = [],
    pendingSubstitutesCount = 0,
    pendingLeaveCount = 0,
}: {
    substituteRequestsList?: DashboardSubstituteItem[];
    pendingRequests: PendingRequest[];
    pendingSubstitutesCount: number;
    pendingLeaveCount: number;
}) {
    const [activeTab, setActiveTab] = useState<'substitutes' | 'pending'>('substitutes');

    return (
        <Card className="gap-0 py-0 overflow-hidden shadow-xs">
            {/* Tab header buttons */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 sm:px-4 pt-2">
                <div className="flex gap-1 -mb-px">
                    <button
                        type="button"
                        onClick={() => setActiveTab('substitutes')}
                        className={cn(
                            'flex items-center gap-1.5 pb-2.5 px-2.5 text-xs font-semibold border-b-2 transition-colors',
                            activeTab === 'substitutes'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <UserCheck className="size-3.5" />
                        Substitute Requests
                        {pendingSubstitutesCount > 0 ? (
                            <span className="rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 text-[10px] font-bold">
                                {pendingSubstitutesCount}
                            </span>
                        ) : substituteRequestsList.length > 0 ? (
                            <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono">
                                {substituteRequestsList.length}
                            </span>
                        ) : null}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={cn(
                            'flex items-center gap-1.5 pb-2.5 px-2.5 text-xs font-semibold border-b-2 transition-colors',
                            activeTab === 'pending'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Calendar className="size-3.5" />
                        Pending Queue
                        {pendingRequests.length > 0 && (
                            <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-1 pb-2">
                    {activeTab === 'substitutes' ? (
                        <>
                            <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                                <Link href={substituteRequests().url}>View all →</Link>
                            </Button>
                            <Button asChild size="sm" className="h-6 px-2 text-[11px] gap-1 bg-[#800000] hover:bg-[#660000] text-white">
                                <Link href={substituteRequestsCreate().url}>
                                    <Plus className="size-3" /> New
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                            <Link href={leaveRequests().url}>View all →</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Content for TAB 1: Substitute Requests */}
            {activeTab === 'substitutes' && (
                <CardContent className="p-0">
                    {substituteRequestsList.length > 0 ? (
                        <ul className="divide-y divide-border/70 max-h-[460px] overflow-y-auto">
                            {substituteRequestsList.map((sub) => {
                                const isPending = sub.status === 'pending';
                                const isApproved = sub.status === 'approved';

                                return (
                                    <li key={sub.id}>
                                        <Link
                                            href={sub.url}
                                            className="flex flex-col gap-1.5 p-3.5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="truncate text-xs font-bold text-foreground">
                                                        {sub.requesting_teacher}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">→</span>
                                                    <span className="truncate text-xs text-muted-foreground font-medium">
                                                        {sub.substitute_teacher}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={isApproved ? 'default' : isPending ? 'secondary' : 'destructive'}
                                                    className={cn(
                                                        'text-[10px] h-4 px-1.5 font-semibold capitalize shrink-0',
                                                        isPending && 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
                                                        isApproved && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                                                    )}
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                <span className="truncate max-w-[210px]">
                                                    {sub.subject_code ? `${sub.subject_code}${sub.section ? ` (${sub.section})` : ''}` : (sub.reason || 'Substitute class coverage')}
                                                </span>
                                                {sub.date && (
                                                    <span className="shrink-0 font-medium text-foreground text-[10px]">
                                                        {sub.date}
                                                    </span>
                                                )}
                                            </div>

                                            {sub.created_at && (
                                                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 pt-0.5">
                                                    <Clock className="size-2.5" />
                                                    <span>Filed {timeAgo(sub.created_at)}</span>
                                                </div>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center gap-2.5 px-5 py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <UserCheck className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">No Substitute Requests</p>
                                <p className="text-xs text-muted-foreground max-w-[220px]">
                                    No faculty substitute coverage requests filed or pending approval.
                                </p>
                            </div>
                            <Button asChild size="sm" variant="outline" className="mt-2 text-xs h-7 gap-1 border-primary/30 text-primary hover:bg-primary/5">
                                <Link href={substituteRequestsCreate().url}>
                                    <Plus className="size-3" /> File Substitute Request
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            )}

            {/* Content for TAB 2: Pending Requests Queue */}
            {activeTab === 'pending' && (
                <CardContent className="p-0">
                    {pendingRequests.length > 0 ? (
                        <ul className="divide-y divide-border/70 max-h-[460px] overflow-y-auto">
                            {pendingRequests.map((req) => (
                                <li key={`${req.type}-${req.id}`}>
                                    <Link
                                        href={req.url}
                                        className="flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
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
                                                    className="h-4 shrink-0 px-1.5 py-0 text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
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
                            <p className="text-xs text-muted-foreground">All leave and substitute filings have been processed.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// ── Admin Dashboard ───────────────────────────────────────────────
export default function AdminDashboard({
    stats,
    month_schedules,
    substitute_requests = [],
    pending_requests = [],
    current_month,
}: AdminDashboardProps) {
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

    // 5 Comprehensive KPI Cards
    const STATS = [
        {
            label: 'Total Teachers',
            value: stats.total_teachers,
            subtext: `${stats.active_teachers} currently active`,
            icon: GraduationCap,
            iconCls: 'text-primary-foreground',
            bgCls: 'bg-white/20',
            href: teachersRoute().url,
            isFeatured: true,
        },
        {
            label: 'Total Curriculum',
            value: stats.total_curricula,
            subtext: `${stats.programs_with_curriculum ?? 0} academic programs`,
            icon: BookOpen,
            iconCls: 'text-emerald-600 dark:text-emerald-400',
            bgCls: 'bg-emerald-500/10',
            href: curriculaRoute().url,
            isFeatured: false,
        },
        {
            label: 'Active Sections',
            value: stats.active_sections,
            subtext: 'Student class cohorts',
            icon: LayoutGrid,
            iconCls: 'text-violet-600 dark:text-violet-400',
            bgCls: 'bg-violet-500/10',
            href: sectionsRoute().url,
            isFeatured: false,
        },
        {
            label: 'Substitute Requests',
            value: stats.pending_substitutes,
            subtext: `${stats.total_substitutes} total filed (${stats.pending_substitutes} pending)`,
            icon: UserCheck,
            iconCls: 'text-rose-600 dark:text-rose-400',
            bgCls: 'bg-rose-500/10',
            href: substituteRequests().url,
            isFeatured: false,
        },
        {
            label: 'Pending Leave',
            value: stats.pending_leave,
            subtext: 'Faculty leave filings',
            icon: Calendar,
            iconCls: 'text-amber-600 dark:text-amber-400',
            bgCls: 'bg-amber-500/10',
            href: leaveRequests().url,
            isFeatured: false,
        },
    ] as const;

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">

                {/* ── Greeting ── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Faculty Administration</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* ── 5 Stat cards (Total Teachers, Total Curriculum, Sections, Substitutes, Leave) ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {STATS.map(({ label, value, subtext, icon: Icon, iconCls, bgCls, href, isFeatured }) => {
                        const inner = isFeatured ? (
                            <CardContent className="relative h-full flex flex-col justify-between p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/75">{label}</p>
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                                        <Icon className="h-4.5 w-4.5 text-primary-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground">{value}</p>
                                    <p className="mt-1 text-xs text-primary-foreground/70 truncate">{subtext}</p>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="h-full flex flex-col justify-between p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', bgCls)}>
                                        <Icon className={cn('h-4.5 w-4.5', iconCls)} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground truncate">{subtext}</p>
                                </div>
                            </CardContent>
                        );

                        return (
                            <Card
                                key={label}
                                className={cn(
                                    'relative gap-0 overflow-hidden py-0 min-h-[115px] transition-all duration-200 hover:shadow-md cursor-pointer',
                                    isFeatured ? 'bg-primary text-primary-foreground' : 'bg-card border-border hover:border-primary/40',
                                )}
                            >
                                {isFeatured && (
                                    <>
                                        <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                                        <span className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10" />
                                    </>
                                )}
                                <Link
                                    href={href}
                                    className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    {inner}
                                </Link>
                            </Card>
                        );
                    })}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* ── Calendar + Day Classes panel (2/3) ── */}
                    <Card className="gap-0 py-0 lg:col-span-2 shadow-xs">
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

                    {/* ── Requests & Substitute Hub (1/3) ── */}
                    <div className="lg:col-span-1">
                        <RequestsHubPanel
                            substituteRequestsList={substitute_requests}
                            pendingRequests={pending_requests}
                            pendingSubstitutesCount={stats.pending_substitutes}
                            pendingLeaveCount={stats.pending_leave}
                        />
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
