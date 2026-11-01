import { Head, Link, router } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    DoorOpen,
    Calendar,
    CalendarDays,
    Clock,
    User,
    BookOpen,
    Fingerprint,
    Plus,
    AlertCircle,
    ArrowLeft,
    Search,
    CheckCircle2,
    Building2,
    Users,
    Hourglass,
    Activity,
} from 'lucide-react';
import { useState } from 'react';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { fmtDate, fmtTimeRange } from '@/lib/utils';
import { index as classrooms, edit as classroomsEdit, destroy as classroomsDestroy } from '@/routes/classrooms';
import { destroy as roomSchedulesDestroy } from '@/routes/room-schedules';
import type { Classroom, ClassroomDetailedAvailability } from '@/types/classrooms';

interface ScheduleSession {
    schedule_id: number;
    subject_code?: string;
    subject_title?: string;
    section: string;
    semester?: string;
    academic_year?: string;
    teacher_name: string;
    time_slot_id?: string | number;
    slot_name?: string;
    start_time?: string;
    end_time?: string;
}

interface RoomScheduleItem {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string | null;
    is_active: boolean;
    schedule?: {
        id: number;
        section: string;
        subject?: { code: string; title: string };
        semester?: { name: string };
    } | null;
}

interface ClassroomsShowProps {
    classroom: Classroom & {
        full_identifier?: string;
        room_type_label?: string;
        zkteco_device?: {
            id: number;
            device_name: string;
            ip_address: string;
            port: number;
            status: string;
        } | null;
    };
    weeklySchedule: Record<string, ScheduleSession[]>;
    roomSchedules: {
        data: RoomScheduleItem[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
        from: number;
        to: number;
    };
    availability?: ClassroomDetailedAvailability;
    totalWeeklyClasses: number;
    totalReservations: number;
    filters?: { search?: string };
}

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export default function Show({
    classroom,
    weeklySchedule = {},
    roomSchedules,
    availability,
    totalWeeklyClasses = 0,
    totalReservations = 0,
    filters = {},
}: ClassroomsShowProps) {
    const [activeTab, setActiveTab] = useState<'weekly' | 'reservations'>('weekly');
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [search, setSearch] = useState(filters.search || '');
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/classrooms/${classroom.id}`, { search }, { preserveState: true, preserveScroll: true });
    };

    const handleDeleteClassroom = () => {
        setIsDeleting(true);
        router.delete(classroomsDestroy(classroom.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleDeleteRoomSchedule = (id: number) => {
        if (!confirm('Are you sure you want to cancel this room schedule reservation?')) {
            return;
        }
        router.delete(roomSchedulesDestroy(id), {
            preserveScroll: true,
        });
    };

    // Days that have classes vs empty days
    const activeDays = DAYS_OF_WEEK.filter((d) => (weeklySchedule[d.key]?.length ?? 0) > 0);
    const emptyDays = DAYS_OF_WEEK.filter((d) => (weeklySchedule[d.key]?.length ?? 0) === 0);

    // Filter displayed days according to selection
    const displayedDays = selectedDay === 'all'
        ? (activeDays.length > 0 ? activeDays : DAYS_OF_WEEK)
        : DAYS_OF_WEEK.filter((d) => d.key === selectedDay);

    return (
        <>
            <Head title={`Classroom - ${classroom.full_identifier || classroom.room_number}`} />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6 w-full">
                {/* 1. Header with Metadata Badges and Primary Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                                <Link href={classrooms()}>
                                    <ArrowLeft className="mr-1 size-3.5" /> Back to Classrooms
                                </Link>
                            </Button>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {classroom.full_identifier || `${classroom.building} ${classroom.room_number}`}
                            </h1>
                            <Badge variant={classroom.is_active ? 'default' : 'secondary'} className="text-xs">
                                {classroom.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {classroom.room_name ? `${classroom.room_name} • ` : ''}
                            {classroom.building} • Capacity: {classroom.capacity} seats
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <Badge variant="secondary" className="text-xs">
                                {classroom.room_type_label || classroom.room_type}
                            </Badge>
                            {classroom.zkteco_device ? (
                                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 gap-1 text-xs font-medium">
                                    <Fingerprint className="size-3 text-emerald-600 dark:text-emerald-400" />
                                    Terminal: {classroom.zkteco_device.device_name}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
                                    <AlertCircle className="size-3" /> No Terminal Bound
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button asChild size="sm" className="gap-1.5 font-medium bg-[#800000] hover:bg-[#660000] text-white">
                            <Link href={`/room-schedules/create?classroom_id=${classroom.id}`}>
                                <Plus className="size-4" /> Book Room Schedule
                            </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm">
                            <Link href={classroomsEdit(classroom.id)}>
                                <Pencil className="mr-1.5 size-3.5" /> Edit Room
                            </Link>
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowDelete(true)}>
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                </div>

                {/* 2. Room Operating Availability (7:00 AM – 7:00 PM) Overview */}
                {availability && (
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/60">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Clock className="size-4 text-primary" />
                                    <h3 className="text-sm font-bold text-foreground tracking-tight">
                                        Operating Hours Availability (7:00 AM – 7:00 PM)
                                    </h3>
                                    {availability.is_full ? (
                                        <Badge variant="destructive" className="text-[11px] font-bold px-2 py-0.5">
                                            Full of Schedule
                                        </Badge>
                                    ) : availability.weekly_utilization_rate >= 50 ? (
                                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold px-2 py-0.5">
                                            Busy Schedule
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold px-2 py-0.5">
                                            Available Room
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Daily window: 12.0 hours (7:00 AM – 7:00 PM) • Total weekly capacity: {availability.weekly_capacity_hours} hrs across Mon – Sat.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                <div className="text-left sm:text-right">
                                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">Booked</span>
                                    <p className="text-lg font-bold text-foreground">
                                        {availability.weekly_booked_hours.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">hrs</span>
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-border/60" />
                                <div className="text-left sm:text-right">
                                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">Available</span>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {availability.weekly_available_hours.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">hrs free</span>
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-border/60" />
                                <div className="text-left sm:text-right">
                                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">Weekly Load</span>
                                    <p className="text-lg font-bold text-foreground">
                                        {availability.weekly_utilization_rate}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-primary" />
                                    Weekly 7am-7pm Capacity Usage
                                </span>
                                <span className="font-semibold text-foreground">
                                    {availability.weekly_booked_hours.toFixed(1)} of {availability.weekly_capacity_hours} hrs scheduled ({availability.weekly_available_hours.toFixed(1)} hrs free)
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        availability.is_full
                                            ? 'bg-red-500'
                                            : availability.weekly_utilization_rate >= 50
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, availability.weekly_utilization_rate)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Sub-module Navigation Tabs */}
                <div className="flex border-b border-border/80 gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('weekly')}
                        className={`flex items-center gap-2 pb-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                            activeTab === 'weekly'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CalendarDays className="size-4" />
                        Weekly Timetable & Free Slots
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono">
                            {totalWeeklyClasses}
                        </Badge>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reservations')}
                        className={`flex items-center gap-2 pb-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                            activeTab === 'reservations'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Calendar className="size-4" />
                        Room Schedule Reservations
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono">
                            {totalReservations}
                        </Badge>
                    </button>
                </div>

                {/* 4. TAB 1: Weekly Timetable & Free Slots */}
                {activeTab === 'weekly' && (
                    <div className="space-y-4">
                        {/* Day Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                size="sm"
                                variant={selectedDay === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedDay('all')}
                                className={`h-8 text-xs font-medium ${selectedDay === 'all' ? 'bg-[#800000] text-white hover:bg-[#660000]' : ''}`}
                            >
                                All Active Days ({totalWeeklyClasses})
                            </Button>

                            {DAYS_OF_WEEK.map((d) => {
                                const count = weeklySchedule[d.key]?.length || 0;
                                const isSelected = selectedDay === d.key;
                                const dayAvail = availability?.daily?.[d.key];

                                return (
                                    <Button
                                        key={d.key}
                                        size="sm"
                                        variant={isSelected ? 'default' : 'outline'}
                                        onClick={() => setSelectedDay(d.key)}
                                        className={`h-8 text-xs font-medium gap-1 ${
                                            isSelected
                                                ? 'bg-[#800000] text-white hover:bg-[#660000]'
                                                : count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground opacity-60'
                                        }`}
                                    >
                                        <span>{d.short}</span>
                                        {dayAvail?.is_full ? (
                                            <span className="rounded bg-red-500/20 px-1 py-0.2 text-[9px] font-bold text-red-600 dark:text-red-400">
                                                Full
                                            </span>
                                        ) : dayAvail ? (
                                            <span className="text-[10px] opacity-75">
                                                {dayAvail.available_hours}h free
                                            </span>
                                        ) : null}
                                        {count > 0 && (
                                            <span
                                                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-primary/10 text-primary'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Multi-Column Week Timetable Grid */}
                        {totalWeeklyClasses === 0 ? (
                            <Card className="p-8 text-center border-dashed border-border bg-card">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                                    <CalendarDays className="size-6 text-muted-foreground" />
                                </div>
                                <h4 className="mt-3 text-sm font-semibold text-foreground">No Classes Scheduled</h4>
                                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                                    This classroom currently has no recurring weekly instruction schedules assigned. All 72.0 hours (7:00 AM – 7:00 PM) are available for booking.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                    {displayedDays.map((day) => {
                                        const sessions = weeklySchedule[day.key] || [];
                                        const dayAvail = availability?.daily?.[day.key];

                                        return (
                                            <Card
                                                key={day.key}
                                                className="overflow-hidden border-border bg-card shadow-2xs"
                                            >
                                                {/* Day Header with Availability Stats */}
                                                <div className="border-b border-border bg-muted/40 px-3.5 py-2.5 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarDays className="size-3.5 text-primary" />
                                                            <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                                                                {day.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {dayAvail?.is_full ? (
                                                                <Badge variant="destructive" className="text-[10px] h-4.5 font-bold">
                                                                    Full of Schedule
                                                                </Badge>
                                                            ) : dayAvail ? (
                                                                <Badge variant="outline" className="text-[10px] h-4.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                                                                    {dayAvail.available_hours.toFixed(1)}h free
                                                                </Badge>
                                                            ) : null}
                                                            <Badge variant="outline" className="text-[10px] h-4.5 bg-background font-mono">
                                                                {sessions.length} {sessions.length === 1 ? 'class' : 'classes'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Day Load Indicator */}
                                                    {dayAvail && (
                                                        <div className="space-y-1 pt-0.5">
                                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                                <span>Occupied: <strong className="text-foreground">{dayAvail.booked_hours.toFixed(1)}h</strong> / 12h (7am–7pm)</span>
                                                                <span className="font-bold text-foreground">{dayAvail.utilization_rate}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        dayAvail.is_full
                                                                            ? 'bg-red-500'
                                                                            : dayAvail.utilization_rate >= 50
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-emerald-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(100, dayAvail.utilization_rate)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Free Time Slots (7:00 AM – 7:00 PM) */}
                                                {dayAvail && (
                                                    <div className="px-3.5 py-2.5 border-b border-border/50 bg-emerald-500/5 space-y-1.5">
                                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="size-3" /> Free Time Slots (7am–7pm)
                                                            </span>
                                                            <span className="font-mono">{dayAvail.available_hours.toFixed(1)} hrs free</span>
                                                        </div>
                                                        {dayAvail.free_windows.length === 0 ? (
                                                            <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold py-0.5">
                                                                No free slots remaining — room fully occupied
                                                            </p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                {dayAvail.free_windows.map((win, wIdx) => (
                                                                    <span
                                                                        key={wIdx}
                                                                        className="inline-flex items-center gap-1 rounded bg-white dark:bg-card px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs"
                                                                        title={`${win.formatted} (${win.duration_hours.toFixed(1)} hours free)`}
                                                                    >
                                                                        <span className="size-1 rounded-full bg-emerald-500" />
                                                                        {win.formatted}
                                                                        <span className="text-[9px] text-muted-foreground font-mono">
                                                                            ({win.duration_hours.toFixed(1)}h)
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Class Sessions List */}
                                                <div className="p-3 space-y-2.5">
                                                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                                                        <span>Scheduled Classes</span>
                                                        <span>{sessions.length} sessions</span>
                                                    </div>

                                                    {sessions.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground italic py-3 text-center">
                                                            No classes scheduled on {day.label} (Full 12h available)
                                                        </p>
                                                    ) : (
                                                        sessions.map((session, sIdx) => {
                                                            const formattedTime = fmtTimeRange(session.start_time, session.end_time);

                                                            return (
                                                                <div
                                                                    key={sIdx}
                                                                    className="rounded-lg border border-border/80 bg-muted/15 p-2.5 space-y-1.5 hover:bg-muted/30 transition-colors"
                                                                >
                                                                    {/* Row 1: Time Window + Section Badge */}
                                                                    <div className="flex items-center justify-between gap-1 text-xs">
                                                                        <div className="flex items-center gap-1 font-semibold text-primary">
                                                                            <Clock className="size-3 shrink-0" />
                                                                            <span>{formattedTime}</span>
                                                                        </div>
                                                                        {session.section && (
                                                                            <Badge variant="outline" className="text-[10px] h-4.5 font-mono bg-background">
                                                                                {session.section}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {/* Row 2: Course Subject Code & Title */}
                                                                    <div>
                                                                        <p className="text-xs font-bold text-foreground line-clamp-1">
                                                                            {session.subject_code} — {session.subject_title}
                                                                        </p>
                                                                    </div>

                                                                    {/* Row 3: Instructor Name & Auto-Verification */}
                                                                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                                                                        <div className="flex items-center gap-1 truncate max-w-[170px]">
                                                                            <User className="size-3 text-muted-foreground shrink-0" />
                                                                            <span className="truncate text-foreground font-medium">
                                                                                {session.teacher_name}
                                                                            </span>
                                                                        </div>

                                                                        {classroom.zkteco_device ? (
                                                                            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium text-[10px] shrink-0">
                                                                                <CheckCircle2 className="size-3" /> Auto-Verify
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px]">Manual Track</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Compact summary of free / empty days in All Days view */}
                                {selectedDay === 'all' && emptyDays.length > 0 && (
                                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-emerald-500" />
                                            <span>
                                                <strong>Full Free Days:</strong> No regular classes scheduled on{' '}
                                                {emptyDays.map((d) => d.label).join(', ')}. Entire 12.0 hours (7am – 7pm) open.
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">Available for room reservations</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. TAB 2: Room Schedule Reservations */}
                {activeTab === 'reservations' && (
                    <div className="space-y-4">
                        {/* Search and Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search room bookings…"
                                    className="h-9 pl-8 text-xs"
                                />
                            </form>

                            <Button asChild size="sm" className="gap-1.5 font-medium shrink-0 bg-[#800000] hover:bg-[#660000] text-white">
                                <Link href={`/room-schedules/create?classroom_id=${classroom.id}`}>
                                    <Plus className="size-4" /> Book Room Schedule
                                </Link>
                            </Button>
                        </div>

                        {/* Room Schedules Table with Clean Formatting */}
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border bg-muted/40">
                                        <TableHead className="h-10 text-xs font-semibold pl-6">Reservation Date</TableHead>
                                        <TableHead className="h-10 text-xs font-semibold px-4">Time Window</TableHead>
                                        <TableHead className="h-10 text-xs font-semibold px-4">Course / Section</TableHead>
                                        <TableHead className="h-10 text-xs font-semibold px-4">Notes / Purpose</TableHead>
                                        <TableHead className="h-10 text-xs font-semibold px-4">Status</TableHead>
                                        <TableHead className="h-10 w-12 text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roomSchedules.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                                                No date-specific room reservations found for this classroom.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roomSchedules.data.map((item) => (
                                            <TableRow key={item.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                                                <TableCell className="font-semibold text-xs text-foreground pl-6">
                                                    {fmtDate(item.date)}
                                                </TableCell>
                                                <TableCell className="font-medium text-xs text-primary px-4">
                                                    {fmtTimeRange(item.start_time, item.end_time)}
                                                </TableCell>
                                                <TableCell className="text-xs px-4">
                                                    {item.schedule ? (
                                                        <span className="font-semibold text-foreground">
                                                            {item.schedule.section}
                                                            {item.schedule.subject && ` (${item.schedule.subject.code})`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Independent Booking</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate px-4">
                                                    {item.notes || '—'}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteRoomSchedule(item.id)}
                                                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            <TablePagination
                                meta={roomSchedules}
                                onPageChange={(page) => router.get(`/classrooms/${classroom.id}`, { page, search }, { preserveScroll: true })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Delete Classroom</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{classroom.full_identifier || classroom.room_number}</span>?
                            This will remove the room and unassign any active schedules.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteClassroom} disabled={isDeleting}>
                            {isDeleting ? 'Deleting…' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Classrooms', href: classrooms() },
            { title: 'View Classroom Schedules', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
