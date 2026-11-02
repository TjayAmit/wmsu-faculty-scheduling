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
    department?: string | null;
    room: string | null;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'cancelled' | 'completed' | 'postponed';
    attendance_status?: 'present' | 'absent' | 'in_session' | 'scheduled' | 'cancelled';
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
    present:    { dot: 'bg-emerald-500', border: 'border-l-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', label: 'Present' },
    absent:     { dot: 'bg-rose-500',    border: 'border-l-rose-500',    pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',       label: 'Absent' },
    in_session: { dot: 'bg-blue-500',    border: 'border-l-blue-500',    pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',       label: 'In Session' },
    scheduled:  { dot: 'bg-slate-400',   border: 'border-l-slate-400',   pill: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-border',         label: 'Scheduled' },
    completed:  { dot: 'bg-emerald-500', border: 'border-l-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', label: 'Present' },
    cancelled:  { dot: 'bg-destructive', border: 'border-l-destructive', pill: 'bg-destructive/10 text-destructive border-destructive/25',                 label: 'Cancelled' },
    postponed:  { dot: 'bg-amber-500',   border: 'border-l-amber-500',   pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',  label: 'Postponed' },
} as const;

type StatusKey = keyof typeof S;

function statusStyle(schedule: AdminScheduleItem) {
    if (schedule.attendance_status && S[schedule.attendance_status as StatusKey]) {
        return S[schedule.attendance_status as StatusKey];
    }
    return S[schedule.status as StatusKey] ?? S.scheduled; 
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

    // For admin: track which dates have any schedules and how many
    const dateClassCounts = useMemo(() => {
        const map = new Map<string, number>();

        for (const s of monthSchedules) {
            map.set(s.scheduled_date, (map.get(s.scheduled_date) ?? 0) + 1);
        }

        return map;
    }, [monthSchedules]);

    return (
        <div className="flex flex-col h-full justify-between">
            <div>
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground">
                        {new Date(yr, mo, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-1">
                        {!isCurrentCalMonth && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px]"
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
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => goMonth(1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Day-of-week headers */}
                <div className="mb-1 grid grid-cols-7">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-y-0.5">
                    {cells.map((day, i) => {
                        if (!day) {
                            return <div key={i} className="h-9" />;
                        }

                        const date = new Date(yr, mo, day);
                        const dateStr = toDateStr(date);
                        const isSel = sameDay(date, selected);
                        const isToday = sameDay(date, today);
                        const classCount = dateClassCounts.get(dateStr) ?? 0;

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <button
                                    onClick={() => onSelect(date)}
                                    className={cn(
                                        'relative flex h-8 w-8 flex-col items-center justify-center rounded-lg text-xs font-medium transition-all',
                                        isSel && 'bg-primary text-primary-foreground shadow-xs font-semibold',
                                        !isSel && isToday && 'ring-1 ring-primary text-primary font-semibold bg-primary/5 hover:bg-primary/10',
                                        !isSel && !isToday && 'text-foreground hover:bg-muted',
                                    )}
                                    aria-label={`Select ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                                    aria-pressed={isSel}
                                >
                                    <span>{day}</span>
                                    {classCount > 0 && (
                                        <span
                                            className={cn(
                                                'mt-0.5 h-1 w-1 rounded-full',
                                                isSel ? 'bg-primary-foreground' : 'bg-primary',
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Compact Legend & Month Summary */}
            <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Classes scheduled
                </span>
                <span className="font-medium text-foreground/80">
                    {monthSchedules.length} {monthSchedules.length === 1 ? 'session' : 'sessions'} this month
                </span>
            </div>
        </div>
    );
}

// ── Day Attendance Donut / Pie Chart Overview ────────────────────
function DayAttendanceOverview({ schedules, selectedDateStr }: { schedules: AdminScheduleItem[]; selectedDateStr: string }) {
    const totalClasses = schedules.length;
    const presentCount = schedules.filter((s) => s.attendance_status === 'present').length;
    const absentCount = schedules.filter((s) => s.attendance_status === 'absent').length;
    const scheduledCount = schedules.filter((s) => s.attendance_status === 'scheduled' || s.attendance_status === 'in_session').length;

    const [hovered, setHovered] = useState<'total' | 'present' | 'absent' | 'scheduled' | null>(null);

    // Donut math: radius = 34, Circumference = 2 * PI * 34 ≈ 213.628
    const C = 213.628;

    const presentLen = totalClasses > 0 ? (presentCount / totalClasses) * C : 0;
    const absentLen = totalClasses > 0 ? (absentCount / totalClasses) * C : 0;
    const scheduledLen = totalClasses > 0 ? (scheduledCount / totalClasses) * C : 0;

    // Offsets starting from top (-90deg rotation in SVG)
    const presentOffset = 0;
    const absentOffset = -presentLen;
    const scheduledOffset = -(presentLen + absentLen);

    const presentPct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    const absentPct = totalClasses > 0 ? Math.round((absentCount / totalClasses) * 100) : 0;

    return (
        <div className="mb-3 rounded-xl border border-border/80 bg-background/50 p-2.5 sm:p-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* ── Pie / Donut Chart ── */}
                <div className="relative flex items-center justify-center shrink-0">
                    <svg
                        width="84"
                        height="84"
                        viewBox="0 0 100 100"
                        className="-rotate-90 transform transition-transform"
                    >
                        {/* Gray base background track representing total scheduled classes */}
                        <circle
                            cx="50"
                            cy="50"
                            r="34"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="12"
                            className="opacity-25 dark:opacity-20"
                        />

                        {/* Gray slice for Scheduled / In-Session classes */}
                        {scheduledCount > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="34"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth={hovered === 'scheduled' ? 14 : 12}
                                strokeDasharray={`${scheduledLen} ${C - scheduledLen}`}
                                strokeDashoffset={scheduledOffset}
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Green slice for Present */}
                        {presentCount > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="34"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth={hovered === 'present' ? 14 : 12}
                                strokeDasharray={`${presentLen} ${C - presentLen}`}
                                strokeDashoffset={presentOffset}
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Red slice for Absent */}
                        {absentCount > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="34"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth={hovered === 'absent' ? 14 : 12}
                                strokeDasharray={`${absentLen} ${C - absentLen}`}
                                strokeDashoffset={absentOffset}
                                className="transition-all duration-300"
                            />
                        )}
                    </svg>

                    {/* Donut Center Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        {hovered === 'present' ? (
                            <>
                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                                    {presentCount}
                                </span>
                                <span className="text-[8px] font-semibold text-emerald-600/80 uppercase tracking-tight mt-0.5">
                                    Present
                                </span>
                            </>
                        ) : hovered === 'absent' ? (
                            <>
                                <span className="text-base font-bold text-rose-600 dark:text-rose-400 leading-none">
                                    {absentCount}
                                </span>
                                <span className="text-[8px] font-semibold text-rose-600/80 uppercase tracking-tight mt-0.5">
                                    Absent
                                </span>
                            </>
                        ) : hovered === 'scheduled' ? (
                            <>
                                <span className="text-base font-bold text-slate-500 leading-none">
                                    {scheduledCount}
                                </span>
                                <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-tight mt-0.5">
                                    Scheduled
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-base font-bold text-foreground leading-none">
                                    {totalClasses}
                                </span>
                                <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-tight mt-0.5">
                                    Total
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* ── 3 Metric Cards: Gray Total, Green Present, Red Absent ── */}
                <div className="grid grid-cols-3 gap-2 flex-1 w-full min-w-0">
                    {/* Gray: Total Classes under College of Education */}
                    <Link
                        href={`/attendance-monitor?date=${selectedDateStr}`}
                        onMouseEnter={() => setHovered('total')}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                            'flex flex-col justify-between rounded-lg border p-2 text-center transition-all cursor-pointer',
                            hovered === 'total'
                                ? 'border-slate-400 bg-slate-500/10 ring-1 ring-slate-400/30'
                                : 'border-border bg-muted/40 hover:border-slate-400/50',
                        )}
                    >
                        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase truncate">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span className="truncate">Total Classes</span>
                        </div>
                        <div className="text-base font-bold text-foreground leading-tight my-0.5">
                            {totalClasses}
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate" title="College of Education faculty">
                            College of Ed.
                        </div>
                    </Link>

                    {/* Green: Present */}
                    <Link
                        href={`/attendance-monitor?date=${selectedDateStr}&status=present`}
                        onMouseEnter={() => setHovered('present')}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                            'flex flex-col justify-between rounded-lg border p-2 text-center transition-all cursor-pointer',
                            hovered === 'present'
                                ? 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30'
                                : 'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50',
                        )}
                    >
                        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase truncate">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">Present</span>
                        </div>
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight my-0.5">
                            {presentCount}
                        </div>
                        <div className="text-[9px] font-medium text-emerald-600/80 dark:text-emerald-400/80 truncate">
                            {presentPct}% rate
                        </div>
                    </Link>

                    {/* Red: Absent */}
                    <Link
                        href={`/attendance-monitor?date=${selectedDateStr}&status=absent`}
                        onMouseEnter={() => setHovered('absent')}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                            'flex flex-col justify-between rounded-lg border p-2 text-center transition-all cursor-pointer',
                            hovered === 'absent'
                                ? 'border-rose-500 bg-rose-500/15 ring-1 ring-rose-500/30'
                                : 'border-rose-500/25 bg-rose-500/5 hover:border-rose-500/50',
                        )}
                    >
                        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase truncate">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="truncate">Absent</span>
                        </div>
                        <div className="text-base font-bold text-rose-600 dark:text-rose-400 leading-tight my-0.5">
                            {absentCount}
                        </div>
                        <div className="text-[9px] font-medium text-rose-600/80 dark:text-rose-400/80 truncate">
                            {absentPct}% rate
                        </div>
                    </Link>
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                    {scheduledCount > 0 ? (
                        <>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {scheduledCount} upcoming / in progress
                        </>
                    ) : (
                        <span>College of Education Attendance</span>
                    )}
                </span>
                <Link
                    href={`/attendance-monitor?date=${selectedDateStr}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                    Monitor Absences <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}

// ── Day classes list (Compact high-density cards, zero text wrapping) ──
function DayClassesPanel({
    schedules,
    selectedDay,
    isSelToday,
}: {
    schedules: AdminScheduleItem[];
    selectedDay: Date;
    isSelToday: boolean;
}) {
    const selDateStr = toDateStr(selectedDay);
    const label = isSelToday
        ? "Today's Classes"
        : selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="flex flex-col h-full">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {label}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        &bull; {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <Badge variant="secondary" className="text-[11px] font-semibold px-2 py-0 h-5 shrink-0">
                    {schedules.length} {schedules.length === 1 ? 'class' : 'classes'}
                </Badge>
            </div>

            {/* Attendance Pie Chart & Summary Widget for Selected Day */}
            <DayAttendanceOverview schedules={schedules} selectedDateStr={selDateStr} />

            {schedules.length > 0 ? (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {schedules.map((s) => {
                        const st = statusStyle(s);

                        return (
                            <div
                                key={s.id}
                                className={cn(
                                    'flex items-center justify-between gap-3 rounded-lg border border-border border-l-3 bg-background/60 p-2.5 transition-colors hover:bg-muted/30',
                                    st.border,
                                )}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Time Badge */}
                                    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-muted/50 px-2 py-1 text-center min-w-[72px] shrink-0">
                                        <span className="text-[11px] font-bold text-foreground tabular-nums leading-tight">
                                            {fmtTime(s.start_time)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums leading-tight">
                                            {fmtTime(s.end_time)}
                                        </span>
                                    </div>

                                    {/* Subject, Section, Teacher, Room */}
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-xs font-bold text-foreground">
                                                {s.subject_code}
                                            </span>
                                            {s.section && (
                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium">
                                                    {s.section}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[260px]">
                                                {s.subject_title}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                                            <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                                                <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                                                {s.teacher_name ?? 'Unassigned'}
                                            </span>
                                            {s.room && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                        <span className="truncate">{s.room}</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 border', st.pill)}>
                                    {st.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-8 text-center rounded-lg border border-dashed border-border/70 bg-muted/10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">No classes scheduled</p>
                    <p className="text-[11px] text-muted-foreground">Select another date on the calendar to inspect classes.</p>
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
        <Card className="gap-0 py-0 overflow-hidden shadow-xs border-border bg-card">
            {/* Compact Header + Segmented Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('substitutes')}
                        className={cn(
                            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            activeTab === 'substitutes'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <UserCheck className="size-3.5 text-primary" />
                        <span>Substitutes</span>
                        {pendingSubstitutesCount > 0 ? (
                            <span className="rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 px-1.5 text-[10px] font-bold">
                                {pendingSubstitutesCount}
                            </span>
                        ) : (
                            <span className="rounded-full bg-muted px-1.5 text-[10px] font-semibold">
                                {substituteRequestsList.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={cn(
                            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            activeTab === 'pending'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Pending</span>
                        <span className={cn(
                            'rounded-full px-1.5 text-[10px] font-bold',
                            pendingRequests.length > 0
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-muted text-muted-foreground',
                        )}>
                            {pendingRequests.length}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    {activeTab === 'substitutes' ? (
                        <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={substituteRequestsCreate().url}>
                                <Plus className="size-3" /> New
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                            <Link href={leaveRequests().url}>Leave Queue</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Content for TAB 1: Substitute Requests */}
            {activeTab === 'substitutes' && (
                <CardContent className="p-3.5">
                    {substituteRequestsList.length > 0 ? (
                        <ul className="space-y-2 max-h-[310px] overflow-y-auto">
                            {substituteRequestsList.map((sub) => {
                                const isPending = sub.status === 'pending';
                                const isApproved = sub.status === 'approved';

                                return (
                                    <li key={sub.id}>
                                        <Link
                                            href={sub.url}
                                            className="flex flex-col gap-1 rounded-lg border border-border/80 bg-background/60 p-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="truncate text-xs font-bold text-foreground">
                                                        {sub.requesting_teacher}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">&rarr;</span>
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
                                                <span className="truncate">
                                                    {sub.subject_code ? `${sub.subject_code}${sub.section ? ` (${sub.section})` : ''}` : (sub.reason || 'Substitute coverage')}
                                                </span>
                                                {sub.date && (
                                                    <span className="shrink-0 font-medium text-foreground text-[10px] pl-2">
                                                        {sub.date}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-7 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <UserCheck className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-foreground">No Substitute Requests</p>
                                <p className="text-[11px] text-muted-foreground max-w-[210px]">
                                    No faculty substitute coverage requests filed or pending approval.
                                </p>
                            </div>
                            <Button asChild size="sm" variant="outline" className="mt-1 text-xs h-7 gap-1 border-primary/30 text-primary hover:bg-primary/5">
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
                <CardContent className="p-3.5">
                    {pendingRequests.length > 0 ? (
                        <ul className="space-y-2 max-h-[310px] overflow-y-auto">
                            {pendingRequests.map((req) => (
                                <li key={`${req.type}-${req.id}`}>
                                    <Link
                                        href={req.url}
                                        className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-background/60 p-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
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
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate text-xs font-semibold text-foreground">{req.teacher_name}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="h-4 shrink-0 px-1.5 py-0 text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                                >
                                                    pending
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{req.label}</p>
                                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">{timeAgo(req.created_at)}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-7 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-foreground">No Pending Requests</p>
                                <p className="text-[11px] text-muted-foreground max-w-[210px]">
                                    All leave and substitute filings have been processed.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}

            <div className="border-t border-border px-3.5 py-2 bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                    {pendingLeaveCount} pending leave &bull; {pendingSubstitutesCount} pending sub
                </span>
                <Link
                    href={activeTab === 'substitutes' ? substituteRequests().url : leaveRequests().url}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    View All <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
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
            subtext: `${stats.total_substitutes} filed (${stats.pending_substitutes} pending)`,
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

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-5 w-full min-w-0">

                {/* ── Compact Header with Quick Actions ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3.5">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Faculty Administration
                        </h1>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            {' '}&bull; Department schedules, faculty workload, and leave/substitute approvals
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <Button asChild size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/attendance-monitor">
                                <UserCheck className="h-3.5 w-3.5" />
                                Attendance Monitor
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <Link href={teachersRoute().url}>
                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                Teachers
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <Link href="/draft-schedules">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                Schedules
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <Link href={substituteRequestsCreate().url}>
                                <Plus className="h-3.5 w-3.5" />
                                New Substitute
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── 5 Compact Horizontal Stat Cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {STATS.map(({ label, value, subtext, icon: Icon, iconCls, bgCls, href, isFeatured }) => (
                        <Card
                            key={label}
                            className={cn(
                                'relative gap-0 overflow-hidden py-0 transition-all duration-200 hover:shadow-sm cursor-pointer min-w-0',
                                isFeatured ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/40',
                            )}
                        >
                            {isFeatured && (
                                <span className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                            )}
                            <Link
                                href={href}
                                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <div className="min-w-0">
                                    <p className={cn(
                                        'text-[10px] font-semibold uppercase tracking-wider truncate',
                                        isFeatured ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                    )}>
                                        {label}
                                    </p>
                                    <p className={cn(
                                        'mt-0.5 text-xl sm:text-2xl font-bold tracking-tight leading-tight',
                                        isFeatured ? 'text-primary-foreground' : 'text-foreground',
                                    )}>
                                        {value}
                                    </p>
                                    <p className={cn(
                                        'mt-0.5 text-[11px] truncate',
                                        isFeatured ? 'text-primary-foreground/75' : 'text-muted-foreground',
                                    )}>
                                        {subtext}
                                    </p>
                                </div>
                                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bgCls)}>
                                    <Icon className={cn('h-4 w-4', iconCls)} />
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>

                {/* ── Main Balanced Grid (8 cols Faculty Schedule, 4 cols Requests Hub) ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">

                    {/* ── Calendar + Day Classes panel (8/12) ── */}
                    <Card className="gap-0 py-0 lg:col-span-8 shadow-xs border-border bg-card overflow-hidden min-w-0">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-foreground">Faculty Schedule</span>
                                </div>
                            </div>
                            <Link
                                href="/draft-schedules"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                Manage Schedules <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>

                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 divide-y divide-border xl:grid-cols-12 xl:divide-x xl:divide-y-0">

                                {/* Left: Compact Calendar (5/12) */}
                                <div className="p-4 xl:col-span-5">
                                    <AdminMonthCalendar
                                        monthSchedules={month_schedules}
                                        selected={selectedDay}
                                        currentMonth={current_month}
                                        onSelect={setSelectedDay}
                                        onMonthChange={handleMonthChange}
                                    />
                                </div>

                                {/* Right: Selected day classes (7/12) */}
                                <div className="p-4 xl:col-span-7 min-w-0">
                                    <DayClassesPanel
                                        schedules={selSchedules}
                                        selectedDay={selectedDay}
                                        isSelToday={isSelToday}
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Requests & Substitute Hub (4/12) ── */}
                    <div className="lg:col-span-4 min-w-0">
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
