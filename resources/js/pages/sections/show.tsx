import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    GraduationCap,
    MapPin,
    Pencil,
    Shield,
    Sparkles,
    ToggleLeft,
    ToggleRight,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { show as programsShow } from '@/routes/programs';
import { index as schedulesIndex } from '@/routes/schedules';
import {
    destroy as sectionsDestroy,
    edit as sectionsEdit,
    index as sections,
    toggleStatus as sectionsToggleStatus,
} from '@/routes/sections';
import { show as teachersShow } from '@/routes/teachers';
import type { SectionsShowProps } from '@/types';

export default function Show({ section }: SectionsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(sectionsDestroy(section.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleToggleStatus = () => {
        setIsToggling(true);
        router.post(
            sectionsToggleStatus.url(section.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsToggling(false),
            }
        );
    };

    const enrollmentPercentage =
        section.max_students > 0
            ? Math.min(100, Math.round((section.current_students / section.max_students) * 100))
            : 0;

    const isFull = section.current_students >= section.max_students;
    const availableSlots = Math.max(0, section.max_students - section.current_students);

    // Deduplicate teacher schedules by subject and time slot for a clean weekly overview
    const uniqueWeeklyClasses = useMemo(() => {
        const schedules = section.teacher_schedules || [];
        const seen = new Set<string>();
        const unique = [];

        for (const item of schedules) {
            const key = `${item.subject_id}-${item.day_of_week}-${item.start_time}-${item.room}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(item);
            }
        }

        return unique;
    }, [section.teacher_schedules]);

    // Format time (e.g., "08:30:00" -> "8:30 AM")
    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split('T');
        const rawTime = parts.length > 1 ? parts[1].substring(0, 5) : timeStr.substring(0, 5);
        const [hourStr, minStr] = rawTime.split(':');
        const hour = parseInt(hourStr, 10);
        if (isNaN(hour)) return timeStr;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour}:${minStr} ${ampm}`;
    };

    return (
        <>
            <Head title={`Student Section - ${section.section_code}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={sections()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sections
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {section.section_code}
                            </h1>
                            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                                Year {section.year_level}
                            </span>
                            <Badge
                                className={
                                    section.is_active
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }
                            >
                                {section.is_active ? 'Active Section' : 'Inactive'}
                            </Badge>
                            {isFull ? (
                                <Badge variant="destructive" className="text-xs">
                                    Full Capacity ({section.current_students}/{section.max_students})
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                    {availableSlots} slots available
                                </Badge>
                            )}
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{section.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {section.full_identifier ||
                                `${section.section_code} - ${section.program?.name || 'Academic Track'} Year ${section.year_level}`}
                        </p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={section.is_active ? 'outline' : 'default'}
                            size="sm"
                            onClick={handleToggleStatus}
                            disabled={isToggling}
                            className="gap-1.5"
                        >
                            {section.is_active ? (
                                <>
                                    <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Deactivate</span>
                                </>
                            ) : (
                                <>
                                    <ToggleRight className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Activate</span>
                                </>
                            )}
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={sectionsEdit(section.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Section</span>
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Main Content (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Section Overview Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Cohort Specifications
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Academic level, capacity thresholds, and enrolled members
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Year Level
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1.5 font-mono">
                                            Year {section.year_level}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Enrolled Students
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1.5 font-mono">
                                            {section.current_students} <span className="text-xs font-normal text-muted-foreground">/ {section.max_students}</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Available Slots
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1.5 font-mono">
                                            {availableSlots} <span className="text-xs font-normal text-muted-foreground">Seats</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Timetable Load
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1.5 font-mono">
                                            {uniqueWeeklyClasses.length} <span className="text-xs font-normal text-muted-foreground">Classes</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Enrollment Capacity Gauge */}
                                <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-foreground">
                                            Enrollment Capacity Gauge
                                        </span>
                                        <span className="font-mono font-medium text-muted-foreground">
                                            {enrollmentPercentage}% filled
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                isFull
                                                    ? 'bg-destructive'
                                                    : enrollmentPercentage > 85
                                                    ? 'bg-amber-500'
                                                    : 'bg-primary'
                                            }`}
                                            style={{ width: `${enrollmentPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {isFull
                                            ? 'Cohort has reached maximum seating capacity for scheduled lecture rooms.'
                                            : `${availableSlots} more student slots can be allocated to this section.`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timetable Classes & Assigned Courses Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Assigned Timetable Classes ({uniqueWeeklyClasses.length})
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Weekly recurring course schedule sessions assigned to {section.section_code}
                                    </CardDescription>
                                </div>

                                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                    <Link href={schedulesIndex()}>
                                        <span>Timetable</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {uniqueWeeklyClasses.length > 0 ? (
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                    <TableHead className="w-[120px]">Course Code</TableHead>
                                                    <TableHead>Course Title</TableHead>
                                                    <TableHead className="w-[140px]">Day & Time</TableHead>
                                                    <TableHead className="w-[140px]">Classroom</TableHead>
                                                    <TableHead className="w-[130px]">Instructor</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {uniqueWeeklyClasses.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-mono text-xs font-bold text-primary">
                                                            {item.subject?.code || `SUB-${item.subject_id}`}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium text-foreground">
                                                            {item.subject?.name || 'Class Subject'}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            <div className="font-medium text-foreground capitalize">
                                                                {item.day_of_week}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                                {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                {item.room || 'TBA'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium text-foreground">
                                                            {item.teacher ? (
                                                                <Link
                                                                    href={teachersShow(item.teacher.id)}
                                                                    className="hover:underline hover:text-primary transition-colors"
                                                                >
                                                                    {item.teacher.first_name} {item.teacher.last_name}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted-foreground italic">TBA</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                        <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            No timetable classes scheduled
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            This section has not been assigned to any course timetable sessions yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Degree Track Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Academic Program
                                        </CardTitle>
                                    </div>
                                    {section.program_id && (
                                        <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                            <Link href={programsShow(section.program_id)}>
                                                <span>View</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Degree track governing this cohort
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {section.program ? (
                                    <div className="rounded-lg border bg-muted/20 p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            {section.program.code && (
                                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary border border-primary/20">
                                                    {section.program.code}
                                                </span>
                                            )}
                                            <span className="font-semibold text-foreground text-sm">
                                                {section.program.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-muted-foreground">
                                        No academic program linked.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Class Adviser Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Section Adviser
                                        </CardTitle>
                                    </div>
                                    {section.adviser && (
                                        <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                            <Link href={teachersShow(section.adviser.id)}>
                                                <span>Profile</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Faculty member guiding this section
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {section.adviser ? (
                                    <div className="rounded-lg border bg-muted/20 p-3.5 space-y-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {section.adviser.first_name} {section.adviser.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                ID: {section.adviser.employee_id}
                                            </p>
                                        </div>
                                        {section.adviser.department && (
                                            <div className="text-xs text-muted-foreground pt-1 border-t">
                                                <span>Department: </span>
                                                <strong className="text-foreground">{section.adviser.department}</strong>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed bg-muted/10 p-3.5 text-center text-xs text-muted-foreground">
                                        <p>No adviser assigned yet.</p>
                                        <Button asChild variant="link" size="sm" className="text-xs h-auto p-0 mt-1">
                                            <Link href={sectionsEdit(section.id)}>+ Assign Adviser</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Semester & Term Calendar Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Academic Term
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Semester</span>
                                    <span className="font-semibold text-foreground">
                                        {section.semester?.name || 'Not Assigned'}
                                    </span>
                                </div>
                                {section.semester?.academic_year && (
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Academic Year</span>
                                        <span className="font-mono text-foreground">
                                            {section.semester.academic_year}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Cohort ID</span>
                                    <span className="font-mono text-foreground font-semibold">
                                        #{section.id}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lifecycle & Auditing */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Lifecycle & Auditing
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(section.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Modified</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(section.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Student Section"
                itemName={section.section_code}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sections', href: sections() },
            { title: 'View Section', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
