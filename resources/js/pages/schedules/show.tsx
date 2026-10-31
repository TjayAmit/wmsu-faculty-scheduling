import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CalendarDays,
    Clock,
    GraduationCap,
    MapPin,
    Pencil,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { index as assignSchedules } from '@/routes/assign-schedules';
import {
    index as schedules,
    edit as schedulesEdit,
    destroy as schedulesDestroy,
} from '@/routes/schedules';
import type { SchedulesShowProps } from '@/types';

const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

export default function Show({ schedule }: SchedulesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(schedulesDestroy(schedule.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const teacher = schedule.teacher_assignment?.teacher?.user;
    const teacherProfile = schedule.teacher_assignment?.teacher as (typeof schedule.teacher_assignment.teacher & { department?: { name: string } }) | undefined;

    return (
        <>
            <Head title={`Schedule - ${schedule.subject?.code || 'Details'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header & Actions (No back-arrow button) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {schedule.subject?.code}
                            </h1>
                            {schedule.is_active ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-xs">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {schedule.subject?.title} &bull; Section {schedule.section || '—'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={schedulesEdit(schedule.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Schedule
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* 2. Hero Overview Banner */}
                <Card className="border border-border/80 bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                                    <CalendarDays className="h-7 w-7" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-bold text-foreground">
                                            {schedule.subject?.code} - {schedule.subject?.title}
                                        </h2>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="size-3.5" />
                                            <span>Room: <strong className="font-semibold text-foreground">{schedule.room || 'TBA'}</strong></span>
                                        </div>
                                        <span>&bull;</span>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="size-3.5" />
                                            <span>Section: <strong className="font-semibold text-foreground">{schedule.section || '—'}</strong></span>
                                        </div>
                                        <span>&bull;</span>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="size-3.5" />
                                            <span>Term: <strong className="font-semibold text-foreground">{schedule.semester?.name || '—'} ({schedule.semester?.academic_year || ''})</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-start md:self-auto">
                                {schedule.teacher_assignment && teacher ? (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-right">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                            <UserCheck className="size-3.5" />
                                            <span>Teacher Assigned</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {teacher.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-right">
                                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                            Faculty Pending
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            No teacher assigned
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Detailed 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Information) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timetable / Scheduled Days Card */}
                        <Card className="border border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Clock className="size-4 text-muted-foreground" />
                                    Timetable & Weekly Schedule
                                </CardTitle>
                                <CardDescription>
                                    Class meeting days and period intervals for this course.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {schedule.time_slots && schedule.time_slots.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {schedule.time_slots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                        Day {index + 1}
                                                    </span>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {dayLabels[slot.day] || slot.day}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs font-normal bg-background">
                                                    Slot #{slot.time_slot_id}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                                        <Clock className="size-8 opacity-30 mb-2" />
                                        <p className="text-sm font-medium">No time slots configured</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Edit this schedule to attach scheduled periods.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Academic Subject Details Card */}
                        <Card className="border border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <BookOpen className="size-4 text-muted-foreground" />
                                    Course & Term Specifications
                                </CardTitle>
                                <CardDescription>
                                    Course identification, academic calendar, and class assignments.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Course Code</dt>
                                        <dd className="mt-1 font-semibold text-foreground">{schedule.subject?.code}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Course Title</dt>
                                        <dd className="mt-1 font-semibold text-foreground">{schedule.subject?.title}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Academic Term</dt>
                                        <dd className="mt-1 text-foreground">
                                            {schedule.semester?.name || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Academic Year</dt>
                                        <dd className="mt-1 text-foreground">
                                            {schedule.semester?.academic_year || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Classroom</dt>
                                        <dd className="mt-1 text-foreground font-medium">
                                            {schedule.room || 'TBA'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground">Assigned Section</dt>
                                        <dd className="mt-1 text-foreground font-medium">
                                            {schedule.section || '—'}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Faculty Assignment Card */}
                        <Card className="border border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <GraduationCap className="size-4 text-muted-foreground" />
                                    Faculty Instructor Assignment
                                </CardTitle>
                                <CardDescription>
                                    Designated teaching instructor assigned to handle this section.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {schedule.teacher_assignment && teacher ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 p-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                {teacher.name?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-foreground">{teacher.name}</p>
                                                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                                {teacherProfile?.department?.name && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Dept: {teacherProfile.department.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end text-xs text-muted-foreground">
                                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[11px] mb-1">
                                                Confirmed Active
                                            </Badge>
                                            {schedule.teacher_assignment.assigned_at && (
                                                <span>Assigned: {fmtDate(schedule.teacher_assignment.assigned_at)}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                                        <Users className="size-8 opacity-30 mb-2" />
                                        <p className="text-sm font-medium">No faculty assigned to this schedule</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                                            Assign an available teacher via the Assign Schedules module.
                                        </p>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={assignSchedules()}>
                                                Assign Faculty
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Status & Metadata Sidebar) */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className="border border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-muted-foreground" />
                                    Schedule Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Offering Status</span>
                                    {schedule.is_active ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-xs">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Teacher Assigned</span>
                                    {schedule.teacher_assignment ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-xs">
                                            Assigned
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            Unassigned
                                        </Badge>
                                    )}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Scheduled Periods</span>
                                    <span className="font-semibold text-foreground">
                                        {schedule.time_slots?.length || 0} slot(s)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Metadata Card */}
                        <Card className="border border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Record Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>Created At</span>
                                    <span className="font-medium text-foreground">{fmtDate(schedule.created_at)}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span>Last Modified</span>
                                    <span className="font-medium text-foreground">{fmtDate(schedule.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Schedule"
                description={`Are you sure you want to delete the schedule for ${schedule.subject?.code} - Section ${schedule.section || ''}? This action cannot be undone.`}
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Schedules', href: schedules() },
            { title: 'Schedule Details', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
