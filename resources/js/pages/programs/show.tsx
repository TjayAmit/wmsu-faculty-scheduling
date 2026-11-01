import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BookOpen,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    GraduationCap,
    Layers,
    Pencil,
    Plus,
    School,
    Sparkles,
    Trash2,
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
import { index as curriculaIndex } from '@/routes/curricula';
import { show as departmentsShow } from '@/routes/departments';
import { destroy as programsDestroy, edit as programsEdit, index as programs } from '@/routes/programs';
import { index as sectionsIndex } from '@/routes/sections';
import type { ProgramsShowProps } from '@/types';

export default function Show({ program }: ProgramsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(programsDestroy(program.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const sectionsCount = program.sections?.length || 0;
    const curriculumCount = program.curriculum?.length || 0;

    // Group curriculum by year level if present
    const groupedCurriculum = useMemo(() => {
        if (!program.curriculum || program.curriculum.length === 0) return {};
        return program.curriculum.reduce((acc, item) => {
            const yr = `Year ${item.year_level}`;
            if (!acc[yr]) acc[yr] = [];
            acc[yr].push(item);
            return acc;
        }, {} as Record<string, typeof program.curriculum>);
    }, [program.curriculum]);

    return (
        <>
            <Head title={`Degree Program - ${program.code} (${program.name})`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Header & Breadcrumb Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={programs()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Programs
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {program.name}
                            </h1>
                            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                                {program.code}
                            </span>
                            <Badge
                                className={
                                    program.is_active
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }
                            >
                                {program.is_active ? 'Active Program' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                                {program.degree_level_label || program.degree_level}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{program.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Academic degree program curriculum requirements, student cohorts, and collegiate affiliation
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={programsEdit(program.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Program</span>
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
                    {/* Main Specifications & Modules (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Program Overview Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Academic Specifications
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Curricular structure and graduation metrics
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Description Quote */}
                                {program.description && (
                                    <div className="rounded-lg border bg-muted/20 p-4 text-sm text-foreground leading-relaxed">
                                        <p className="italic text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold not-italic">
                                            Program Overview
                                        </p>
                                        {program.description}
                                    </div>
                                )}

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span>Duration</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {program.duration_years} <span className="text-xs font-normal text-muted-foreground">Years</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Award className="h-3.5 w-3.5 text-primary" />
                                            <span>Total Units</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {program.total_units} <span className="text-xs font-normal text-muted-foreground">Units</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Users className="h-3.5 w-3.5 text-primary" />
                                            <span>Sections</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {sectionsCount} <span className="text-xs font-normal text-muted-foreground">Cohorts</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                                            <span>Curriculum</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {curriculumCount} <span className="text-xs font-normal text-muted-foreground">Courses</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Curriculum Overview Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Curriculum Structure ({curriculumCount} Subjects)
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Academic courses and units required for this degree track
                                    </CardDescription>
                                </div>

                                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                    <Link href={curriculaIndex()}>
                                        <span>Manage Curriculum</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {curriculumCount > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(groupedCurriculum).map(([yearLabel, items]) => (
                                            <div key={yearLabel} className="space-y-2">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                                                    {yearLabel} ({items?.length || 0} Courses)
                                                </h4>
                                                <div className="rounded-md border overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/30">
                                                                <TableHead className="w-[120px]">Code</TableHead>
                                                                <TableHead>Course Title</TableHead>
                                                                <TableHead className="w-[140px]">Semester</TableHead>
                                                                <TableHead className="w-[80px] text-right">Units</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {items?.map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell className="font-mono text-xs font-bold text-primary">
                                                                        {item.subject?.code || `SUB-${item.subject_id}`}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs font-medium text-foreground">
                                                                        {item.subject?.name || 'Academic Course'}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-muted-foreground capitalize">
                                                                        {item.semester_type_label || item.semester_type}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs font-mono font-semibold text-right">
                                                                        {item.subject?.units ?? '3.0'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                        <BookOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            No curriculum items registered
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Attach course subjects and credit units using the Curriculum Management module.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Sections Cohort Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Registered Sections ({sectionsCount})
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Active student cohorts currently enrolled in this program
                                    </CardDescription>
                                </div>

                                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                    <Link href={sectionsIndex()}>
                                        <span>Manage Sections</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {sectionsCount > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {program.sections?.map((section) => (
                                            <div
                                                key={section.id}
                                                className="rounded-lg border bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-sm font-bold text-foreground">
                                                        {section.section_code || section.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] font-mono">
                                                        {section.year_level ? `Year ${section.year_level}` : 'Cohort'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                    <span>Enrolled:</span>
                                                    <span className="font-mono font-medium text-foreground">
                                                        {section.current_students ?? 0} / {section.max_students ?? 40}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                        <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            No sections assigned yet
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Create student cohort sections for this program under the Sections module.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Collegiate Affiliation Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <School className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Department Affiliation
                                        </CardTitle>
                                    </div>
                                    {program.department && (
                                        <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                            <Link href={departmentsShow(program.department.id)}>
                                                <span>View</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Parent collegiate academic division
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {program.department ? (
                                    <div className="rounded-lg border bg-muted/20 p-3.5 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary border border-primary/20">
                                                {program.department.code}
                                            </span>
                                            <span className="font-semibold text-foreground text-sm">
                                                {program.department.name}
                                            </span>
                                        </div>
                                        {program.department.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {program.department.description}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-muted-foreground">
                                        No parent department currently assigned.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Scheduling & Conflict Synergy Card */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Scheduling Integration
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    Schedules created for <strong className="text-foreground">{program.code}</strong> cohorts are cross-validated against curriculum credit requirements and room capacity limits.
                                </p>
                                <div className="rounded-lg border bg-background/80 p-3 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-[11px]">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Cohort Conflict Shield</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                        Sections in this program cannot be double-booked in overlapping time slots or venues.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lifecycle & Timestamp Auditing Card */}
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
                                    <span className="text-muted-foreground">Program ID</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        #{program.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(program.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(program.updated_at)}
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
                title="Delete Degree Program"
                itemName={`${program.code} - ${program.name}`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Programs', href: programs() },
            { title: 'View Program', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
