import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    LayoutGrid,
    MapPin,
    Users,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    index as teacherSchedules,
    show as teacherSchedulesShow,
} from '@/routes/teacher-schedules';
import type {
    TeacherSchedulesIndexProps,
    SubjectSummary,
    SessionSummary,
    SessionsPaginated,
    CalendarScheduleItem,
} from '@/types';
import {
    teacherScheduleStatusOptions,
    getTeacherScheduleStatusVariant,
    getTeacherScheduleStatusLabel,
    dayLabels,
} from '@/types/teacherSchedules';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parses a bare H:i:s time string into a display string like "8:00 AM". */
function formatTime(timeStr: string): string {
    const date = new Date(`1970-01-01T${timeStr}`);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/** Short date like "May 22". */
function formatShortDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/** Formats a Date object to YYYY-MM-DD */
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Check if two dates represent the same calendar day */
function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Comma-separated day abbreviations like "Mon, Wed". */
function formatDays(days: string[]): string {
    const abbr: Record<string, string> = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun',
    };

    return days.map((d) => abbr[d] ?? d).join(', ');
}

// ─── Calendar Month Grid Component ───────────────────────────────────────────

function TeacherCalendarGrid({
    year,
    month,
    selectedDate,
    datesWithClasses,
    holidayDates,
    activeMonths = [],
    onSelectDate,
    onPrevMonth,
    onNextMonth,
    onMonthChange,
    onToday,
}: {
    year: number;
    month: number;
    selectedDate: Date;
    datesWithClasses: Map<string, number>;
    holidayDates: Set<string>;
    activeMonths?: { year: number; month: number; label: string; count: number }[];
    onSelectDate: (d: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onMonthChange: (year: number, month: number) => void;
    onToday: () => void;
}) {
    const today = new Date();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrentCalMonth = year === today.getFullYear() && month === today.getMonth();

    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const isMonthInActive = activeMonths.some((am) => am.year === year && am.month === month);

    return (
        <div className="flex flex-col h-full">
            {/* Header / Month Navigation */}
            <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    {activeMonths.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Select
                                value={isMonthInActive ? `${year}-${month}` : '_custom'}
                                onValueChange={(val) => {
                                    if (val !== '_custom') {
                                        const [y, m] = val.split('-').map(Number);
                                        onMonthChange(y, m);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 font-bold text-sm border-border bg-background shadow-2xs hover:border-primary/50 transition-colors gap-2 min-w-[170px]">
                                    <SelectValue>{monthLabel}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {!isMonthInActive && (
                                        <SelectItem value="_custom" disabled>
                                            {monthLabel} (0 classes)
                                        </SelectItem>
                                    )}
                                    {activeMonths.map((am) => (
                                        <SelectItem key={`${am.year}-${am.month}`} value={`${am.year}-${am.month}`}>
                                            <span className="font-semibold">{am.label}</span>
                                            <span className="ml-1.5 text-muted-foreground font-mono text-[11px]">
                                                ({am.count} {am.count === 1 ? 'class' : 'classes'})
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!isMonthInActive && activeMonths.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onMonthChange(activeMonths[0].year, activeMonths[0].month)}
                                    className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1 px-2.5"
                                >
                                    <span>Jump to {activeMonths[0].label}</span>
                                    <ArrowRight className="size-3" />
                                </Button>
                            )}
                        </div>
                    ) : (
                        <h2 className="text-base font-bold text-foreground">
                            {monthLabel}
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {!isCurrentCalMonth && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs font-medium"
                            onClick={onToday}
                        >
                            Today
                        </Button>
                    )}
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Day of Week Headers */}
            <div className="mb-2 grid grid-cols-7 border-b border-border/60 pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div
                        key={d}
                        className="text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {cells.map((day, i) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${i}`}
                                className="min-h-[64px] sm:min-h-[72px] rounded-xl border border-dashed border-border/30 bg-muted/5 opacity-25"
                            />
                        );
                    }

                    const date = new Date(year, month, day);
                    const dateStr = toDateStr(date);
                    const isSel = sameDay(date, selectedDate);
                    const isToday = sameDay(date, today);
                    const classCount = datesWithClasses.get(dateStr) || 0;
                    const isHoliday = holidayDates.has(dateStr);

                    return (
                        <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => onSelectDate(date)}
                            className={cn(
                                'group relative flex min-h-[64px] sm:min-h-[72px] flex-col justify-between rounded-xl border p-2 text-left transition-all duration-150',
                                isSel
                                    ? 'border-[#800000] bg-[#800000]/5 ring-2 ring-[#800000]/25 shadow-xs dark:bg-[#800000]/10'
                                    : isToday
                                    ? 'border-primary/50 bg-primary/[0.03] hover:border-primary hover:bg-muted/40'
                                    : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs',
                            )}
                            aria-label={`Select ${dateStr}`}
                        >
                            {/* Day Header */}
                            <div className="flex items-center justify-between w-full">
                                <span
                                    className={cn(
                                        'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                                        isSel
                                            ? 'bg-[#800000] text-white shadow-xs'
                                            : isToday
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'text-foreground group-hover:text-primary',
                                    )}
                                >
                                    {day}
                                </span>

                                {isToday && !isSel && (
                                    <span className="text-[10px] font-bold text-primary tracking-tight">Today</span>
                                )}
                            </div>

                            {/* Class Pills & Indicator */}
                            <div className="mt-1 space-y-0.5">
                                {classCount > 0 ? (
                                    <div
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold truncate max-w-full',
                                            isSel
                                                ? 'bg-[#800000]/15 text-[#800000] dark:text-rose-300'
                                                : 'bg-primary/10 text-primary',
                                        )}
                                        title={`${classCount} classes scheduled`}
                                    >
                                        <Clock className="size-2.5 shrink-0" />
                                        <span className="truncate">{classCount} {classCount === 1 ? 'class' : 'classes'}</span>
                                    </div>
                                ) : isHoliday ? (
                                    <div
                                        className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 truncate max-w-full"
                                        title="Holiday"
                                    >
                                        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                                        <span className="truncate">Holiday</span>
                                    </div>
                                ) : (
                                    <div className="h-4" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Classes Scheduled
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Holiday
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full border border-primary/50 bg-primary/20" />
                        Today
                    </span>
                </div>
                <span className="italic">Click any date to inspect classes</span>
            </div>
        </div>
    );
}

// ─── Selected Day Schedule Panel (Right Pane) ────────────────────────────────

function SelectedDaySchedulePanel({
    selectedDate,
    schedules,
    onSelectDate,
    nextDateWithClasses,
    firstDateWithClasses,
    semesterName,
    onPrevDay,
    onNextDay,
}: {
    selectedDate: Date;
    schedules: CalendarScheduleItem[];
    onSelectDate: (d: Date) => void;
    nextDateWithClasses?: string | null;
    firstDateWithClasses?: string | null;
    semesterName?: string | null;
    onPrevDay: () => void;
    onNextDay: () => void;
}) {
    const today = new Date();
    const isToday = sameDay(selectedDate, today);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(selectedDate);

    const nextDateFormatted = useMemo(() => {
        if (!nextDateWithClasses) return null;
        const [y, m, d] = nextDateWithClasses.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }, [nextDateWithClasses]);

    const firstDateFormatted = useMemo(() => {
        if (!firstDateWithClasses) return null;
        const [y, m, d] = firstDateWithClasses.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }, [firstDateWithClasses]);

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/70 pb-3 gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Selected Day Timetable
                        </span>
                        {isToday && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold">
                                Today
                            </Badge>
                        )}
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-0.5">
                        {formattedDate}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="font-mono text-xs h-6 px-2 shrink-0">
                        {schedules.length} {schedules.length === 1 ? 'class' : 'classes'}
                    </Badge>
                </div>
            </div>

            {/* Schedule List or Empty State */}
            {schedules.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 px-4 text-center text-muted-foreground bg-card/60 rounded-xl border border-dashed border-border/80">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">No Classes Scheduled</p>
                        <p className="text-xs text-muted-foreground max-w-[280px]">
                            You have no teaching sessions assigned on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                        </p>
                        {semesterName && (
                            <p className="text-[11px] text-muted-foreground/75 max-w-[280px]">
                                Teaching loads are scheduled in {semesterName}.
                            </p>
                        )}
                    </div>

                    {nextDateWithClasses ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const [y, m, d] = nextDateWithClasses.split('-').map(Number);
                                onSelectDate(new Date(y, m - 1, d));
                            }}
                            className="mt-2 text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                        >
                            <span>Jump to Next Class ({nextDateFormatted})</span>
                            <ArrowRight className="size-3.5" />
                        </Button>
                    ) : firstDateWithClasses ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const [y, m, d] = firstDateWithClasses.split('-').map(Number);
                                onSelectDate(new Date(y, m - 1, d));
                            }}
                            className="mt-2 text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                        >
                            <span>View Semester Classes ({firstDateFormatted})</span>
                            <ArrowRight className="size-3.5" />
                        </Button>
                    ) : null}
                </div>
            ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {schedules.map((item) => {
                        const statusVariant = getTeacherScheduleStatusVariant(item.status);
                        const statusLabel = getTeacherScheduleStatusLabel(item.status);

                        return (
                            <Card
                                key={item.id}
                                className="overflow-hidden border border-border/80 bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors"
                            >
                                <div className="space-y-2.5">
                                    {/* Row 1: Time, Section, and Status */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                            <Clock className="size-3.5 shrink-0" />
                                            <span>
                                                {formatTime(item.start_time)} – {formatTime(item.end_time)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {item.section && (
                                                <Badge variant="outline" className="text-[10px] h-4.5 font-mono bg-background">
                                                    {item.section}
                                                </Badge>
                                            )}
                                            <Badge variant={statusVariant} className="text-[10px] h-4.5 font-medium capitalize">
                                                {statusLabel}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Row 2: Subject Info */}
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground line-clamp-1">
                                            {item.subject_code} — {item.subject_title}
                                        </h4>
                                    </div>

                                    {/* Row 3: Room and Semester */}
                                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                <MapPin className="size-3 text-muted-foreground" />
                                                {item.room ? `Room ${item.room}` : 'No room assigned'}
                                            </span>
                                            {item.semester_name && (
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="size-3 text-muted-foreground" />
                                                    {item.semester_name}
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            href={teacherSchedulesShow(item.id).url}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                        >
                                            <span>View Details</span>
                                            <ArrowRight className="size-3" />
                                        </Link>
                                    </div>

                                    {/* Holiday or Notes */}
                                    {item.is_holiday && (
                                        <div className="rounded bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                            Holiday: {item.holiday_name || 'Official School Holiday'}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Quick Day Stepper Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3 text-xs">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrevDay}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                >
                    <ChevronLeft className="size-3.5" />
                    <span>Previous Day</span>
                </Button>

                {!isToday && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectDate(today)}
                        className="h-7 text-[11px] text-primary hover:underline px-2"
                    >
                        Today
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNextDay}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                >
                    <span>Next Day</span>
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ─── Main Teacher Calendar View (Left: Calendar, Right: Daily Timetable) ─────

function TeacherCalendarView({
    calendarSchedules = [],
    subjects = [],
}: {
    calendarSchedules: CalendarScheduleItem[];
    subjects: SubjectSummary[];
}) {
    // 1. Semester & academic year context
    const semesterName = calendarSchedules[0]?.semester_name || null;
    const academicYear = calendarSchedules[0]?.academic_year || null;
    const firstDateWithClasses = calendarSchedules[0]?.scheduled_date || null;

    // 2. Pre-index active months that contain sessions
    const activeMonths = useMemo(() => {
        const map = new Map<string, { year: number; month: number; label: string; count: number }>();

        for (const s of calendarSchedules) {
            const [y, m] = s.scheduled_date.split('-').map(Number);
            const key = `${y}-${m - 1}`;
            const existing = map.get(key);
            if (existing) {
                existing.count++;
            } else {
                const dt = new Date(y, m - 1, 1);
                map.set(key, {
                    year: y,
                    month: m - 1,
                    label: dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    count: 1,
                });
            }
        }

        return Array.from(map.values()).sort((a, b) => a.year - b.year || a.month - b.month);
    }, [calendarSchedules]);

    // 3. Intelligently determine initial date so calendar doesn't open to an empty out-of-semester month
    const initialDate = useMemo(() => {
        const today = new Date();
        if (calendarSchedules.length === 0) return today;

        const todayStr = toDateStr(today);

        // A. If today has classes, start on today
        if (calendarSchedules.some((s) => s.scheduled_date === todayStr)) {
            return today;
        }

        // B. If today falls within the range of scheduled classes
        const minDateStr = calendarSchedules[0]?.scheduled_date;
        const maxDateStr = calendarSchedules[calendarSchedules.length - 1]?.scheduled_date;

        if (minDateStr && maxDateStr && todayStr >= minDateStr && todayStr <= maxDateStr) {
            // Find upcoming class from today or fall back to today
            const nextClass = calendarSchedules.find((s) => s.scheduled_date >= todayStr);
            if (nextClass) {
                const [y, m, d] = nextClass.scheduled_date.split('-').map(Number);
                return new Date(y, m - 1, d);
            }
            return today;
        }

        // C. If today is outside the semester range (e.g. wall clock is Nov 2026, semester was Jan-May 2026)
        // Default to the first date with scheduled classes so the user immediately sees their active timetable!
        const firstClass = calendarSchedules[0];
        if (firstClass) {
            const [y, m, d] = firstClass.scheduled_date.split('-').map(Number);
            return new Date(y, m - 1, d);
        }

        return today;
    }, [calendarSchedules]);

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => ({
        year: initialDate.getFullYear(),
        month: initialDate.getMonth(),
    }));

    // Keep view aligned when initialDate updates
    useEffect(() => {
        setSelectedDate(initialDate);
        setViewMonth({
            year: initialDate.getFullYear(),
            month: initialDate.getMonth(),
        });
    }, [initialDate]);

    // Pre-index schedules by date string (YYYY-MM-DD)
    const schedulesByDate = useMemo(() => {
        const map = new Map<string, CalendarScheduleItem[]>();

        for (const s of calendarSchedules) {
            const arr = map.get(s.scheduled_date) || [];
            arr.push(s);
            map.set(s.scheduled_date, arr);
        }

        return map;
    }, [calendarSchedules]);

    // Map dates to class counts
    const datesWithClasses = useMemo(() => {
        const map = new Map<string, number>();

        for (const [dateStr, list] of schedulesByDate.entries()) {
            map.set(dateStr, list.length);
        }

        return map;
    }, [schedulesByDate]);

    // Track holiday dates
    const holidayDates = useMemo(() => {
        const set = new Set<string>();

        for (const s of calendarSchedules) {
            if (s.is_holiday) {
                set.add(s.scheduled_date);
            }
        }

        return set;
    }, [calendarSchedules]);

    // Schedules for currently selected date
    const selectedDateStr = toDateStr(selectedDate);
    const selectedDaySchedules = useMemo(
        () => schedulesByDate.get(selectedDateStr) || [],
        [schedulesByDate, selectedDateStr],
    );

    // Today's classes
    const today = new Date();
    const todayStr = toDateStr(today);
    const todayClasses = useMemo(
        () => schedulesByDate.get(todayStr) || [],
        [schedulesByDate, todayStr],
    );

    // Count classes in the currently viewed month
    const currentMonthPrefix = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`;
    const currentMonthClassCount = useMemo(() => {
        let count = 0;
        for (const s of calendarSchedules) {
            if (s.scheduled_date.startsWith(currentMonthPrefix)) {
                count++;
            }
        }
        return count;
    }, [calendarSchedules, currentMonthPrefix]);

    // Next upcoming session from today onwards
    const nextUpcomingSession = useMemo(() => {
        const future = calendarSchedules
            .filter((s) => s.scheduled_date >= todayStr && s.status !== 'cancelled' && !s.is_holiday)
            .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.start_time.localeCompare(b.start_time));
        return future[0] || null;
    }, [calendarSchedules, todayStr]);

    // Next date with classes relative to selectedDate
    const nextDateWithClasses = useMemo(() => {
        const selStr = toDateStr(selectedDate);
        const futureDates = Array.from(datesWithClasses.keys())
            .filter((d) => d > selStr && (datesWithClasses.get(d) ?? 0) > 0)
            .sort();
        return futureDates[0] || null;
    }, [selectedDate, datesWithClasses]);

    const handleMonthChange = (year: number, month: number) => {
        setViewMonth({ year, month });
        const targetPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const firstInMonth = calendarSchedules.find((s) => s.scheduled_date.startsWith(targetPrefix));
        if (firstInMonth) {
            const [y, m, d] = firstInMonth.scheduled_date.split('-').map(Number);
            setSelectedDate(new Date(y, m - 1, d));
        } else {
            setSelectedDate(new Date(year, month, 1));
        }
    };

    const handlePrevMonth = () => {
        const newYear = viewMonth.month === 0 ? viewMonth.year - 1 : viewMonth.year;
        const newMonth = viewMonth.month === 0 ? 11 : viewMonth.month - 1;
        handleMonthChange(newYear, newMonth);
    };

    const handleNextMonth = () => {
        const newYear = viewMonth.month === 11 ? viewMonth.year + 1 : viewMonth.year;
        const newMonth = viewMonth.month === 11 ? 0 : viewMonth.month + 1;
        handleMonthChange(newYear, newMonth);
    };

    const handleToday = () => {
        const now = new Date();
        setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
        setSelectedDate(now);
    };

    const handleSelectDate = (d: Date) => {
        setSelectedDate(d);
        if (d.getMonth() !== viewMonth.month || d.getFullYear() !== viewMonth.year) {
            setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
        }
    };

    const handlePrevDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        handleSelectDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        handleSelectDate(next);
    };

    return (
        <div className="space-y-6">
            {/* 1. Overview Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]/20 dark:bg-[#800000]/10 p-4 shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Enrolled Subjects
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                        {subjects.length}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Active teaching load
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Term Sessions
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <CalendarDays className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                        {calendarSchedules.length}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Scheduled across semester
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Today's Classes
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                        {todayClasses.length}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {todayClasses.length > 0
                            ? `${todayClasses.length} sessions scheduled today`
                            : 'No classes scheduled today'}
                    </p>
                </div>

                <div className={cn(
                    'rounded-xl border p-4 shadow-sm transition-all',
                    nextUpcomingSession
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        : 'border-border bg-card'
                )}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Upcoming Class
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground truncate">
                        {nextUpcomingSession
                            ? formatShortDate(nextUpcomingSession.scheduled_date)
                            : calendarSchedules.length > 0
                            ? 'Term Completed'
                            : 'No Sessions'}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                        {nextUpcomingSession
                            ? `${nextUpcomingSession.subject_code} • ${formatTime(nextUpcomingSession.start_time)}`
                            : calendarSchedules.length > 0
                            ? `${calendarSchedules.length} sessions recorded`
                            : 'No active schedule'}
                    </p>
                </div>
            </div>

            {/* 2. Interactive Calendar & Timetable Split Card */}
            <Card className="gap-0 py-0 overflow-hidden shadow-xs border-border">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                        {/* Left Pane (Calendar): 8 Columns on Desktop for a more spacious calendar */}
                        <div className="p-4 sm:p-5 lg:col-span-8">
                            <TeacherCalendarGrid
                                year={viewMonth.year}
                                month={viewMonth.month}
                                selectedDate={selectedDate}
                                datesWithClasses={datesWithClasses}
                                holidayDates={holidayDates}
                                activeMonths={activeMonths}
                                onSelectDate={handleSelectDate}
                                onPrevMonth={handlePrevMonth}
                                onNextMonth={handleNextMonth}
                                onMonthChange={handleMonthChange}
                                onToday={handleToday}
                            />
                        </div>

                        {/* Right Pane (Daily Schedule): 4 Columns on Desktop (compact, focused timetable) */}
                        <div className="bg-muted/10 p-4 sm:p-5 lg:col-span-4 flex flex-col justify-between">
                            <SelectedDaySchedulePanel
                                selectedDate={selectedDate}
                                schedules={selectedDaySchedules}
                                onSelectDate={handleSelectDate}
                                nextDateWithClasses={nextDateWithClasses}
                                firstDateWithClasses={firstDateWithClasses}
                                semesterName={semesterName}
                                onPrevDay={handlePrevDay}
                                onNextDay={handleNextDay}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Subject Card (For alternative Subjects Grid view) ───────────────────────

interface SubjectCardProps {
    subject: SubjectSummary;
}

function SubjectCard({ subject }: SubjectCardProps) {
    const handleClick = () => {
        router.get(
            teacherSchedules().url,
            { subject_id: subject.subject_id, semester_id: subject.semester_id },
            { preserveState: false },
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        >
            <Card className="border-l-4 border-l-primary h-full transition-shadow hover:shadow-md gap-0 py-0">
                {/* header */}
                <div className="flex items-start gap-3 px-5 pt-5 pb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{subject.subject_code}</span>
                            <span className="text-muted-foreground text-xs">·</span>
                            {subject.scheduled > 0 ? (
                                <Badge variant="secondary" className="text-xs h-4 px-1.5">Scheduled</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs h-4 px-1.5">Done</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{subject.subject_title}</p>
                    </div>
                </div>

                {/* divider row: days + time */}
                <div className="px-5 pb-3 border-t border-border/50 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {formatDays(subject.days)} · {formatTime(subject.start_time)} – {formatTime(subject.end_time)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {subject.room ?? 'No room'} · {subject.section ?? 'No section'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span>{subject.semester_name} {subject.academic_year}</span>
                    </div>
                </div>

                {/* counters + next session */}
                <div className="px-5 pb-4 pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{subject.total} sessions</span>
                        {subject.completed > 0 && (
                            <Badge variant="default" className="text-xs h-4 px-1.5">{subject.completed} done</Badge>
                        )}
                        {subject.cancelled > 0 && (
                            <Badge variant="destructive" className="text-xs h-4 px-1.5">{subject.cancelled} cancelled</Badge>
                        )}
                        {subject.postponed > 0 && (
                            <Badge variant="outline" className="text-xs h-4 px-1.5 text-amber-600 border-amber-400">{subject.postponed} postponed</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                        View sessions
                        <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </Card>
        </button>
    );
}

// ─── Subjects View (Grid of Cards) ───────────────────────────────────────────

function SubjectsView({ subjects }: { subjects: SubjectSummary[] }) {
    return (
        <div>
            {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                    <div className="rounded-full bg-muted p-4">
                        <Calendar className="h-6 w-6 opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">No subjects scheduled yet</p>
                        <p className="text-xs mt-1">Sessions will appear here once a schedule is generated for you.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((s) => (
                        <SubjectCard key={`${s.subject_id}-${s.semester_id}`} subject={s} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Sessions View (For specific subject drilled-down view) ────────────────────

interface SessionRowProps {
    session: SessionSummary;
}

function SessionRow({ session }: SessionRowProps) {
    return (
        <button
            type="button"
            onClick={() => router.get(teacherSchedulesShow(session.id).url)}
            className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg"
        >
            <div className="flex items-center gap-4 bg-card px-4 py-3 transition-colors hover:bg-muted/30">
                {/* date block */}
                <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-semibold leading-none text-foreground">
                        {formatShortDate(session.scheduled_date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {dayLabels[session.day_of_week]?.slice(0, 3)}
                    </p>
                </div>

                {/* time */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[120px]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">
                        {formatTime(session.start_time)} – {formatTime(session.end_time)}
                    </span>
                </div>

                {/* notes indicator */}
                {session.notes && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[120px]">{session.notes}</span>
                    </div>
                )}

                {/* spacer */}
                <div className="flex-1" />

                {/* badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {session.is_holiday && (
                        <Badge
                            variant="outline"
                            className="text-xs h-5 px-1.5 border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                        >
                            Holiday
                        </Badge>
                    )}
                    <Badge variant={getTeacherScheduleStatusVariant(session.status)} className="text-xs h-5 px-1.5">
                        {getTeacherScheduleStatusLabel(session.status)}
                    </Badge>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
            </div>
        </button>
    );
}

interface SessionsViewProps {
    sessions: SessionsPaginated;
    subject: {
        id: number | null;
        code: string;
        title: string;
        semester_name: string;
        academic_year: string;
        section: string | null;
        room: string | null;
        start_time: string | null;
        end_time: string | null;
    };
    filters: {
        subject_id?: number;
        semester_id?: number;
        status?: string;
        per_page?: number;
    };
}

function SessionsView({ sessions, subject, filters }: SessionsViewProps) {
    const [status, setStatus] = useState(filters.status ?? '_all');
    const [perPage, setPerPage] = useState(filters.per_page ?? 15);

    const navigate = (params: Record<string, unknown>) => {
        router.get(
            teacherSchedules().url,
            {
                subject_id: filters.subject_id,
                semester_id: filters.semester_id,
                status: status === '_all' ? undefined : status,
                per_page: perPage,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ status: value === '_all' ? undefined : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    // Group visible sessions by month for visual separators
    const grouped = sessions.data.reduce<{ month: string; items: SessionSummary[] }[]>((acc, s) => {
        const month = new Date(s.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
        const last = acc[acc.length - 1];

        if (last && last.month === month) {
            last.items.push(s);
        } else {
            acc.push({ month, items: [s] });
        }

        return acc;
    }, []);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
            {/* back button */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.get(teacherSchedules().url)}
                    className="gap-1.5 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Schedule
                </Button>
            </div>

            {/* subject header card */}
            <Card className="border-l-4 border-l-primary gap-0 py-0">
                <CardContent className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg font-bold text-foreground">{subject.code}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-base text-foreground">{subject.title}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {subject.semester_name} {subject.academic_year}
                                </span>
                                {subject.section && (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {subject.section}
                                    </span>
                                )}
                                {subject.room && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Room {subject.room}
                                    </span>
                                )}
                                {subject.start_time && subject.end_time && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(subject.start_time)} – {formatTime(subject.end_time)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* list header: summary + filter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{sessions.total}</span> sessions total
                    {sessions.from != null && sessions.to != null && (
                        <> · showing <span className="font-medium text-foreground">{sessions.from}–{sessions.to}</span></>
                    )}
                </p>

                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All statuses</SelectItem>
                        {teacherScheduleStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* session list */}
            {sessions.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <div className="rounded-full bg-muted p-3">
                        <Calendar className="h-5 w-5 opacity-50" />
                    </div>
                    <p className="text-sm">No sessions match the current filter.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {grouped.map(({ month, items }) => (
                        <div key={month}>
                            <div className="border-b border-border bg-muted/40 px-4 py-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {month}
                                </span>
                            </div>
                            <div className="divide-y divide-border/60">
                                {items.map((session) => (
                                    <SessionRow key={session.id} session={session} />
                                ))}
                            </div>
                        </div>
                    ))}

                    <TablePagination
                        meta={{
                            total: sessions.total,
                            from: sessions.from,
                            to: sessions.to,
                            current_page: sessions.current_page,
                            last_page: sessions.last_page,
                        }}
                        perPage={perPage}
                        perPageOptions={[10, 15, 25, 50]}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main Page Entry ─────────────────────────────────────────────────────────

export default function Index(props: TeacherSchedulesIndexProps) {
    const { mode } = props;
    const [viewMode, setViewMode] = useState<'calendar' | 'subjects'>('calendar');

    if (mode === 'sessions') {
        return (
            <>
                <Head title="Course Sessions" />
                <SessionsView
                    sessions={props.sessions ?? { data: [], total: 0, current_page: 1, last_page: 1, per_page: 15, from: null, to: null }}
                    subject={props.subject ?? {
                        id: null,
                        code: '',
                        title: '',
                        semester_name: '',
                        academic_year: '',
                        section: null,
                        room: null,
                        start_time: null,
                        end_time: null,
                    }}
                    filters={props.filters}
                />
            </>
        );
    }

    const subjects = props.subjects ?? [];
    const calendarSchedules = props.calendar_schedules ?? [];
    const activeSemester = calendarSchedules[0]?.semester_name;
    const activeAcademicYear = calendarSchedules[0]?.academic_year;

    return (
        <>
            <Head title="My Schedule" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6 w-full">
                {/* Page Header with View Switcher */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                My Schedule
                            </h1>
                            {activeSemester && (
                                <Badge
                                    variant="outline"
                                    className="h-6 gap-1.5 rounded-full border-primary/25 bg-primary/5 px-2.5 text-xs font-semibold text-primary"
                                >
                                    <BookOpen className="size-3" />
                                    <span>{activeSemester}</span>
                                    {activeAcademicYear && (
                                        <span className="font-normal text-muted-foreground">({activeAcademicYear})</span>
                                    )}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} enrolled · {calendarSchedules.length} teaching sessions across the term.
                        </p>
                    </div>

                    {/* View Switcher Pills */}
                    <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                                viewMode === 'calendar'
                                    ? 'bg-background text-foreground shadow-2xs'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <CalendarDays className="size-3.5" />
                            <span>Calendar & Daily Schedule</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('subjects')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                                viewMode === 'subjects'
                                    ? 'bg-background text-foreground shadow-2xs'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <LayoutGrid className="size-3.5" />
                            <span>By Subject ({subjects.length})</span>
                        </button>
                    </div>
                </div>

                {/* View Content */}
                {viewMode === 'calendar' ? (
                    <TeacherCalendarView
                        calendarSchedules={calendarSchedules}
                        subjects={subjects}
                    />
                ) : (
                    <SubjectsView subjects={subjects} />
                )}
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'My Schedule', href: teacherSchedules().url },
        ]}
    >
        {page}
    </AppLayout>
);
