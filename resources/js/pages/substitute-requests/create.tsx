import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    Loader2,
    MapPin,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
} from 'lucide-react';
import React, { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { index as substituteRequests, store as substituteRequestsStore } from '@/routes/substitute-requests';
import type { SubstituteRequestsFormProps } from '@/types';

const REASON_PRESETS = [
    'Medical / Health Leave',
    'Official University Business',
    'Emergency Family Leave',
    'Academic Conference / Seminar',
    'Personal Emergency Matter',
];

export default function Create({
    teachers = [],
    schedules = [],
    currentTeacherId,
    isTeacherRole = false,
}: SubstituteRequestsFormProps) {
    // Default requesting teacher: if teacher role, auto-select current teacher
    const defaultRequestingTeacherId = (isTeacherRole && currentTeacherId)
        ? currentTeacherId.toString()
        : '';

    const { data, setData, post, processing, errors } = useForm({
        requesting_teacher_id: defaultRequestingTeacherId,
        substitute_teacher_id: '',
        schedule_id: '',
        date: '',
        reason: '',
        notes: '',
    });

    const todayDateStr = useMemo(() => {
        const d = new Date();

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    // Active requesting teacher object
    const selectedRequestingTeacher = useMemo(() => {
        return teachers.find((t) => t.id.toString() === data.requesting_teacher_id);
    }, [teachers, data.requesting_teacher_id]);

    // Available substitute teachers (exclude the requesting teacher)
    const availableSubstitutes = useMemo(() => {
        return teachers.filter((t) => t.id.toString() !== data.requesting_teacher_id);
    }, [teachers, data.requesting_teacher_id]);

    // Active substitute teacher object
    const selectedSubstituteTeacher = useMemo(() => {
        return teachers.find((t) => t.id.toString() === data.substitute_teacher_id);
    }, [teachers, data.substitute_teacher_id]);

    // Filter schedules for the requesting teacher (or show all if not specific)
    const availableSchedules = useMemo(() => {
        if (!data.requesting_teacher_id) {
            return schedules;
        }

        const teacherSchedules = schedules.filter(
            (s) => s.teacher_id?.toString() === data.requesting_teacher_id,
        );

        return teacherSchedules.length > 0 ? teacherSchedules : schedules;
    }, [schedules, data.requesting_teacher_id]);

    // Active schedule object
    const selectedSchedule = useMemo(() => {
        return schedules.find((s) => s.id.toString() === data.schedule_id);
    }, [schedules, data.schedule_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(substituteRequestsStore.url());
    };

    const handleApplyPreset = (preset: string) => {
        setData('reason', preset);
    };

    const formattedDisplayDate = useMemo(() => {
        if (!data.date) {
            return null;
        }

        const d = new Date(data.date + 'T00:00:00');

        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, [data.date]);

    return (
        <>
            <Head title="Create Substitute Request" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6 w-full max-w-7xl mx-auto">
                {/* Back button and page title */}
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-xs text-muted-foreground hover:text-foreground">
                        <Link href={substituteRequests().url}>
                            <ArrowLeft className="mr-1.5 size-3.5" /> Back to Substitute Requests
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Create Substitute Request
                        </h1>
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
                            Faculty Coverage
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Submit an official substitution coverage request with designated faculty, class schedule slot, and justification.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                    {/* Left Column: Form Specifications (7 cols) */}
                    <Card className="lg:col-span-7 shadow-xs border-border">
                        <CardHeader className="border-b border-border/70 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UserCheck className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Request Specifications</CardTitle>
                                    <CardDescription className="text-xs">
                                        Fill out the substitution details below. All fields marked with an asterisk (*) are required.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Faculty Assignment Grid */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Requesting Teacher */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="requesting_teacher_id" className="text-xs font-semibold">
                                            Requesting Teacher <span className="text-destructive">*</span>
                                        </Label>

                                        {isTeacherRole && currentTeacherId ? (
                                            <div className="rounded-lg border border-border bg-muted/40 p-2.5 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {selectedRequestingTeacher?.name || 'Current Instructor'}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">
                                                        Your Profile
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {selectedRequestingTeacher?.department || 'College of Education'}
                                                </p>
                                            </div>
                                        ) : (
                                            <Select
                                                value={data.requesting_teacher_id}
                                                onValueChange={(val) => {
                                                    setData('requesting_teacher_id', val);
                                                    if (data.substitute_teacher_id === val) {
                                                        setData('substitute_teacher_id', '');
                                                    }
                                                }}
                                            >
                                                <SelectTrigger id="requesting_teacher_id" className="text-xs h-9">
                                                    <SelectValue placeholder="Select faculty instructor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                            {teacher.name || `${teacher.first_name} ${teacher.last_name}`}
                                                            {teacher.department ? ` (${teacher.department})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <InputError message={errors.requesting_teacher_id} />
                                    </div>

                                    {/* Substitute Teacher */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="substitute_teacher_id" className="text-xs font-semibold">
                                                Substitute Teacher
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">Optional</span>
                                        </div>

                                        <Select
                                            value={data.substitute_teacher_id}
                                            onValueChange={(val) => setData('substitute_teacher_id', val === '_none' ? '' : val)}
                                        >
                                            <SelectTrigger id="substitute_teacher_id" className="text-xs h-9">
                                                <SelectValue placeholder="Select substitute (or open for admin)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">
                                                    <span className="italic text-muted-foreground">
                                                        Open / Unassigned (To be assigned by Admin)
                                                    </span>
                                                </SelectItem>
                                                {availableSubstitutes.map((teacher) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.name || `${teacher.first_name} ${teacher.last_name}`}
                                                        {teacher.department ? ` (${teacher.department})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.substitute_teacher_id} />
                                    </div>
                                </div>

                                {/* Date & Schedule Slot */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Date */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="date" className="text-xs font-semibold">
                                            Substitution Date <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="date"
                                                type="date"
                                                min={todayDateStr}
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                className="text-xs h-9"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.date} />
                                        <p className="text-[11px] text-muted-foreground">
                                            The calendar date when substitute coverage is needed.
                                        </p>
                                    </div>

                                    {/* Schedule Dropdown (Previously a confusing numeric ID) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="schedule_id" className="text-xs font-semibold">
                                                Course Schedule to Cover
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">Optional</span>
                                        </div>

                                        <Select
                                            value={data.schedule_id}
                                            onValueChange={(val) => setData('schedule_id', val === '_none' ? '' : val)}
                                        >
                                            <SelectTrigger id="schedule_id" className="text-xs h-9">
                                                <SelectValue placeholder="Select class schedule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">
                                                    <span className="italic text-muted-foreground">
                                                        General coverage (No specific course schedule)
                                                    </span>
                                                </SelectItem>
                                                {availableSchedules.map((schedule) => (
                                                    <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                        {schedule.display_label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.schedule_id} />
                                        <p className="text-[11px] text-muted-foreground">
                                            Link to a specific subject class or leave open for the entire day.
                                        </p>
                                    </div>
                                </div>

                                {/* Reason & Quick Presets */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                        <Label htmlFor="reason" className="text-xs font-semibold">
                                            Reason / Justification <span className="text-destructive">*</span>
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Sparkles className="size-3 text-amber-500" />
                                            Quick Presets:
                                        </span>
                                    </div>

                                    {/* Preset Chips */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {REASON_PRESETS.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handleApplyPreset(preset)}
                                                className={cn(
                                                    'rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors',
                                                    data.reason === preset
                                                        ? 'bg-[#800000] text-white border-[#800000]'
                                                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>

                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Explain the specific reason requiring substitution coverage..."
                                        rows={3}
                                        className="text-xs sm:text-sm"
                                        required
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                {/* Additional Notes */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notes" className="text-xs font-semibold">
                                            Instructional Notes & Handover Details
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground">Optional</span>
                                    </div>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Lesson topics to cover, classroom activities, exam monitoring notes, or student instructions..."
                                        rows={2}
                                        className="text-xs sm:text-sm"
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                {/* Form Submission Buttons */}
                                <div className="flex items-center justify-between pt-3 border-t border-border/70">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="text-xs"
                                    >
                                        <Link href={substituteRequests().url}>
                                            Cancel
                                        </Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#800000] hover:bg-[#660000] text-white font-medium text-xs px-5 h-9 gap-1.5"
                                    >
                                        {processing && <Loader2 className="size-3.5 animate-spin" />}
                                        Submit Substitute Request
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right Column: Live Request Summary & Workflow Guide (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Live Summary Preview Card */}
                        <Card className="shadow-xs border-border bg-card overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/70 pb-3">
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    <span>Coverage Request Preview</span>
                                    <Badge variant="secondary" className="text-[10px] font-mono">
                                        Live Draft
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {/* Faculty Transfer Flow */}
                                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3">
                                    {/* Requesting Teacher */}
                                    <div className="flex items-start gap-2.5">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                                            <GraduationCap className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Requesting Instructor
                                            </span>
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {selectedRequestingTeacher?.name || 'Please select teacher'}
                                            </p>
                                            {selectedRequestingTeacher?.department && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {selectedRequestingTeacher.department}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider arrow */}
                                    <div className="flex items-center gap-2 px-1 text-muted-foreground">
                                        <div className="h-px flex-1 bg-border/80" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider px-1">
                                            To Substitute
                                        </span>
                                        <div className="h-px flex-1 bg-border/80" />
                                    </div>

                                    {/* Substitute Teacher */}
                                    <div className="flex items-start gap-2.5">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            <UserCheck className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Designated Substitute
                                            </span>
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {selectedSubstituteTeacher?.name || (
                                                    <span className="italic text-muted-foreground font-normal">
                                                        Open / Unassigned (Admin to allocate)
                                                    </span>
                                                )}
                                            </p>
                                            {selectedSubstituteTeacher?.department && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {selectedSubstituteTeacher.department}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Key Coverage Specs */}
                                <div className="divide-y divide-border/60 text-xs">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-primary" /> Coverage Date:
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {formattedDisplayDate || 'Not selected yet'}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between py-2 gap-2">
                                        <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                                            <BookOpen className="size-3.5 text-primary" /> Target Course:
                                        </span>
                                        <span className="font-semibold text-foreground text-right truncate">
                                            {selectedSchedule ? (
                                                <>
                                                    {selectedSchedule.subject_code}
                                                    {selectedSchedule.section ? ` • ${selectedSchedule.section}` : ''}
                                                </>
                                            ) : (
                                                'General (Whole Day Coverage)'
                                            )}
                                        </span>
                                    </div>

                                    {selectedSchedule?.room && (
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <MapPin className="size-3.5 text-primary" /> Room:
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {selectedSchedule.room}
                                            </span>
                                        </div>
                                    )}

                                    <div className="py-2 space-y-1">
                                        <span className="text-muted-foreground">Reason for Filing:</span>
                                        <p className="text-xs italic text-foreground bg-muted/30 rounded p-2 border border-border/50">
                                            {data.reason ? `"${data.reason}"` : 'No justification entered yet.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Administrative Policy & Workflow Notice */}
                        <Card className="shadow-xs border-border bg-card">
                            <CardContent className="p-4 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                        Approval & Attendance Guidelines
                                    </h4>
                                </div>
                                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                                    <li>Requests are routed to Department Heads and Academic Dean for review.</li>
                                    <li>Designated substitute instructors receive automated notification upon endorsement.</li>
                                    <li>Once approved, classroom biometric scanners will automatically verify the substitute instructor for the class period.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Substitute Requests', href: substituteRequests().url },
            { title: 'Create Request', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
