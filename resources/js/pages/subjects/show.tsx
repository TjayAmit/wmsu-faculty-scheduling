import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    BookOpen,
    GraduationCap,
    Layers,
    Calendar,
    Clock,
    Building2,
    User,
    CheckCircle2,
    XCircle,
    Plus,
    ExternalLink,
    FileText,
    Library,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { fmtDate } from '@/lib/utils';
import { index as curriculaIndex } from '@/routes/curricula';
import { index as schedulesIndex, create as schedulesCreate, show as schedulesShow } from '@/routes/schedules';
import { index as subjects, edit as subjectsEdit, destroy as subjectsDestroy } from '@/routes/subjects';
import type { SubjectsShowProps } from '@/types';

export default function Show({ subject }: SubjectsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(subjectsDestroy(subject.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const schedulesList = subject.schedules || [];
    const curriculaList = subject.curricula || [];

    return (
        <>
            <Head title={`Subject - ${subject.code} (${subject.title})`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back to list & Quick metadata */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={subjects()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Subjects
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Subject ID: <strong className="font-semibold text-foreground">#{subject.id}</strong></span>
                        <span>•</span>
                        <span>Updated: {fmtDate(subject.updated_at)}</span>
                    </div>
                </div>

                {/* Hero Header Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
                                    {subject.code}
                                </span>
                                {subject.is_active ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Active Subject
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-border text-muted-foreground px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Inactive
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs font-medium">
                                    {subject.units} Academic Units
                                </Badge>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {subject.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <span>Part of <strong>{curriculaList.length}</strong> academic programs</span>
                                </span>
                                <span className="text-border hidden sm:inline">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>{schedulesList.length}</strong> schedule offerings</span>
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                            <Button asChild variant="outline" size="sm" className="shadow-none">
                                <Link href={subjectsEdit(subject.id)}>
                                    <Pencil className="mr-1.5 h-4 w-4" />
                                    Edit Subject
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border shadow-none"
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Compact Metric Ribbon (4 Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Course Code */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Course Identifier</p>
                            <p className="truncate text-sm font-semibold text-foreground">{subject.code}</p>
                            <p className="truncate text-xs text-muted-foreground">{subject.is_active ? 'Active Academic Course' : 'Inactive Course'}</p>
                        </div>
                    </div>

                    {/* Credit Load */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Credit Units</p>
                            <p className="text-sm font-semibold text-foreground">{subject.units} Academic Units</p>
                            <p className="truncate text-xs text-muted-foreground">Semester credit allocation</p>
                        </div>
                    </div>

                    {/* Curricula */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Curriculum Coverage</p>
                            <p className="truncate text-sm font-semibold text-foreground">
                                {curriculaList.length} Degree Programs
                            </p>
                            <p className="truncate text-xs text-muted-foreground">Required academic tracks</p>
                        </div>
                    </div>

                    {/* Scheduled Sections */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Schedule Sections</p>
                            <p className="truncate text-sm font-semibold text-foreground">
                                {schedulesList.length} Active Classes
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {schedulesList.length > 0 ? 'Offerings running' : 'No sections assigned'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout (2 Cols Main, 1 Col Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Course Details & Curricula & Timetable */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Overview & Syllabus Description */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">Course Description & Overview</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-medium">
                                        {subject.code}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {subject.description ? (
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {subject.description}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-muted-foreground">
                                        No formal syllabus course description provided for this subject.
                                    </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-muted-foreground">Course Title</p>
                                        <p className="font-semibold text-foreground">{subject.title}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-muted-foreground">Subject Code</p>
                                        <p className="font-semibold text-foreground font-mono">{subject.code}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-muted-foreground">Credit Units</p>
                                        <p className="font-semibold text-foreground">{subject.units} Units</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Degree Programs & Curriculum Requirements */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-primary" />
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                Curriculum & Degree Programs ({curriculaList.length})
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Programs that include {subject.code} in their curriculum structure.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-xs text-primary h-7">
                                        <Link href={curriculaIndex()}>
                                            Curricula <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {curriculaList.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                                    <TableHead className="py-2.5 pl-6 pr-4 text-xs font-medium text-muted-foreground">Program</TableHead>
                                                    <TableHead className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Year Level</TableHead>
                                                    <TableHead className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Term</TableHead>
                                                    <TableHead className="py-2.5 pl-4 pr-6 text-right text-xs font-medium text-muted-foreground">Requirement</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {curriculaList.map((curr) => (
                                                    <TableRow key={curr.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                                                        <TableCell className="py-3 pl-6 pr-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground">
                                                                    {curr.program?.code || 'PROGRAM'}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {curr.program?.name || 'Academic Degree Program'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 px-4 text-xs font-medium text-foreground">
                                                            Year {curr.year_level}
                                                        </TableCell>
                                                        <TableCell className="py-3 px-4 text-xs text-muted-foreground capitalize">
                                                            {curr.semester_type ? `${curr.semester_type} semester` : '—'}
                                                        </TableCell>
                                                        <TableCell className="py-3 pl-4 pr-6 text-right">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[11px] font-normal ${
                                                                    curr.is_required
                                                                        ? 'border-emerald-500/30 text-emerald-700 bg-emerald-50/60 dark:text-emerald-400'
                                                                        : 'border-border text-muted-foreground'
                                                                }`}
                                                            >
                                                                {curr.is_required ? 'Required Core' : 'Elective'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        This subject is not currently assigned to any degree program curriculum.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Class Offerings & Schedules */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                Class Timetable & Sections ({schedulesList.length})
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Active class section offerings and assigned instructors.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-xs text-primary h-7">
                                        <Link href={schedulesIndex()}>
                                            All Schedules <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {schedulesList.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                                    <TableHead className="py-2.5 pl-6 pr-4 text-xs font-medium text-muted-foreground">Section</TableHead>
                                                    <TableHead className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Semester</TableHead>
                                                    <TableHead className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Venue</TableHead>
                                                    <TableHead className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Instructor</TableHead>
                                                    <TableHead className="py-2.5 pl-4 pr-6 text-right text-xs font-medium text-muted-foreground">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {schedulesList.map((sched) => (
                                                    <TableRow key={sched.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                                                        <TableCell className="py-3 pl-6 pr-4 font-semibold text-xs text-foreground">
                                                            {sched.section || 'General'}
                                                        </TableCell>
                                                        <TableCell className="py-3 px-4 text-xs text-muted-foreground">
                                                            {sched.semester?.name || '—'}
                                                        </TableCell>
                                                        <TableCell className="py-3 px-4 text-xs text-muted-foreground">
                                                            {sched.classroom
                                                                ? `${sched.classroom.building} - Rm ${sched.classroom.room_number}`
                                                                : (sched.room || 'Room TBA')}
                                                        </TableCell>
                                                        <TableCell className="py-3 px-4 text-xs text-foreground">
                                                            {sched.teacher_assignment?.teacher?.user?.name || (
                                                                <span className="text-muted-foreground italic">Unassigned</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-3 pl-4 pr-6 text-right">
                                                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                                                <Link href={schedulesShow(sched.id)}>
                                                                    View
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                        <p>No class timetable offerings currently scheduled for this subject.</p>
                                        <Button asChild size="sm" variant="outline" className="h-8 text-xs mt-1">
                                            <Link href={schedulesCreate().url}>
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Create Schedule for this Subject
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col): Summary & Metadata & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Subject Specifications Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Library className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Subject Specifications</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3.5 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                    <span className="text-muted-foreground">Status:</span>
                                    {subject.is_active ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[11px]">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Course Code:</span>
                                    <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                        {subject.code}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Credit Units:</span>
                                    <span className="font-semibold text-foreground">
                                        {subject.units} Units
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Active Sections:</span>
                                    <span className="font-semibold text-foreground">
                                        {schedulesList.length} Sections
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Curricula Count:</span>
                                    <span className="font-semibold text-foreground">
                                        {curriculaList.length} Degree Programs
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>Created:</span>
                                        <span>{fmtDate(subject.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Last Modified:</span>
                                        <span>{fmtDate(subject.updated_at)}</span>
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <Button asChild variant="outline" size="sm" className="w-full text-xs shadow-none">
                                        <Link href={subjectsEdit(subject.id)}>
                                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                            Edit Subject Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Shortcuts */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Related Navigation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 p-3 space-y-1 text-xs">
                                <Button variant="ghost" size="sm" asChild className="w-full justify-between h-8 text-xs font-normal">
                                    <Link href={subjects()}>
                                        <span>All Subjects Catalog</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild className="w-full justify-between h-8 text-xs font-normal">
                                    <Link href={schedulesIndex()}>
                                        <span>Course Timetable Schedules</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild className="w-full justify-between h-8 text-xs font-normal">
                                    <Link href={curriculaIndex()}>
                                        <span>Academic Curricula</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Subject Confirmation Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Subject</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-foreground">{subject.code} - {subject.title}</span>?
                                    This action cannot be undone and will affect any linked curriculum items.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Subject'}
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
            { title: 'Subjects', href: subjects() },
            { title: 'View Subject', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
