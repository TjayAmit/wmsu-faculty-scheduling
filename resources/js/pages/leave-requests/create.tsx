import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Baby,
    Building2,
    Calendar,
    CalendarRange,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    GraduationCap,
    HeartPulse,
    Info,
    Loader2,
    Palmtree,
    Sparkles,
    User,
    UserCheck,
} from 'lucide-react';
import React, { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { index as leaveRequests, store as leaveRequestsStore } from '@/routes/leave-requests';
import { create as substituteRequestsCreate } from '@/routes/substitute-requests';
import type { LeaveRequestsFormProps } from '@/types';

type LeaveCategoryKey = 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity' | 'other';

interface LeaveTypeConfig {
    id: LeaveCategoryKey;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
    badgeClass: string;
}

const LEAVE_TYPES: LeaveTypeConfig[] = [
    {
        id: 'sick',
        label: 'Sick Leave',
        description: 'Illness, consultations & health recovery',
        icon: HeartPulse,
        accentClass: 'hover:border-rose-400 dark:hover:border-rose-600',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    },
    {
        id: 'vacation',
        label: 'Vacation Leave',
        description: 'Planned rest, travel & rejuvenation',
        icon: Palmtree,
        accentClass: 'hover:border-emerald-400 dark:hover:border-emerald-600',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    },
    {
        id: 'emergency',
        label: 'Emergency Leave',
        description: 'Sudden domestic emergencies or calamity',
        icon: AlertTriangle,
        accentClass: 'hover:border-amber-400 dark:hover:border-amber-600',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    },
    {
        id: 'personal',
        label: 'Personal Leave',
        description: 'Private appointments & urgent domestic affairs',
        icon: UserCheck,
        accentClass: 'hover:border-sky-400 dark:hover:border-sky-600',
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
    },
    {
        id: 'maternity',
        label: 'Maternity Leave',
        description: 'Pre- & post-natal maternal care & rest',
        icon: Baby,
        accentClass: 'hover:border-pink-400 dark:hover:border-pink-600',
        badgeClass: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900',
    },
    {
        id: 'paternity',
        label: 'Paternity Leave',
        description: 'Paternal caregiving & family assistance',
        icon: Baby,
        accentClass: 'hover:border-indigo-400 dark:hover:border-indigo-600',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
    },
    {
        id: 'other',
        label: 'Study / Other Leave',
        description: 'Conferences, fellowship or sabbatical',
        icon: GraduationCap,
        accentClass: 'hover:border-purple-400 dark:hover:border-purple-600',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
    },
];

const REASON_PRESETS_BY_TYPE: Record<LeaveCategoryKey, string[]> = {
    sick: [
        'Medical consultation & physician-ordered rest',
        'Acute viral illness / flu recovery',
        'Scheduled outpatient clinic procedure',
        'Dental / oral medical procedure',
        'Hospital admission & medical observation',
    ],
    vacation: [
        'Annual faculty rest & personal rejuvenation',
        'Family domestic travel / holiday break',
        'Personal wellness and stress relief period',
    ],
    emergency: [
        'Immediate family medical crisis / hospitalization',
        'Severe typhoon / natural calamity home disruption',
        'Bereavement & compassionate family leave',
        'Sudden domestic property emergency',
    ],
    personal: [
        'Government statutory document & ID processing',
        'Important family milestone celebration',
        'Legal / banking proceeding appearance',
        'Children academic event / school conference',
    ],
    maternity: [
        'Statutory maternity leave for childbirth and recovery',
        'Doctor-mandated pre-natal high risk bed rest',
    ],
    paternity: [
        'Statutory paternity leave for spouse childbirth support',
        'Newborn caregiving and domestic assistance',
    ],
    other: [
        'Doctoral dissertation writing / oral examination',
        'Academic conference presentation & research forum',
        'Faculty professional training / accreditation visit',
    ],
};

function formatDateToIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function calculateCalendarDays(start: string, end: string): number {
    if (!start || !end) return 0;
    try {
        const s = new Date(`${start}T00:00:00`);
        const e = new Date(`${end}T00:00:00`);
        const diffMs = e.getTime() - s.getTime();
        if (diffMs < 0) return 0;
        return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    } catch {
        return 0;
    }
}

export default function Create({
    teachers = [],
    currentTeacherId,
    isTeacherRole = false,
}: LeaveRequestsFormProps) {
    const todayIso = useMemo(() => formatDateToIso(new Date()), []);

    // If teacher role, auto-select current teacher
    const defaultTeacherId = isTeacherRole && currentTeacherId ? currentTeacherId.toString() : '';

    const { data, setData, post, processing, errors } = useForm({
        teacher_id: defaultTeacherId,
        leave_type: 'sick' as LeaveCategoryKey,
        start_date: todayIso,
        end_date: todayIso,
        reason: '',
        notes: '',
    });

    // Resolve current selected teacher object
    const selectedTeacher = useMemo(() => {
        if (!data.teacher_id) return null;
        return teachers.find((t) => t.id.toString() === data.teacher_id.toString()) || null;
    }, [data.teacher_id, teachers]);

    // Active leave configuration
    const activeLeaveConfig = useMemo(() => {
        return LEAVE_TYPES.find((lt) => lt.id === data.leave_type) || LEAVE_TYPES[0];
    }, [data.leave_type]);

    // Calculate days count
    const totalDays = useMemo(() => {
        return calculateCalendarDays(data.start_date, data.end_date);
    }, [data.start_date, data.end_date]);

    // Quick range preset applicator
    const applyDatePreset = (daysOffset: number, lengthInDays: number) => {
        const start = new Date();
        start.setDate(start.getDate() + daysOffset);
        const end = new Date(start);
        end.setDate(end.getDate() + (lengthInDays - 1));

        const startStr = formatDateToIso(start);
        const endStr = formatDateToIso(end);

        setData((prev) => ({
            ...prev,
            start_date: startStr,
            end_date: endStr,
        }));
    };

    const handleStartDateChange = (val: string) => {
        setData((prev) => {
            const next = { ...prev, start_date: val };
            // Auto sync or advance end date if it was earlier than new start
            if (!prev.end_date || prev.end_date < val) {
                next.end_date = val;
            }
            return next;
        });
    };

    const handlePresetReason = (text: string) => {
        setData('reason', text);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(leaveRequestsStore.url());
    };

    const isDateRangeInvalid = Boolean(data.start_date && data.end_date && data.end_date < data.start_date);

    return (
        <>
            <Head title="File Leave Request" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 mb-2 text-muted-foreground hover:text-foreground"
                            asChild
                        >
                            <Link href={leaveRequests()}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Back to Leave Requests
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            File Leave Request
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Submit a formal faculty leave application for departmental endorsement and administrative recording.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                            Pending Review on Submit
                        </Badge>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Left Column: Interactive Form */}
                    <div className="space-y-6 lg:col-span-7 xl:col-span-8">
                        <Card className="border shadow-xs">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="text-base font-semibold">
                                    Leave Application Details
                                </CardTitle>
                                <CardDescription>
                                    Specify your leave category, effective duration, and reason for absence.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* SECTION 1: Applicant Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Applicant / Faculty Member <span className="text-destructive">*</span>
                                        </Label>

                                        {isTeacherRole && selectedTeacher ? (
                                            <div className="rounded-xl border border-[#800000]/25 bg-rose-50/40 p-4 dark:bg-rose-950/15">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#800000] text-sm font-bold text-white shadow-xs">
                                                            {selectedTeacher.first_name?.[0]}
                                                            {selectedTeacher.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-foreground">
                                                                    {selectedTeacher.first_name} {selectedTeacher.last_name}
                                                                </h4>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-[#800000]/30 bg-white text-[11px] text-[#800000] dark:bg-background"
                                                                >
                                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                                    Current Faculty Member
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                {selectedTeacher.academic_rank && (
                                                                    <span>{selectedTeacher.academic_rank}</span>
                                                                )}
                                                                {selectedTeacher.department && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 font-medium text-foreground">
                                                                            <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                            {selectedTeacher.department.name}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="hidden" name="teacher_id" value={data.teacher_id} />
                                            </div>
                                        ) : (
                                            <>
                                                <Select
                                                    value={data.teacher_id}
                                                    onValueChange={(val) => setData('teacher_id', val)}
                                                >
                                                    <SelectTrigger
                                                        id="teacher_id"
                                                        className={cn('h-11', errors.teacher_id && 'border-destructive')}
                                                    >
                                                        <SelectValue placeholder="Choose faculty member..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                                <div className="flex items-center gap-2 py-0.5">
                                                                    <span className="font-medium">
                                                                        {teacher.first_name} {teacher.last_name}
                                                                    </span>
                                                                    {teacher.academic_rank && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            ({teacher.academic_rank})
                                                                        </span>
                                                                    )}
                                                                    {teacher.department && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="ml-auto text-[10px]"
                                                                        >
                                                                            {teacher.department.code || teacher.department.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Select the faculty member filing this leave application.
                                                </p>
                                            </>
                                        )}
                                        <InputError message={errors.teacher_id} />
                                    </div>

                                    {/* SECTION 2: Leave Type Selector (Visual Card Grid) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">
                                                Leave Category <span className="text-destructive">*</span>
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                Choose statutory or institutional category
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            {LEAVE_TYPES.map((lt) => {
                                                const IconComp = lt.icon;
                                                const isSelected = data.leave_type === lt.id;

                                                return (
                                                    <button
                                                        key={lt.id}
                                                        type="button"
                                                        onClick={() => setData('leave_type', lt.id)}
                                                        className={cn(
                                                            'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                                                            lt.accentClass,
                                                            isSelected
                                                                ? 'border-[#800000] bg-rose-50/70 shadow-xs ring-1 ring-[#800000] dark:bg-rose-950/30'
                                                                : 'border-border bg-card hover:bg-muted/30'
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                                                                isSelected
                                                                    ? 'border-[#800000]/30 bg-[#800000] text-white'
                                                                    : 'border-muted bg-muted/40 text-muted-foreground'
                                                            )}
                                                        >
                                                            <IconComp className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span
                                                                    className={cn(
                                                                        'text-xs font-semibold',
                                                                        isSelected
                                                                            ? 'text-[#800000] dark:text-rose-300'
                                                                            : 'text-foreground'
                                                                    )}
                                                                >
                                                                    {lt.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#800000] dark:text-rose-400" />
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                                                {lt.description}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.leave_type} />
                                    </div>

                                    {/* SECTION 3: Inclusive Date Range & Duration */}
                                    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <Label className="flex items-center gap-1.5 text-sm font-semibold">
                                                <CalendarRange className="h-4 w-4 text-[#800000]" />
                                                Leave Schedule & Inclusive Dates <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => applyDatePreset(0, 1)}
                                                >
                                                    Today (1d)
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => applyDatePreset(1, 1)}
                                                >
                                                    Tomorrow (1d)
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => applyDatePreset(0, 3)}
                                                >
                                                    3 Days
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => applyDatePreset(0, 5)}
                                                >
                                                    5 Days
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="start_date" className="text-xs text-muted-foreground">
                                                    Start Date *
                                                </Label>
                                                <Input
                                                    id="start_date"
                                                    type="date"
                                                    min={todayIso}
                                                    value={data.start_date}
                                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                                    className={cn('h-10 bg-background', errors.start_date && 'border-destructive')}
                                                    required
                                                />
                                                <InputError message={errors.start_date} />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="end_date" className="text-xs text-muted-foreground">
                                                    End Date *
                                                </Label>
                                                <Input
                                                    id="end_date"
                                                    type="date"
                                                    min={data.start_date || todayIso}
                                                    value={data.end_date}
                                                    onChange={(e) => setData('end_date', e.target.value)}
                                                    className={cn('h-10 bg-background', errors.end_date && 'border-destructive')}
                                                    required
                                                />
                                                <InputError message={errors.end_date} />
                                            </div>
                                        </div>

                                        {/* Duration calculation banner */}
                                        <div className="mt-2 flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground">
                                                    {totalDays > 0 ? (
                                                        <>
                                                            Duration:{' '}
                                                            <strong className="text-[#800000] dark:text-rose-400">
                                                                {totalDays} {totalDays === 1 ? 'Calendar Day' : 'Calendar Days'}
                                                            </strong>{' '}
                                                            (Inclusive)
                                                        </>
                                                    ) : (
                                                        <span className="text-amber-600">Please provide a valid date range</span>
                                                    )}
                                                </span>
                                            </div>
                                            {data.start_date && data.end_date && totalDays > 0 && (
                                                <span className="hidden text-muted-foreground sm:inline">
                                                    {formatDisplayDate(data.start_date)} → {formatDisplayDate(data.end_date)}
                                                </span>
                                            )}
                                        </div>

                                        {isDateRangeInvalid && (
                                            <p className="text-xs text-destructive">
                                                End date cannot be earlier than start date.
                                            </p>
                                        )}
                                    </div>

                                    {/* SECTION 4: Reason with Contextual Preset Chips */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="reason" className="text-sm font-semibold">
                                                Detailed Reason for Leave <span className="text-destructive">*</span>
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                {data.reason.length} / 1000 characters
                                            </span>
                                        </div>

                                        {/* Dynamic preset chips tailored to selected leave type */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Sparkles className="h-3.5 w-3.5 text-[#800000]" />
                                                <span>Quick Reason Suggestions ({activeLeaveConfig.label}):</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(REASON_PRESETS_BY_TYPE[data.leave_type] || []).map((preset, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handlePresetReason(preset)}
                                                        className={cn(
                                                            'rounded-full border px-2.5 py-1 text-xs transition-colors',
                                                            data.reason === preset
                                                                ? 'border-[#800000] bg-[#800000] text-white'
                                                                : 'border-border bg-muted/40 text-foreground hover:bg-muted hover:text-foreground'
                                                        )}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            placeholder="State specific justifications, circumstances, or medical reasons for your absence..."
                                            rows={3}
                                            maxLength={1000}
                                            required
                                            className={cn('resize-none text-sm', errors.reason && 'border-destructive')}
                                        />
                                        <InputError message={errors.reason} />
                                    </div>

                                    {/* SECTION 5: Additional Notes / Coverage arrangements */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="notes" className="text-sm font-semibold">
                                                Additional Notes & Endorsement Remarks (Optional)
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                {data.notes.length} / 1000 characters
                                            </span>
                                        </div>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Provide emergency contact details while on leave, or notes regarding class coverage / syllabus instructions..."
                                            rows={2}
                                            maxLength={1000}
                                            className="resize-none text-sm"
                                        />
                                        <InputError message={errors.notes} />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing || isDateRangeInvalid}
                                            className="min-w-[150px] bg-[#800000] text-white shadow-xs hover:bg-[#660000]"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Filing Leave...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Submit Leave Request
                                                </>
                                            )}
                                        </Button>

                                        <Button variant="outline" asChild>
                                            <Link href={leaveRequests()}>Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Document Preview & University Guidelines */}
                    <div className="space-y-6 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6">
                        {/* Live Application Card */}
                        <Card className="overflow-hidden border shadow-xs">
                            <div className="h-2 w-full bg-[#800000]" />
                            <CardHeader className="bg-muted/15 pb-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Application Summary
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                    >
                                        Pending Review
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-bold text-foreground">
                                    Faculty Leave Endorsement
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Western Mindanao State University Faculty Affairs
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-4 text-sm">
                                {/* Faculty Member Summary */}
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                        Applicant Faculty
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <User className="h-4 w-4 text-[#800000]" />
                                        <span className="font-semibold text-foreground">
                                            {selectedTeacher
                                                ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`
                                                : 'No teacher selected yet'}
                                        </span>
                                    </div>
                                    {selectedTeacher && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {selectedTeacher.academic_rank || 'Instructor'}{' '}
                                            {selectedTeacher.department && `• ${selectedTeacher.department.name}`}
                                        </div>
                                    )}
                                </div>

                                {/* Leave Category & Duration */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border bg-card p-3">
                                        <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                            Category
                                        </div>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={cn('font-medium', activeLeaveConfig.badgeClass)}>
                                                {activeLeaveConfig.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3">
                                        <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                            Total Duration
                                        </div>
                                        <div className="mt-1 font-semibold text-foreground">
                                            {totalDays > 0 ? (
                                                <span className="text-[#800000] dark:text-rose-400">
                                                    {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Interval */}
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                        Inclusive Dates
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 font-medium text-foreground">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {data.start_date && data.end_date ? (
                                                data.start_date === data.end_date ? (
                                                    formatDisplayDate(data.start_date)
                                                ) : (
                                                    `${formatDisplayDate(data.start_date)} to ${formatDisplayDate(data.end_date)}`
                                                )
                                            ) : (
                                                'Select date range'
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Reason Quote */}
                                <div className="rounded-lg border bg-muted/20 p-3">
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                        Stated Purpose
                                    </div>
                                    <p className="mt-1 text-xs italic text-foreground">
                                        {data.reason ? `"${data.reason}"` : 'No detailed reason entered yet.'}
                                    </p>
                                </div>

                                {/* Routing pipeline */}
                                <div className="border-t pt-3">
                                    <div className="mb-2 text-[11px] font-semibold text-muted-foreground uppercase">
                                        Approval Routing Flow
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#800000] text-[10px] font-bold text-white">
                                            1
                                        </span>
                                        <span className="font-medium text-foreground">Teacher</span>
                                        <span>→</span>
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                            2
                                        </span>
                                        <span>Dept Chair</span>
                                        <span>→</span>
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                            3
                                        </span>
                                        <span>Dean / HR</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Substitute Coverage Callout */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                            <div className="flex items-start gap-3">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="space-y-2 text-xs">
                                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                                        Need to Arrange Class Coverage?
                                    </p>
                                    <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                                        If you have teaching schedules during your requested leave period, file a substitute request so departmental colleagues can be assigned to cover your classes.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 border-amber-300 bg-white text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                        asChild
                                    >
                                        <Link href={substituteRequestsCreate()}>
                                            Create Substitute Request
                                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines & Policies Card */}
                        <Card className="border bg-card shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    University Leave Policy Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#800000]" />
                                    <span>
                                        <strong>Advance Notice:</strong> Vacation and planned leaves must be submitted at least <strong>3 working days</strong> in advance.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#800000]" />
                                    <span>
                                        <strong>Medical Certificate:</strong> Sick leaves exceeding <strong>2 consecutive days</strong> require a valid physician or university clinic certificate upon resumption of duty.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#800000]" />
                                    <span>
                                        <strong>Endorsement:</strong> Approvals are endorsed by the Department Chairperson prior to collegiate dean signature.
                                    </span>
                                </div>
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
            { title: 'Leave Requests', href: leaveRequests() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
