import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    GraduationCap,
    Layers,
    Pencil,
    Shield,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import {
    destroy as curriculaDestroy,
    edit as curriculaEdit,
    index as curricula,
} from '@/routes/curricula';
import { show as programsShow } from '@/routes/programs';
import { show as subjectsShow } from '@/routes/subjects';
import type { CurriculaShowProps } from '@/types';

export default function Show({ curriculum }: CurriculaShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(curriculaDestroy(curriculum.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const effectiveUnits =
        curriculum.effective_units ??
        curriculum.units_override ??
        curriculum.subject?.units ??
        '3.0';

    const getYearLevelLabel = (yearLevel: number): string => {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = yearLevel <= 3 ? suffixes[yearLevel] : suffixes[0];
        return `${yearLevel}${suffix} Year`;
    };

    const semesterLabel =
        curriculum.semester_type_label ||
        (curriculum.semester_type === 'first'
            ? 'First Semester'
            : curriculum.semester_type === 'second'
            ? 'Second Semester'
            : curriculum.semester_type === 'summer'
            ? 'Summer / Midyear'
            : curriculum.semester_type);

    return (
        <>
            <Head title={`Curriculum Course - ${curriculum.subject?.code || ''} (${curriculum.subject?.title || 'Details'})`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={curricula()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Curriculum Directory
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {curriculum.subject?.title || 'Curriculum Course Item'}
                            </h1>
                            {curriculum.subject?.code && (
                                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                                    {curriculum.subject.code}
                                </span>
                            )}
                            <Badge
                                className={
                                    curriculum.is_required
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }
                            >
                                {curriculum.is_required ? 'Required Course' : 'Elective'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {getYearLevelLabel(curriculum.year_level)}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{curriculum.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Curricular course specification assigned to {curriculum.program?.name || 'degree program'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={curriculaEdit(curriculum.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Item</span>
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
                        {/* Course Overview Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Curricular Placement
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Term sequencing, unit weight, and requirement type
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Course Description Quote */}
                                {curriculum.subject?.description && (
                                    <div className="rounded-lg border bg-muted/20 p-4 text-sm text-foreground leading-relaxed">
                                        <p className="italic text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold not-italic">
                                            Course Description & Scope
                                        </p>
                                        {curriculum.subject.description}
                                    </div>
                                )}

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            <span>Year Level</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            Year {curriculum.year_level}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span>Semester</span>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground mt-2 capitalize">
                                            {semesterLabel}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Award className="h-3.5 w-3.5 text-primary" />
                                            <span>Credit Units</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {effectiveUnits} <span className="text-xs font-normal text-muted-foreground">Units</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Shield className="h-3.5 w-3.5 text-primary" />
                                            <span>Classification</span>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground mt-2">
                                            {curriculum.is_required ? 'Mandatory Core' : 'Elective Course'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subject Master Details Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Master Course Information
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Subject catalog definition from academic repository
                                    </CardDescription>
                                </div>

                                {curriculum.subject_id && (
                                    <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                        <Link href={subjectsShow(curriculum.subject_id)}>
                                            <span>Subject Details</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                            Course Code
                                        </span>
                                        <p className="font-mono text-sm font-bold text-foreground mt-1">
                                            {curriculum.subject?.code || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                            Standard Units
                                        </span>
                                        <p className="font-mono text-sm font-bold text-foreground mt-1">
                                            {curriculum.subject?.units ?? '3.0'} Units
                                        </p>
                                    </div>
                                </div>

                                {/* Prerequisites */}
                                <div className="rounded-lg border bg-card p-3.5 space-y-2">
                                    <span className="font-semibold text-foreground text-xs">
                                        Course Prerequisites
                                    </span>
                                    {curriculum.prerequisite_subjects && curriculum.prerequisite_subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {curriculum.prerequisite_subjects.map((prereqId, idx) => (
                                                <Badge key={idx} variant="outline" className="font-mono text-xs">
                                                    Prerequisite ID: {prereqId}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            No prerequisite courses required. Students eligible upon reaching {getYearLevelLabel(curriculum.year_level)} standing.
                                        </p>
                                    )}
                                </div>
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
                                            Degree Program
                                        </CardTitle>
                                    </div>
                                    {curriculum.program_id && (
                                        <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                            <Link href={programsShow(curriculum.program_id)}>
                                                <span>Program</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Academic syllabus parent program
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {curriculum.program ? (
                                    <div className="rounded-lg border bg-muted/20 p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            {curriculum.program.code && (
                                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary border border-primary/20">
                                                    {curriculum.program.code}
                                                </span>
                                            )}
                                            <span className="font-semibold text-foreground text-sm">
                                                {curriculum.program.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-muted-foreground">
                                        No program attached.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timetable Synergy Card */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Timetable Integration
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    Automated timetable scheduling creates teaching load slots based on this curriculum requirement for all enrolled cohorts.
                                </p>
                                <div className="rounded-lg border bg-background/80 p-3 space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-[11px]">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Curriculum Compliance</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                        Validated during academic advising and enrollment registration.
                                    </p>
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
                                    <span className="text-muted-foreground">Curriculum ID</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        #{curriculum.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Registered</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(curriculum.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(curriculum.updated_at)}
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
                title="Delete Curriculum Item"
                itemName={curriculum.subject?.title || `Item #${curriculum.id}`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Curriculum', href: curricula() },
            { title: 'View Item', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
