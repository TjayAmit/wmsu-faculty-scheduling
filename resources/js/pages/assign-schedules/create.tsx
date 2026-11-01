import { Head, Link, useForm } from '@inertiajs/react';
import {
    Save,
    UserCheck,
    Clock,
    CheckCircle2,
    CalendarCheck,
    GraduationCap,
    BookOpen,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { store as assignSchedulesStore } from '@/routes/assign-schedules';
import { index as teachersRoute, show as teachersShow } from '@/routes/teachers';
import type { AssignSchedulesCreateProps } from '@/types';

export default function Create({
    teachers,
    schedules,
    selectedTeacherId,
    selectedScheduleId,
}: AssignSchedulesCreateProps) {
    const initialTeacherId = selectedTeacherId ? selectedTeacherId.toString() : '';
    const initialScheduleId = selectedScheduleId ? selectedScheduleId.toString() : '';

    const { data, setData, post, processing, errors } = useForm({
        teacher_id: initialTeacherId,
        schedule_id: initialScheduleId,
        notes: '',
    });

    const selectedTeacher = teachers.find((t) => t.id.toString() === data.teacher_id);
    const selectedSchedule = schedules.find((s) => s.id.toString() === data.schedule_id);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(assignSchedulesStore.url());
    };

    const backUrl = selectedTeacherId
        ? teachersShow(Number(selectedTeacherId)).url
        : teachersRoute().url;

    return (
        <>
            <Head title="Assign Course Schedule to Faculty" />

            {/* Container fits within viewport without artificial scrollbars */}
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full">
                {/* 1. Header with Back context */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-muted-foreground hover:text-foreground">
                                <Link href={backUrl}>
                                    <ArrowLeft className="size-3.5 mr-1" />
                                    {selectedTeacherId ? 'Back to Teacher Hub' : 'Back to Faculty'}
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Assign Course Schedule
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Allocate course timetables to faculty members based on current teaching workload.
                        </p>
                    </div>

                    {selectedTeacher && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-2xs">
                            <GraduationCap className="size-4 text-primary" />
                            <div className="text-xs">
                                <span className="text-muted-foreground">Assigning to: </span>
                                <span className="font-semibold text-foreground">{selectedTeacher.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Compact Form Layout: Full-width utilization with zero vertical overflow */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
                        {/* Main Allocation Card (8 cols) */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Faculty Allocation Details</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Select the instructor and course offering. Instructors are listed with their current workload to assist decision making.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {/* Teacher Selector with Workload Indicator */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="teacher" className="text-xs font-medium">
                                                    Faculty Teacher <span className="text-destructive">*</span>
                                                </Label>
                                                {selectedTeacher && (
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {(selectedTeacher.active_assignments_count ?? 0) === 0 ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Available (0 schedules)
                                                            </span>
                                                        ) : (
                                                            <span className="text-foreground font-medium">
                                                                {selectedTeacher.active_assignments_count} assigned
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <Select
                                                value={data.teacher_id}
                                                onValueChange={(value) => setData('teacher_id', value)}
                                            >
                                                <SelectTrigger id="teacher" className="h-9 text-xs" aria-invalid={!!errors.teacher_id}>
                                                    <SelectValue placeholder="Select faculty teacher..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-64">
                                                    {teachers.map((teacher) => {
                                                        const isFree = (teacher.active_assignments_count ?? 0) === 0;
                                                        return (
                                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                                <span className="font-medium">{teacher.name}</span>
                                                                <span className="text-muted-foreground ml-1.5 text-[11px]">
                                                                    ({isFree ? '0 schedules • Available' : `${teacher.active_assignments_count} schedule(s)`})
                                                                </span>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.teacher_id} />
                                        </div>

                                        {/* Course Schedule Selector */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="schedule" className="text-xs font-medium">
                                                Course Schedule <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.schedule_id}
                                                onValueChange={(value) => setData('schedule_id', value)}
                                            >
                                                <SelectTrigger id="schedule" className="h-9 text-xs" aria-invalid={!!errors.schedule_id}>
                                                    <SelectValue placeholder="Select course schedule..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-64">
                                                    {schedules.map((schedule) => (
                                                        <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                            <span className="font-medium">{schedule.name}</span>
                                                            <span className="text-muted-foreground ml-1.5 text-[11px]">
                                                                ({schedule.section ? `Sec: ${schedule.section}` : schedule.room || 'TBA'})
                                                                {schedule.is_assigned ? ` • Assigned to ${schedule.assigned_teacher}` : ' • Free'}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.schedule_id} />
                                        </div>
                                    </div>

                                    {/* Detailed Preview of Target Schedule */}
                                    {selectedSchedule && (
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                    <BookOpen className="size-3.5 text-primary" />
                                                    <span>{selectedSchedule.name}</span>
                                                    {selectedSchedule.units && (
                                                        <span className="text-muted-foreground">({selectedSchedule.units} units)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {selectedSchedule.section && (
                                                        <Badge variant="outline" className="text-[11px] h-5 bg-background font-mono">
                                                            {selectedSchedule.section}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="border-primary/30 text-primary bg-background text-[11px] h-5">
                                                        {selectedSchedule.semester}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {selectedSchedule.timeSlots && selectedSchedule.timeSlots.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {selectedSchedule.timeSlots.map((slot, index) => {
                                                        const start = slot.start ?? slot.start_time ?? '';
                                                        const end = slot.end ?? slot.end_time ?? '';
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs shadow-2xs"
                                                            >
                                                                <Clock className="size-3 text-muted-foreground" />
                                                                <span className="font-semibold capitalize text-foreground">{slot.day}:</span>
                                                                <span className="font-mono text-muted-foreground">{start}–{end}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {selectedSchedule.room && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs shadow-2xs text-muted-foreground">
                                                            <span>Room:</span>
                                                            <span className="font-medium text-foreground">{selectedSchedule.room}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">
                                                    No specific weekly period slots configured.
                                                </p>
                                            )}

                                            {selectedSchedule.is_assigned && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                                    <AlertCircle className="size-3.5 shrink-0" />
                                                    <span>Currently assigned to {selectedSchedule.assigned_teacher}. Reassigning will transfer this course.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remarks field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-xs font-medium">Notes / Special Instructions (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Add faculty workload balance remarks, team-teaching directives, or special room notes..."
                                            rows={2}
                                            className="text-xs resize-none"
                                            aria-invalid={!!errors.notes}
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary & Save Action Card (4 cols) */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarCheck className="size-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Decision Summary</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[10px] uppercase font-semibold">
                                            Auto-Approved
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3.5 space-y-3.5">
                                    {/* Live overview */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-1.5">
                                            <span className="text-muted-foreground font-medium shrink-0">Selected Teacher:</span>
                                            <span className="font-semibold text-foreground text-right truncate">
                                                {selectedTeacher?.name || <span className="text-muted-foreground font-normal italic">Not selected</span>}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-1.5">
                                            <span className="text-muted-foreground font-medium shrink-0">Current Workload:</span>
                                            <span className="font-medium text-foreground text-right">
                                                {selectedTeacher ? (
                                                    (selectedTeacher.active_assignments_count ?? 0) === 0 ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0 courses (Available)</span>
                                                    ) : (
                                                        <span className="font-semibold">{selectedTeacher.active_assignments_count} course schedule(s)</span>
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground font-normal italic">—</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-1.5">
                                            <span className="text-muted-foreground font-medium shrink-0">Target Course:</span>
                                            <span className="font-semibold text-foreground text-right truncate">
                                                {selectedSchedule?.name || <span className="text-muted-foreground font-normal italic">Not selected</span>}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-muted-foreground font-medium shrink-0">Term / Periods:</span>
                                            <span className="font-medium text-foreground text-right">
                                                {selectedSchedule
                                                    ? `${selectedSchedule.semester} • ${selectedSchedule.timeSlots?.length ?? 0} slots`
                                                    : <span className="text-muted-foreground font-normal italic">—</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Immediate activation notice */}
                                    <div className="flex items-start gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                        <p className="text-[11px] leading-relaxed">
                                            This assignment immediately activates the teaching schedule and connects the faculty member to attendance verification.
                                        </p>
                                    </div>

                                    {/* Save and Cancel buttons right here without scrolling */}
                                    <div className="space-y-2 pt-1">
                                        <Button
                                            type="submit"
                                            disabled={!data.teacher_id || !data.schedule_id || processing}
                                            className="w-full h-10 gap-1.5 font-medium bg-[#800000] hover:bg-[#660000] text-white"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="size-4 mr-2" />
                                                    Assigning Schedule...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="size-4" />
                                                    Confirm & Assign Schedule
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            type="button"
                                            asChild
                                            className="w-full h-9"
                                        >
                                            <Link href={backUrl}>Cancel</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Faculty Teachers', href: teachersRoute() },
            { title: 'Assign Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
