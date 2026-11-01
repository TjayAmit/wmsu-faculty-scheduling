import { Head, Link, router } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    UserPlus,
    UserX,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    Shield,
    CheckCircle2,
    Clock,
    UserCheck,
    CalendarDays,
    BookOpen,
    CalendarPlus,
    FileText,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import CreateUserAccountForm from '@/components/teachers/CreateUserAccountForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { create as assignSchedulesCreate, destroy as assignSchedulesDestroy } from '@/routes/assign-schedules';
import { index as teachers, edit as teachersEdit, destroy as teachersDestroy } from '@/routes/teachers';
import type { TeachersShowProps } from '@/types';

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
    teacher,
    activeAssignments = [],
    weeklySchedule = {},
    workload = { total_courses: 0, total_units: 0, total_weekly_hours: 0 },
    availableRoles,
}: TeachersShowProps) {
    const [activeTab, setActiveTab] = useState<'schedules' | 'profile'>('schedules');
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [unassignDraftId, setUnassignDraftId] = useState<number | null>(null);
    const [isUnassigning, setIsUnassigning] = useState(false);

    const fullName =
        teacher.full_name ||
        `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() ||
        'Teacher';

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(teachersDestroy(teacher.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleUnassignCourse = () => {
        if (!unassignDraftId) return;
        setIsUnassigning(true);
        router.delete(assignSchedulesDestroy(unassignDraftId).url, {
            preserveScroll: true,
            onFinish: () => {
                setIsUnassigning(false);
                setUnassignDraftId(null);
            },
        });
    };

    const createUserAccount = (data: any) => {
        router.post(`/teachers/${teacher.id}/create-user-account`, data, {
            onSuccess: () => setShowCreateUserDialog(false),
        });
    };

    const unlinkUserAccount = () => {
        if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
            router.delete(`/teachers/${teacher.id}/unlink-user-account`);
        }
    };

    const getEmploymentTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            full_time: 'default',
            part_time: 'secondary',
            casual: 'outline',
        };
        const labels: Record<string, string> = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            casual: 'Casual',
        };

        return <Badge variant={variants[type] || 'default'}>{labels[type] || type}</Badge>;
    };

    const initials =
        (teacher.first_name?.[0] || '') + (teacher.last_name?.[0] || '') ||
        fullName.slice(0, 2).toUpperCase() ||
        'T';

    // Filter sessions by selected day
    const filteredDays = selectedDay === 'all'
        ? DAYS_OF_WEEK
        : DAYS_OF_WEEK.filter((d) => d.key === selectedDay);

    const totalSessions = Object.values(weeklySchedule).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <>
            <Head title={`${fullName} - Faculty Schedule Hub`} />

            {/* Container spans full viewport width */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {fullName}
                            </h1>
                            <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    teacher.is_active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }`}
                            >
                                <span
                                    className={`size-1.5 rounded-full ${
                                        teacher.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'
                                    }`}
                                />
                                {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>

                            {workload.total_courses === 0 ? (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium">
                                    🟢 Available for Schedules
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium">
                                    🔵 {workload.total_courses} Course{workload.total_courses > 1 ? 's' : ''} Assigned
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Employee ID: <span className="font-mono font-medium text-foreground">{teacher.employee_id}</span>
                            {teacher.department && ` • ${teacher.department}`}
                            {teacher.rank && ` • ${teacher.rank}`}
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Assignment Action */}
                        <Button asChild size="sm" className="h-9 gap-1.5 bg-[#800000] hover:bg-[#660000] text-white">
                            <Link href={`${assignSchedulesCreate().url}?teacher_id=${teacher.id}`}>
                                <CalendarPlus className="h-4 w-4" />
                                Assign Schedule
                            </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                            <Link href={teachersEdit(teacher.id)}>
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* 2. Hero Profile & Workload Decision Banner */}
                <Card className="overflow-hidden border-border bg-card shadow-xs w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 sm:size-20 border-2 border-border shadow-xs">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl sm:text-2xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    {fullName}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                    <span>{teacher.department || 'Unassigned Department'}</span>
                                    {teacher.rank && (
                                        <>
                                            <span>•</span>
                                            <span className="font-medium text-foreground">{teacher.rank}</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    {getEmploymentTypeBadge(teacher.employment_type)}
                                    {Boolean(teacher.has_user_account || teacher.user_id || teacher.user) ? (
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1 text-xs"
                                        >
                                            <UserCheck className="size-3" />
                                            Portal Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-xs">
                                            No Portal Account
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Workload Decision Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 text-sm">
                            <div className="rounded-lg bg-muted/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Courses</p>
                                <p className="text-xl font-bold text-foreground mt-0.5">{workload.total_courses}</p>
                                <p className="text-[10px] text-muted-foreground">Allocated courses</p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Weekly Hours</p>
                                <p className="text-xl font-bold text-foreground mt-0.5">{workload.total_weekly_hours}h</p>
                                <p className="text-[10px] text-muted-foreground">Teaching contact</p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Academic Units</p>
                                <p className="text-xl font-bold text-foreground mt-0.5">{workload.total_units}</p>
                                <p className="text-[10px] text-muted-foreground">Total credit load</p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Availability</p>
                                <p className="text-sm font-bold mt-1.5">
                                    {workload.total_courses === 0 ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">Available</span>
                                    ) : (
                                        <span className="text-blue-600 dark:text-blue-400">Assigned</span>
                                    )}
                                </p>
                                <p className="text-[10px] text-muted-foreground">Load balance state</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. Sub-Module Navigation Tabs */}
                <div className="flex border-b border-border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('schedules')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'schedules'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CalendarDays className="size-4" />
                        <span>Assigned Schedules & Timetable</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                            {workload.total_courses}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'profile'
                                ? 'border-[#800000] text-[#800000] dark:border-primary dark:text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Briefcase className="size-4" />
                        <span>Profile & Academic Details</span>
                    </button>
                </div>

                {/* 4. TAB 1: Assigned Schedules & Timetable (Sub-module Hub) */}
                {activeTab === 'schedules' && (
                    <div className="space-y-6">
                        {/* Action Header for Schedules Sub-Module */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-foreground">
                                    Weekly Schedule & Course Allocations
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Detailed timetable across days (Monday – Sunday) and assigned class sections.
                                </p>
                            </div>

                            <Button asChild size="sm" className="h-8 gap-1.5 bg-[#800000] hover:bg-[#660000] text-white self-start sm:self-auto">
                                <Link href={`${assignSchedulesCreate().url}?teacher_id=${teacher.id}`}>
                                    <CalendarPlus className="size-3.5" />
                                    Assign Course Schedule
                                </Link>
                            </Button>
                        </div>

                        {activeAssignments.length === 0 ? (
                            <Card className="p-8 text-center border-dashed border-border bg-card">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                                    <CalendarDays className="size-6 text-muted-foreground" />
                                </div>
                                <h4 className="mt-3 text-sm font-semibold text-foreground">No Course Schedules Assigned</h4>
                                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                                    {fullName} currently has no active teaching assignments for this semester and is fully available.
                                </p>
                                <Button asChild size="sm" className="mt-4 gap-1.5 bg-[#800000] hover:bg-[#660000] text-white">
                                    <Link href={`${assignSchedulesCreate().url}?teacher_id=${teacher.id}`}>
                                        <CalendarPlus className="size-4" />
                                        Assign First Schedule
                                    </Link>
                                </Button>
                            </Card>
                        ) : (
                            <>
                                {/* Day Filter Pills */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Button
                                        variant={selectedDay === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedDay('all')}
                                        className={`h-8 text-xs ${selectedDay === 'all' ? 'bg-[#800000] text-white hover:bg-[#660000]' : ''}`}
                                    >
                                        All Days
                                        <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px]">
                                            {totalSessions}
                                        </Badge>
                                    </Button>

                                    {DAYS_OF_WEEK.map((day) => {
                                        const count = weeklySchedule[day.key]?.length ?? 0;
                                        return (
                                            <Button
                                                key={day.key}
                                                variant={selectedDay === day.key ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedDay(day.key)}
                                                className={`h-8 text-xs ${
                                                    selectedDay === day.key
                                                        ? 'bg-[#800000] text-white hover:bg-[#660000]'
                                                        : count > 0 ? 'text-foreground' : 'text-muted-foreground opacity-70'
                                                }`}
                                            >
                                                {day.short}
                                                {count > 0 && (
                                                    <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                                                        selectedDay === day.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {/* Day-by-Day Timetable Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredDays.map((day) => {
                                        const sessions = weeklySchedule[day.key] ?? [];

                                        return (
                                            <Card key={day.key} className="overflow-hidden border-border bg-card shadow-2xs">
                                                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-3.5 text-muted-foreground" />
                                                        <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                                                            {day.label}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-[11px] h-5 bg-background font-mono">
                                                        {sessions.length} {sessions.length === 1 ? 'class' : 'classes'}
                                                    </Badge>
                                                </div>

                                                <div className="p-3 space-y-2.5">
                                                    {sessions.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground italic py-3 text-center">
                                                            No classes scheduled
                                                        </p>
                                                    ) : (
                                                        sessions.map((session, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="rounded-lg border border-border/80 bg-muted/15 p-2.5 space-y-1.5 hover:bg-muted/30 transition-colors"
                                                            >
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <div className="flex items-center gap-1.5 text-primary font-semibold">
                                                                        <Clock className="size-3" />
                                                                        <span>{fmtTimeRange(session.start_time, session.end_time)}</span>
                                                                    </div>
                                                                    {session.section && (
                                                                        <Badge variant="outline" className="text-[10px] h-4 font-mono bg-background">
                                                                            {session.section}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="text-xs">
                                                                    <p className="font-semibold text-foreground line-clamp-1">
                                                                        {session.subject_code} - {session.subject_title}
                                                                    </p>
                                                                    <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                                                                        <MapPin className="size-3 shrink-0" />
                                                                        <span className="truncate">{session.room}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Master Assigned Courses Table */}
                                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="size-4 text-muted-foreground" />
                                            <h4 className="text-sm font-semibold text-foreground">
                                                Assigned Course Offerings ({activeAssignments.length})
                                            </h4>
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground pl-6">Course</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground px-4">Units</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground px-4">Section</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground px-4">Room</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground px-4">Days & Periods</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground px-4">Semester</TableHead>
                                                <TableHead className="h-10 text-xs font-medium text-muted-foreground pr-6 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeAssignments.map((assignment) => (
                                                <TableRow key={assignment.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                                                    <TableCell className="py-3 pl-6 pr-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {assignment.subject_code}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {assignment.subject_title}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-xs font-medium text-foreground">
                                                        {assignment.units} units
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3">
                                                        <Badge variant="outline" className="text-xs font-mono">
                                                            {assignment.section || '—'}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                                                        {assignment.room}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {assignment.time_slots?.map((slot, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-[11px] capitalize font-normal">
                                                                    {slot.day}: {fmtTimeRange(slot.start ?? slot.start_time, slot.end ?? slot.end_time)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                                                        {assignment.semester}
                                                    </TableCell>

                                                    <TableCell className="py-3 pr-6 text-right">
                                                        {assignment.draft_schedule_id && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                                onClick={() => setUnassignDraftId(assignment.draft_schedule_id!)}
                                                            >
                                                                Unassign
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 5. TAB 2: Profile & Academic Details */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* Left Column (2 Cols): Academic & Contact Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Card: Academic & Institutional Details */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Academic & Collegiate Details</CardTitle>
                                    <CardDescription className="text-sm">
                                        Faculty status, collegiate assignments, and academic rank.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="divide-y divide-border pt-0">
                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Building2 className="size-4 text-muted-foreground" />
                                            Department
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {teacher.department || 'Not Assigned'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Briefcase className="size-4 text-muted-foreground" />
                                            Academic Rank
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {teacher.rank || 'Instructor'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="size-4 text-muted-foreground" />
                                            Date Hired
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {fmtDate(teacher.date_hired)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-muted-foreground" />
                                            Faculty Status
                                        </span>
                                        <Badge variant={teacher.is_active ? 'default' : 'secondary'} className="text-xs">
                                            {teacher.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card: Contact Details */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Contact & Personal Details</CardTitle>
                                    <CardDescription className="text-sm">
                                        Institutional and personal communication channels.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="divide-y divide-border pt-0">
                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Mail className="size-4 text-muted-foreground" />
                                            Email Address
                                        </span>
                                        <a
                                            href={`mailto:${teacher.email}`}
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            {teacher.email}
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Phone className="size-4 text-muted-foreground" />
                                            Phone Number
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {teacher.phone || '—'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            Residential Address
                                        </span>
                                        <span className="text-sm font-medium text-foreground max-w-sm text-right">
                                            {teacher.address || '—'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column (1 Col): Portal Access & Audit Metadata */}
                        <div className="space-y-6">
                            {/* Card: System Account Status */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">System Portal Account</CardTitle>
                                    <CardDescription className="text-sm">
                                        Access credentials and roles.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-4">
                                    {Boolean(teacher.has_user_account || teacher.user_id || teacher.user) && teacher.user ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                    <UserCheck className="size-4" />
                                                </div>
                                                <div className="space-y-0.5 text-xs">
                                                    <p className="font-semibold text-foreground text-sm">{teacher.user.name}</p>
                                                    <p className="text-muted-foreground">{teacher.user.email}</p>
                                                </div>
                                            </div>

                                            {teacher.user?.roles && Array.isArray(teacher.user.roles) && teacher.user.roles.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        Assigned Security Roles
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {teacher.user.roles.map((role: any) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs gap-1">
                                                                <Shield className="size-3 text-muted-foreground" />
                                                                {role.display_name || role.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={unlinkUserAccount}
                                                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 mt-2"
                                            >
                                                <UserX className="size-4 mr-2" />
                                                Unlink User Account
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-center py-2">
                                            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                                                <UserX className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">No Account Linked</p>
                                                <p className="text-xs text-muted-foreground">
                                                    This teacher has no active login credentials for the faculty portal.
                                                </p>
                                            </div>
                                            <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="w-full mt-2 gap-1.5">
                                                        <UserPlus className="size-4" />
                                                        Create User Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Create User Account</DialogTitle>
                                                        <DialogDescription>
                                                            Create a login account for {fullName}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <CreateUserAccountForm
                                                        teacherName={fullName}
                                                        teacherEmail={teacher.email}
                                                        onSubmit={createUserAccount}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Card: Audit Trail */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Record Information</CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y divide-border pt-0 text-sm">
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="size-3.5" /> Created At
                                        </span>
                                        <span className="text-xs font-medium text-foreground">{fmtDate(teacher.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="size-3.5" /> Last Modified
                                        </span>
                                        <span className="text-xs font-medium text-foreground">{fmtDate(teacher.updated_at)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Unassign Course Confirmation Modal */}
            <Dialog open={unassignDraftId !== null} onOpenChange={(open) => !open && setUnassignDraftId(null)}>
                <DialogContent className="max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Unassign Course Schedule</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Are you sure you want to remove this course schedule assignment from <span className="font-semibold text-foreground">{fullName}</span>?
                            The schedule will become unassigned and available for reallocation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setUnassignDraftId(null)} disabled={isUnassigning}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleUnassignCourse} disabled={isUnassigning}>
                            {isUnassigning ? 'Removing…' : 'Confirm Unassignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5 space-y-1">
                            <DialogHeader>
                                <DialogTitle className="text-base font-semibold">Delete Teacher Profile</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to permanently delete{' '}
                                    <span className="font-semibold text-foreground">{fullName}</span>?
                                    All associated schedule allocations will need to be reassigned.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Teacher'}
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
            { title: 'Faculty Teachers', href: teachers() },
            { title: 'Teacher Hub', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
