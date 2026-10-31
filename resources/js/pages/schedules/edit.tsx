import { Head, Link, useForm } from '@inertiajs/react';
import {
    Clock,
    Plus,
    Trash2,
    BookOpen,
    DoorOpen,
    Fingerprint,
    CheckCircle2,
    Circle,
    CalendarDays,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import {
    index as schedules,
    show as schedulesShow,
    update as schedulesUpdate,
} from '@/routes/schedules';
import type { SchedulesFormProps } from '@/types';

interface TimeSlotItem {
    day: string;
    time_slot_id: string;
}

interface ClassroomOption {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    zkteco_device?: {
        id: number;
        device_name: string;
        status: string;
    } | null;
}

export default function Edit({
    schedule,
    subjects,
    semesters,
    classrooms = [],
    timeSlots,
    daysOfWeek,
}: SchedulesFormProps & { classrooms?: ClassroomOption[] }) {
    const [timeSlotsForm, setTimeSlotsForm] = useState<TimeSlotItem[]>(
        schedule?.time_slots?.map((slot) => ({
            day: slot.day,
            time_slot_id: slot.time_slot_id.toString(),
        })) || [],
    );
    const [newDay, setNewDay] = useState('');
    const [newTimeSlotId, setNewTimeSlotId] = useState('');
    const [slotError, setSlotError] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        subject_id: schedule?.subject_id.toString() || '',
        semester_id: schedule?.semester_id.toString() || '',
        classroom_id: (schedule as { classroom_id?: number | null })?.classroom_id
            ? String((schedule as { classroom_id?: number | null }).classroom_id)
            : '',
        time_slots: (schedule?.time_slots as TimeSlotItem[]) || [],
        room: schedule?.room || '',
        section: schedule?.section || '',
        is_active: schedule?.is_active ?? true,
    });

    const selectedSubject = subjects.find((s) => s.id.toString() === data.subject_id);
    const selectedSemester = semesters.find((s) => s.id.toString() === data.semester_id);
    const selectedClassroom = classrooms.find((c) => String(c.id) === data.classroom_id);

    const handleClassroomSelect = (classroomId: string) => {
        const selected = classrooms.find((c) => String(c.id) === classroomId);
        if (selected) {
            setData((prev) => ({
                ...prev,
                classroom_id: classroomId,
                room: `${selected.building} ${selected.room_number}`,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                classroom_id: '',
            }));
        }
    };

    const addTimeSlot = () => {
        setSlotError(null);

        if (!newDay || !newTimeSlotId) {
            setSlotError('Please select both a day of week and a time slot.');
            return;
        }

        if (timeSlotsForm.length >= 6) {
            setSlotError('A maximum of 6 slots can be scheduled per course section.');
            return;
        }

        const duplicate = timeSlotsForm.some(
            (slot) => slot.day === newDay && slot.time_slot_id === newTimeSlotId,
        );

        if (duplicate) {
            setSlotError('This exact day and time slot combination has already been added.');
            return;
        }

        const newSlot: TimeSlotItem = { day: newDay, time_slot_id: newTimeSlotId };
        const updated = [...timeSlotsForm, newSlot];
        setTimeSlotsForm(updated);
        setData('time_slots', updated);
        setNewDay('');
        setNewTimeSlotId('');
    };

    const removeTimeSlot = (index: number) => {
        const updated = timeSlotsForm.filter((_, i) => i !== index);
        setTimeSlotsForm(updated);
        setData('time_slots', updated);
    };

    const getDayLabel = (day: string) => {
        const dayObj = daysOfWeek.find((d) => d.value === day);
        return dayObj?.label || day;
    };

    const getTimeSlot = (timeSlotId: string) => {
        return timeSlots.find((t) => t.id.toString() === timeSlotId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(schedulesUpdate.url(schedule.id));
    };

    const isSubjectReady = Boolean(data.subject_id);
    const isSemesterReady = Boolean(data.semester_id);
    const isRoomSectionReady = Boolean(data.room && data.section);
    const isSlotsReady = timeSlotsForm.length > 0;

    return (
        <>
            <Head title={`Edit Schedule - ${schedule?.subject?.code || 'Schedule'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. External Page Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Schedule
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update timetable periods, section code, and room allocation for this schedule.
                    </p>
                </div>

                {/* 2. Structured Form & Master-Detail Layout */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                    {/* Left Column: Form Cards */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        {/* Card 1: Course & Academic Term */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">Course & Academic Term</CardTitle>
                                        <CardDescription className="text-xs">
                                            Select the academic course, target semester, and class section code.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="subject_id" className="text-xs font-medium">
                                            Subject / Course <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.subject_id}
                                            onValueChange={(value) => setData('subject_id', value)}
                                        >
                                            <SelectTrigger id="subject_id" className="h-9 text-xs" aria-invalid={!!errors.subject_id}>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.code} — {subject.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.subject_id} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="semester_id" className="text-xs font-medium">
                                            Academic Semester <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.semester_id}
                                            onValueChange={(value) => setData('semester_id', value)}
                                        >
                                            <SelectTrigger id="semester_id" className="h-9 text-xs" aria-invalid={!!errors.semester_id}>
                                                <SelectValue placeholder="Select semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {semesters.map((semester) => (
                                                    <SelectItem key={semester.id} value={semester.id.toString()}>
                                                        {semester.name} ({semester.academic_year})
                                                        {semester.is_current ? ' — Current' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.semester_id} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="section" className="text-xs font-medium">
                                            Section Code <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="section"
                                            value={data.section}
                                            onChange={(e) => setData('section', e.target.value)}
                                            placeholder="e.g. BSCS 3-A, BSIT 2-B"
                                            className="h-9 text-xs"
                                            required
                                            aria-invalid={!!errors.section}
                                        />
                                        <InputError message={errors.section} />
                                    </div>

                                    {selectedSubject && (
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="font-semibold text-foreground">{selectedSubject.code}</span>
                                                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                    {selectedSubject.title}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] bg-background">
                                                {selectedSubject.units} Units
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Classroom & Attendance Facility */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <DoorOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">Classroom & Attendance Terminal</CardTitle>
                                        <CardDescription className="text-xs">
                                            Assign physical classroom and link with ZKTeco biometric terminals for verification.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="classroom_id" className="text-xs font-medium">
                                            Assign Classroom (ZKTeco Binding)
                                        </Label>
                                        <Select
                                            value={data.classroom_id}
                                            onValueChange={handleClassroomSelect}
                                        >
                                            <SelectTrigger id="classroom_id" className="h-9 text-xs">
                                                <SelectValue placeholder="Select classroom..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classrooms.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.building} {c.room_number}
                                                        {c.room_name ? ` (${c.room_name})` : ''}
                                                        {c.zkteco_device ? ` — [ZKTeco: ${c.zkteco_device.device_name}]` : ' — [No Device]'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.classroom_id} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="room" className="text-xs font-medium">
                                            Room Label <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="room"
                                            value={data.room}
                                            onChange={(e) => setData('room', e.target.value)}
                                            placeholder="e.g. Room 302, CCS Lab 1"
                                            className="h-9 text-xs"
                                            required
                                            aria-invalid={!!errors.room}
                                        />
                                        <InputError message={errors.room} />
                                    </div>
                                </div>

                                {selectedClassroom?.zkteco_device ? (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5 text-xs text-foreground">
                                        <Fingerprint className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                                Biometric Verification Enabled
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Terminal: <strong>{selectedClassroom.zkteco_device.device_name}</strong>. Faculty taps in this room will automatically verify attendance for this class period.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                                        <AlertCircle className="size-4 shrink-0 text-muted-foreground/70 mt-0.5" />
                                        <p className="text-[11px]">
                                            No automated biometric terminal is linked to this room. Faculty will verify schedule presence manually.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Card 3: Weekly Timetable & Period Allocation */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <CalendarDays className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">Weekly Timetable & Periods</CardTitle>
                                            <CardDescription className="text-xs">
                                                Assign recurring days and period blocks for this schedule.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {timeSlotsForm.length} / 6 slots
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                {/* Slot Selection Form Row */}
                                <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                                        <div className="w-full sm:w-48 space-y-1">
                                            <Label htmlFor="day_select" className="text-xs font-medium">
                                                Day of Week
                                            </Label>
                                            <Select value={newDay} onValueChange={setNewDay}>
                                                <SelectTrigger id="day_select" className="w-full h-9 text-xs">
                                                    <SelectValue placeholder="Choose day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {daysOfWeek.map((day) => (
                                                        <SelectItem key={day.value} value={day.value}>
                                                            {day.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="w-full sm:flex-1 space-y-1">
                                            <Label htmlFor="time_slot_select" className="text-xs font-medium">
                                                Time Slot Block
                                            </Label>
                                            <Select value={newTimeSlotId} onValueChange={setNewTimeSlotId}>
                                                <SelectTrigger id="time_slot_select" className="w-full h-9 text-xs">
                                                    <SelectValue placeholder="Choose period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={slot.id} value={slot.id.toString()}>
                                                            {slot.name} ({slot.start_time} - {slot.end_time})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={addTimeSlot}
                                            disabled={!newDay || !newTimeSlotId || timeSlotsForm.length >= 6}
                                            className="w-full sm:w-auto h-9 px-4 text-xs font-medium shrink-0"
                                        >
                                            <Plus className="mr-1 size-3.5" />
                                            Add Slot
                                        </Button>
                                    </div>

                                    {slotError && (
                                        <p className="mt-2 text-xs text-destructive font-medium">{slotError}</p>
                                    )}
                                </div>

                                <InputError message={errors.time_slots} />

                                {/* Rendered List of Configured Slots */}
                                {timeSlotsForm.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {timeSlotsForm.map((slot, index) => {
                                            const slotDetails = getTimeSlot(slot.time_slot_id);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 shadow-xs transition-colors hover:border-primary/30"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                                                            <Clock className="size-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    {getDayLabel(slot.day)}
                                                                </span>
                                                                {slotDetails && (
                                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                                                        {slotDetails.name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground truncate">
                                                                {slotDetails
                                                                    ? `${slotDetails.start_time} — ${slotDetails.end_time}`
                                                                    : `Slot ID: ${slot.time_slot_id}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTimeSlot(index)}
                                                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        <span className="sr-only">Remove</span>
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                                        <Clock className="size-6 text-muted-foreground/40 mb-1.5" />
                                        <p className="font-medium text-foreground">No weekly periods added yet</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Select a day and period block above to build the schedule timetable.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Overview & Action Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">
                        {/* Action Panel Card */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Update Schedule</CardTitle>
                                <CardDescription className="text-xs">
                                    Save timetable modifications and status.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="flex items-start space-x-2 rounded-lg border border-border bg-muted/20 p-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                        className="mt-0.5"
                                    />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active" className="text-xs font-medium cursor-pointer">
                                            Active Schedule
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground leading-snug">
                                            Enable for student enrollment and faculty timetable loading.
                                        </p>
                                    </div>
                                </div>
                                <InputError message={errors.is_active} />

                                <div className="space-y-2 pt-1">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full text-xs font-semibold"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="mr-2 size-3.5" />
                                                Updating Schedule...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>

                                    <Button variant="outline" asChild className="w-full text-xs">
                                        <Link href={schedulesShow(schedule.id)}>Cancel</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Schedule Summary Card */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Live Preview</CardTitle>
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                        Schedule #{schedule.id}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0 text-xs">
                                <div className="space-y-1 border-b border-border/60 pb-2.5">
                                    <span className="text-[11px] text-muted-foreground font-medium">Course</span>
                                    <p className="font-medium text-foreground">
                                        {selectedSubject
                                            ? `${selectedSubject.code} — ${selectedSubject.title}`
                                            : <span className="text-muted-foreground italic">Not selected</span>}
                                    </p>
                                </div>

                                <div className="space-y-1 border-b border-border/60 pb-2.5">
                                    <span className="text-[11px] text-muted-foreground font-medium">Academic Term</span>
                                    <p className="font-medium text-foreground">
                                        {selectedSemester
                                            ? `${selectedSemester.name} (${selectedSemester.academic_year})`
                                            : <span className="text-muted-foreground italic">Not selected</span>}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-b border-border/60 pb-2.5">
                                    <div>
                                        <span className="text-[11px] text-muted-foreground font-medium">Section</span>
                                        <p className="font-medium text-foreground">
                                            {data.section || <span className="text-muted-foreground italic">—</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-muted-foreground font-medium">Room</span>
                                        <p className="font-medium text-foreground">
                                            {data.room || <span className="text-muted-foreground italic">—</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 border-b border-border/60 pb-2.5">
                                    <span className="text-[11px] text-muted-foreground font-medium">Attendance Terminal</span>
                                    <p className="font-medium text-foreground flex items-center gap-1.5">
                                        {selectedClassroom?.zkteco_device ? (
                                            <>
                                                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                                                <span>{selectedClassroom.zkteco_device.device_name}</span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">Standard / Manual</span>
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-1 pt-0.5">
                                    <span className="text-[11px] text-muted-foreground font-medium">Allocated Periods</span>
                                    <p className="font-medium text-foreground">
                                        {timeSlotsForm.length > 0
                                            ? `${timeSlotsForm.length} weekly slot${timeSlotsForm.length > 1 ? 's' : ''}`
                                            : <span className="text-muted-foreground italic">None added</span>}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Readiness Checklist */}
                        <Card className="border border-border/80 bg-card shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Configuration Checklist
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0 text-xs">
                                <div className="flex items-center gap-2">
                                    {isSubjectReady ? (
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={isSubjectReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                        Course offering selected
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isSemesterReady ? (
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={isSemesterReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                        Academic semester assigned
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isRoomSectionReady ? (
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={isRoomSectionReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                        Room label & section defined
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isSlotsReady ? (
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={isSlotsReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                        At least one weekly time slot added
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Schedules', href: schedules() },
            { title: 'Edit Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
