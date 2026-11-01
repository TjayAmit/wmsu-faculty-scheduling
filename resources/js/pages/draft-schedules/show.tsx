import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    CheckCircle,
    CheckCircle2,
    XCircle,
    Send,
    User,
    BookOpen,
    Building2,
    Calendar,
    Clock,
    Shield,
    ShieldCheck,
    FileText,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    DoorOpen,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Hash,
    BadgeCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fmtDate, fmtTimeRange } from '@/lib/utils';
import {
    index as draftSchedules,
    edit as draftSchedulesEdit,
    destroy as draftSchedulesDestroy,
    submit as draftSchedulesSubmit,
    approve as draftSchedulesApprove,
    reject as draftSchedulesReject,
} from '@/routes/draft-schedules';
import { show as teachersShow } from '@/routes/teachers';
import type { DraftSchedulesShowProps } from '@/types';
import { getDraftScheduleStatusLabel } from '@/types/draftSchedules';

function fmtDateTime(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function getInitials(name?: string | null): string {
    if (!name) return 'FC';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function Show({
    draftSchedule,
    resolvedTimeSlots = [],
    generatedSessions = [],
}: DraftSchedulesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAllSessions, setShowAllSessions] = useState(false);

    const handleDelete = () => {
        setIsProcessing(true);
        router.delete(draftSchedulesDestroy(draftSchedule.id), {
            onFinish: () => {
                setIsProcessing(false);
                setShowDelete(false);
            },
        });
    };

    const handleSubmit = () => {
        setIsProcessing(true);
        router.post(draftSchedulesSubmit(draftSchedule.id).url, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(draftSchedulesApprove(draftSchedule.id).url, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleReject = () => {
        setIsProcessing(true);
        router.post(
            draftSchedulesReject(draftSchedule.id).url,
            { comments: rejectComments },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setShowReject(false);
                },
            }
        );
    };

    const teacher = draftSchedule.teacher;
    const teacherName =
        teacher?.full_name ||
        `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() ||
        teacher?.user?.name ||
        'Assigned Faculty';

    const schedule = draftSchedule.schedule;
    const subject = schedule?.subject;
    const semester = schedule?.semester;
    const classroom = schedule?.classroom;

    // Status pill helpers
    const getStatusBadge = () => {
        switch (draftSchedule.status) {
            case 'approved':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Approved
                    </Badge>
                );
            case 'pending_review':
                return (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Pending Review
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20 px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        Rejected
                    </Badge>
                );
            case 'draft':
            default:
                return (
                    <Badge variant="outline" className="border-border text-muted-foreground px-2.5 py-0.5 text-xs font-semibold gap-1.5 shadow-none">
                        <FileText className="h-3.5 w-3.5" />
                        Draft
                    </Badge>
                );
        }
    };

    // First resolved slot or default
    const primarySlot = resolvedTimeSlots[0];
    const primaryDay = primarySlot?.day ? primarySlot.day.charAt(0).toUpperCase() + primarySlot.day.slice(1) : null;
    const primaryTimeRange = primarySlot?.start_time ? fmtTimeRange(primarySlot.start_time, primarySlot.end_time) : null;

    // Sessions to display
    const visibleSessions = showAllSessions ? generatedSessions : generatedSessions.slice(0, 6);

    return (
        <>
            <Head title={`Assignment #${draftSchedule.id} - ${subject?.code || 'Schedule'} (${teacherName})`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back to list & Quick navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={draftSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Schedule Assignments
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Assignment ID: <strong className="font-semibold text-foreground">#{draftSchedule.id}</strong></span>
                        <span>•</span>
                        <span>Updated: {fmtDate(draftSchedule.updated_at)}</span>
                    </div>
                </div>

                {/* Hero Header Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
                                    {subject?.code || 'COURSE'}
                                </span>
                                {getStatusBadge()}
                                {draftSchedule.teacher_assignment?.is_active && (
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs gap-1 font-medium">
                                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        Active Assignment
                                    </Badge>
                                )}
                                {schedule?.section && (
                                    <Badge variant="secondary" className="text-xs font-medium">
                                        Section {schedule.section}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {subject?.title || 'Schedule Assignment'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4 text-primary" />
                                    <strong className="text-foreground font-medium">{teacherName}</strong>
                                </span>
                                <span className="text-border hidden sm:inline">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {semester?.name} ({semester?.academic_year})
                                </span>
                                {classroom && (
                                    <>
                                        <span className="text-border hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {classroom.building} - Rm {classroom.room_number}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                            {draftSchedule.status === 'draft' && (
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    <Send className="mr-1.5 h-4 w-4" />
                                    Submit for Review
                                </Button>
                            )}

                            {draftSchedule.status === 'pending_review' && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    >
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowReject(true)}
                                        disabled={isProcessing}
                                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    >
                                        <XCircle className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            <Button asChild variant="outline" size="sm" className="shadow-none">
                                <Link href={draftSchedulesEdit(draftSchedule.id)}>
                                    <Pencil className="mr-1.5 h-4 w-4" />
                                    Edit
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

                {/* Key Metrics / Highlights Strip (Compact & High Impact) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Faculty Card */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Instructor</p>
                            <p className="truncate text-sm font-semibold text-foreground">{teacherName}</p>
                            <p className="truncate text-xs text-muted-foreground">{teacher?.rank || 'Faculty'}</p>
                        </div>
                    </div>

                    {/* Academic Units */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Credit Load</p>
                            <p className="text-sm font-semibold text-foreground">
                                {subject?.units ? `${subject.units} Units` : '3.0 Units'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                Section: {schedule?.section || 'Default'}
                            </p>
                        </div>
                    </div>

                    {/* Schedule Timing */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Class Schedule</p>
                            <p className="truncate text-sm font-semibold text-foreground" title={primaryDay && primaryTimeRange ? `${primaryDay}, ${primaryTimeRange}` : 'Schedule Configured'}>
                                {primaryDay && primaryTimeRange ? `${primaryDay}, ${primaryTimeRange}` : 'Schedule Configured'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground" title={primarySlot?.name || ''}>
                                {primarySlot?.name || (resolvedTimeSlots.length > 0 ? `${resolvedTimeSlots.length} weekly slot(s)` : 'Weekly lecture')}
                            </p>
                        </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Assigned Venue</p>
                            <p className="truncate text-sm font-semibold text-foreground">
                                {classroom ? `Rm ${classroom.room_number}` : (schedule?.room || 'Room TBA')}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {classroom?.building || 'Main Campus'} {classroom?.capacity ? `(${classroom.capacity} seats)` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content: 2-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Unified Class & Venue Specification + Generated Sessions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Unified Class & Venue Specification Card */}
                        <Card className="shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">Class & Venue Specification</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {schedule?.section && (
                                            <Badge variant="outline" className="text-xs font-medium">
                                                Section {schedule.section}
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            {subject?.units ? `${subject.units} Academic Units` : '3.0 Units'}
                                        </Badge>
                                        {semester?.is_current && (
                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-normal">
                                                Active Term
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Course Details & Syllabus description */}
                                <div>
                                    <div className="text-base font-semibold text-foreground">
                                        {subject?.code} - {subject?.title}
                                    </div>
                                    {subject?.description ? (
                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                            {subject.description}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs italic text-muted-foreground">
                                            No course syllabus description provided.
                                        </p>
                                    )}

                                    {/* Compact Term & Timeline Info Strip */}
                                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-muted-foreground">Term:</span>
                                            <span className="font-medium text-foreground">{semester?.name}</span>
                                        </div>
                                        {semester?.start_date && semester?.end_date && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-muted-foreground">Timeline:</span>
                                                <span className="font-medium text-foreground">{fmtDate(semester.start_date)} – {fmtDate(semester.end_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Side-by-Side: Weekly Schedule & Classroom Facility */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    {/* Left: Meeting Schedule */}
                                    <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                                    Weekly Schedule
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-medium">
                                                {resolvedTimeSlots.length} slot(s)
                                            </span>
                                        </div>

                                        {resolvedTimeSlots.length > 0 ? (
                                            <div className="space-y-2">
                                                {resolvedTimeSlots.map((slot, idx) => {
                                                    const dayShort = slot.day ? slot.day.slice(0, 3).toUpperCase() : 'DAY';
                                                    const timeString = fmtTimeRange(slot.start_time, slot.end_time);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between rounded-md border border-border/60 bg-muted/25 px-2.5 py-2 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shrink-0">
                                                                    {dayShort}
                                                                </span>
                                                                <span className="truncate text-foreground font-medium" title={slot.name || ''}>
                                                                    {slot.name || 'Regular Session'}
                                                                </span>
                                                            </div>
                                                            <span className="font-mono text-[11px] font-medium text-foreground shrink-0 ml-2 bg-background px-2 py-0.5 rounded border border-border/70">
                                                                {timeString}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs italic text-muted-foreground py-2">
                                                No weekly time slots configured.
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Venue & Facilities */}
                                    <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <DoorOpen className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                                    Venue & Facilities
                                                </span>
                                            </div>
                                            {classroom && (
                                                <Button variant="ghost" size="sm" asChild className="h-5 px-1.5 text-[11px] text-primary hover:text-primary">
                                                    <Link href={`/classrooms/${classroom.id}`}>
                                                        View <ExternalLink className="ml-1 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        {classroom ? (
                                            <div className="space-y-2.5">
                                                <div>
                                                    <p className="font-semibold text-foreground text-xs leading-snug">
                                                        {classroom.room_name || `${classroom.building} - Rm ${classroom.room_number}`}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {classroom.building} • Rm {classroom.room_number}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                                    <Badge variant="secondary" className="capitalize text-[10px] h-5 px-1.5">
                                                        {classroom.room_type || 'Classroom'}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                        Capacity: {classroom.capacity || '—'} seats
                                                    </Badge>
                                                </div>

                                                {classroom.equipment && Array.isArray(classroom.equipment) && classroom.equipment.length > 0 && (
                                                    <div className="pt-1">
                                                        <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                                                            Equipment & Resources:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {classroom.equipment.map((item, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium capitalize"
                                                                >
                                                                    {item.replace(/_/g, ' ')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-foreground py-2">
                                                {schedule?.room || 'Designated room to be assigned.'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Integrated Proposal Notes & Justification (High impact, minimal height) */}
                                {draftSchedule.notes && (
                                    <div className="rounded-lg border-l-2 border-primary bg-muted/30 px-3.5 py-2.5 text-xs flex items-start gap-2.5 mt-2">
                                        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <span className="font-semibold text-foreground mr-1.5">Proposal Justification:</span>
                                            <span className="text-foreground leading-relaxed">{draftSchedule.notes}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Generated Calendar Sessions (If Approved) */}
                        {generatedSessions.length > 0 && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    Generated Timetable Sessions
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {generatedSessions.length} total scheduled class dates created across {semester?.name || 'this term'}.
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {generatedSessions.length > 6 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowAllSessions(!showAllSessions)}
                                                className="text-xs h-8"
                                            >
                                                {showAllSessions ? (
                                                    <>
                                                        Show Less <ChevronUp className="ml-1 h-3.5 w-3.5" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show All ({generatedSessions.length}) <ChevronDown className="ml-1 h-3.5 w-3.5" />
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12 text-center text-xs">#</TableHead>
                                                    <TableHead className="text-xs">Date</TableHead>
                                                    <TableHead className="text-xs">Day</TableHead>
                                                    <TableHead className="text-xs">Time Window</TableHead>
                                                    <TableHead className="text-xs">Venue</TableHead>
                                                    <TableHead className="text-right text-xs">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {visibleSessions.map((session, idx) => (
                                                    <TableRow key={session.id}>
                                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                            {idx + 1}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium text-foreground">
                                                            {fmtDate(session.scheduled_date)}
                                                        </TableCell>
                                                        <TableCell className="text-xs capitalize text-muted-foreground">
                                                            {session.day_of_week}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono text-foreground">
                                                            {fmtTimeRange(session.start_time, session.end_time)}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {session.room || (classroom ? `Rm ${classroom.room_number}` : '—')}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize text-[11px] font-normal border-emerald-500/30 text-emerald-700 bg-emerald-50/50 dark:text-emerald-400"
                                                            >
                                                                {session.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column (1 Col): Faculty Snapshot, Workflow Audit Trail, Shortcuts */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Instructor Profile Snapshot */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Faculty Instructor</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <div className="flex items-center gap-3.5">
                                    <Avatar className="h-12 w-12 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                                            {getInitials(teacherName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold text-foreground text-sm">
                                            {teacherName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {teacher?.rank || 'Faculty Member'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {teacher?.department || 'Academic Department'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                                    {teacher?.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <a
                                                href={`mailto:${teacher.email}`}
                                                className="truncate hover:text-primary transition-colors"
                                            >
                                                {teacher.email}
                                            </a>
                                        </div>
                                    )}
                                    {teacher?.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <a
                                                href={`tel:${teacher.phone}`}
                                                className="truncate hover:text-primary transition-colors"
                                            >
                                                {teacher.phone}
                                            </a>
                                        </div>
                                    )}
                                    {teacher?.employee_id && (
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-muted-foreground">Employee ID:</span>
                                            <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                                                {teacher.employee_id}
                                            </span>
                                        </div>
                                    )}
                                    {teacher?.biometric_pin && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Biometric PIN:</span>
                                            <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                                                {teacher.biometric_pin}
                                            </span>
                                        </div>
                                    )}
                                    {teacher?.employment_type && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Employment:</span>
                                            <span className="capitalize font-medium text-foreground">
                                                {teacher.employment_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {teacher?.id && (
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="w-full text-xs shadow-none"
                                        >
                                            <Link href={teachersShow(teacher.id)}>
                                                View Faculty Profile
                                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Workflow Audit Trail & Review Information */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Workflow & Audit Trail</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                    {/* Step 1: Created */}
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground" />
                                        <p className="text-xs font-semibold text-foreground">Proposal Created</p>
                                        <p className="text-[11px] text-muted-foreground">{fmtDateTime(draftSchedule.created_at)}</p>
                                    </div>

                                    {/* Step 2: Submitted */}
                                    <div className="relative">
                                        <div
                                            className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background ${
                                                draftSchedule.submitted_at || draftSchedule.status !== 'draft'
                                                    ? 'bg-sky-500'
                                                    : 'bg-muted'
                                            }`}
                                        />
                                        <p className="text-xs font-semibold text-foreground">
                                            {draftSchedule.submitted_at ? 'Submitted for Review' : 'Submission Stage'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {draftSchedule.submitted_at
                                                ? fmtDateTime(draftSchedule.submitted_at)
                                                : (draftSchedule.status === 'draft' ? 'Awaiting submission' : 'Immediate entry')}
                                        </p>
                                    </div>

                                    {/* Step 3: Review Decision */}
                                    <div className="relative">
                                        <div
                                            className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background ${
                                                draftSchedule.status === 'approved'
                                                    ? 'bg-emerald-500'
                                                    : draftSchedule.status === 'rejected'
                                                      ? 'bg-destructive'
                                                      : draftSchedule.status === 'pending_review'
                                                        ? 'bg-amber-500'
                                                        : 'bg-muted'
                                            }`}
                                        />
                                        <p className="text-xs font-semibold text-foreground">
                                            {draftSchedule.status === 'approved'
                                                ? 'Approved & Confirmed'
                                                : draftSchedule.status === 'rejected'
                                                  ? 'Proposal Rejected'
                                                  : draftSchedule.status === 'pending_review'
                                                    ? 'Under Administrative Review'
                                                    : 'Pending Review'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {draftSchedule.reviewed_by ? (
                                                <>
                                                    Reviewed by {draftSchedule.reviewer?.name || 'Administrator'}
                                                    {draftSchedule.reviewed_at && ` on ${fmtDateTime(draftSchedule.reviewed_at)}`}
                                                </>
                                            ) : (
                                                draftSchedule.status === 'pending_review' ? 'Awaiting admin decision' : 'Not yet reviewed'
                                            )}
                                        </p>
                                    </div>

                                    {/* Step 4: Teacher Assignment */}
                                    {draftSchedule.teacher_assignment && (
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
                                            <p className="text-xs font-semibold text-foreground">Teaching Load Assigned</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Assignment Record #{draftSchedule.teacher_assignment.id} • Active
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {draftSchedule.review_comments && (
                                    <div className="pt-3 border-t border-border/60">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Review Comments:</p>
                                        <p className="text-xs bg-muted/50 p-2.5 rounded-md border border-border text-foreground">
                                            {draftSchedule.review_comments}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Assignment Confirmation Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Assignment</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this schedule assignment proposal for{' '}
                                    <strong className="text-foreground">{subject?.code}</strong>? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Deleting…' : 'Delete Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Assignment Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Reject Assignment Proposal</DialogTitle>
                        <DialogDescription>
                            Please provide remarks or feedback explaining why this schedule proposal is being rejected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-3">
                        <Textarea
                            rows={4}
                            placeholder="Enter rejection comments or adjustment requests..."
                            value={rejectComments}
                            onChange={(e) => setRejectComments(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowReject(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={isProcessing}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Proposal
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
            { title: 'Assign Schedule', href: draftSchedules() },
            { title: 'Assignment Details', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
