import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    Info,
    Pencil,
    Save,
    Sparkles,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as subjects, show as subjectsShow, update as subjectsUpdate, destroy as subjectsDestroy } from '@/routes/subjects';
import type { SubjectsFormProps } from '@/types';

const QUICK_UNITS = ['1.0', '2.0', '3.0', '4.0', '6.0'];

export default function Edit({ subject }: SubjectsFormProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        code: subject?.code || '',
        title: subject?.title || '',
        units: subject?.units?.toString() || '3.0',
        description: subject?.description || '',
        is_active: subject?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject) {
            put(subjectsUpdate.url(subject.id));
        }
    };

    const handleDelete = () => {
        if (!subject) return;
        setIsDeleting(true);
        router.delete(subjectsDestroy(subject.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Edit Subject - ${subject?.code || 'Course'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back to list & metadata */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={subject ? subjectsShow(subject.id) : subjects()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Subject Details
                        </Link>
                    </Button>
                    {subject && (
                        <div className="text-xs text-muted-foreground">
                            Subject ID: <strong className="font-semibold text-foreground">#{subject.id}</strong>
                        </div>
                    )}
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Subject Specifications
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update catalog code, course title, academic unit weight, and curriculum availability.
                    </p>
                </div>

                {/* Form & Live Preview 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Course Specifications</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Code & Units Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="text-xs font-semibold">
                                                Subject Code <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                placeholder="e.g., EDUC 104"
                                                className="font-mono text-sm uppercase"
                                                required
                                            />
                                            <InputError message={errors.code} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="units" className="text-xs font-semibold">
                                                Academic Units <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="units"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="20"
                                                value={data.units}
                                                onChange={(e) => setData('units', e.target.value)}
                                                placeholder="3.0"
                                                className="text-sm"
                                                required
                                            />
                                            {/* Quick select buttons */}
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                                                {QUICK_UNITS.map((u) => (
                                                    <button
                                                        key={u}
                                                        type="button"
                                                        onClick={() => setData('units', u)}
                                                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                                                            data.units === u
                                                                ? 'bg-primary text-primary-foreground border-primary font-medium'
                                                                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        {u}
                                                    </button>
                                                ))}
                                            </div>
                                            <InputError message={errors.units} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-xs font-semibold">
                                            Course Title <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., Technology for Teaching and Learning 1"
                                            className="text-sm"
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-semibold">
                                            Course Description / Syllabus Overview
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe course objectives, competencies, topics, and learning methodologies..."
                                            rows={4}
                                            className="text-sm resize-y"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Active Checkbox Banner */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                                Active Academic Subject
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                When enabled, this subject is active for curriculum planning, section scheduling, and teaching load assignment.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium"
                                            >
                                                <Save className="mr-1.5 h-4 w-4" />
                                                {processing ? 'Saving Changes…' : 'Save Changes'}
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="text-xs">
                                                <Link href={subject ? subjectsShow(subject.id) : subjects()}>Cancel</Link>
                                            </Button>
                                        </div>

                                        {subject && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowDelete(true)}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border text-xs"
                                            >
                                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                Delete Subject
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Live Preview & Guidelines */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live Catalog Preview */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Catalog Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tracking-wide">
                                            {data.code.trim() || 'SUBJ 101'}
                                        </span>
                                        {data.is_active ? (
                                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5 px-1.5 gap-1 shadow-none">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-sm text-foreground leading-snug">
                                            {data.title.trim() || 'Course Title Preview'}
                                        </h4>
                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                            {data.description.trim() || 'Course syllabus description will display here.'}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            <span>{data.units ? `${data.units} Units` : '3.0 Units'}</span>
                                        </span>
                                        <span className="text-[11px] font-medium text-foreground">
                                            WMSU Catalog
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Real-time preview of how this subject will be displayed in catalogs and timetable views.
                                </p>
                            </CardContent>
                        </Card>

                        {/* WMSU Academic Guidelines */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Academic Conventions
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Course Code:</strong> Standardized discipline prefix + 3 digits (e.g. <code>GEC 101</code>, <code>EDUC 104</code>).
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Credit Allocation:</strong> Standard lecture subjects typically hold 3.0 units; lab subjects are usually 1.0 or 2.0 units.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Subject Dialog */}
            {subject && (
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
            )}
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Subjects', href: subjects() },
            { title: 'Edit Subject', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
