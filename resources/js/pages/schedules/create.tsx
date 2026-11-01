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
    Save,
    ExternalLink,
    Layers,
    PenLine,
    Users,
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
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { index as schedules, store as schedulesStore } from '@/routes/schedules';
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

export default function Create({
    subjects,
    semesters,
    classrooms = [],
    timeSlots,
    daysOfWeek,
    sections = [],
}: SchedulesFormProps & { classrooms?: ClassroomOption[] }) {
    const [timeSlotsForm, setTimeSlotsForm] = useState<TimeSlotItem[]>([]);
    const [newDay, setNewDay] = useState('');
    const [newTimeSlotId, setNewTimeSlotId] = useState('');
    const [slotError, setSlotError] = useState<string | null>(null);
    const [isCustomSection, setIsCustomSection] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        semester_id: '',
        classroom_id: '',
        time_slots: [] as TimeSlotItem[],
        room: '',
        section: '',
        is_active: true,
    });

    const selectedSubject = subjects.find((s) => s.id.toString() === data.subject_id);
    const selectedSemester = semesters.find((s) => s.id.toString() === data.semester_id);
    const selectedClassroom = classrooms.find((c) => String(c.id) === data.classroom_id);
    const selectedSection = sections.find((s) => s.section_code.toLowerCase() === data.section.trim().toLowerCase());

    // Group available sections by degree program
    const groupedSections = sections.reduce((acc, s) => {
        const prog = s.program?.code || 'General';
        if (!acc[prog]) acc[prog] = [];
        acc[prog].push(s);
        return acc;
    }, {} as Record<string, typeof sections>);

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
            setSlotError('Please select both a day of week and a time slot period.');
            return;
        }

        if (timeSlotsForm.length >= 3) {
            setSlotError('A maximum of 3 time slots can be scheduled per course section.');
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
        post(schedulesStore.url());
    };

    const isSubjectReady = Boolean(data.subject_id);
    const isSemesterReady = Boolean(data.semester_id);
    const isRoomSectionReady = Boolean(data.room && data.section);
    const isSlotsReady = timeSlotsForm.length > 0;

    return (
        <>
            <Head title="Create Schedule" />

            {/* Canvas strictly spans full left-to-right space */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE cards (No redundant back arrow) */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Create Schedule
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure course timetables, period allocations, classroom assignments, and section details.
                    </p>
                </div>

                {/* 2. Full-Width 2:1 Asymmetric Form Layout */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* Main Information Column (2 Columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Card 1: Course & Academic Term */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Course & Academic Term</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Select the academic course, target semester, and section identifier.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="subject_id">
                                                Subject / Course <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.subject_id}
                                                onValueChange={(value) => setData('subject_id', value)}
                                            >
                                                <SelectTrigger id="subject_id" aria-invalid={!!errors.subject_id}>
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

                                        <div className="space-y-2">
                                            <Label htmlFor="semester_id">
                                                Academic Semester <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.semester_id}
                                                onValueChange={(value) => setData('semester_id', value)}
                                            >
                                                <SelectTrigger id="semester_id" aria-invalid={!!errors.semester_id}>
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

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="section" className="text-xs font-semibold">
                                                    Section Code <span className="text-destructive">*</span>
                                                </Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomSection(!isCustomSection)}
                                                    className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                                                >
                                                    {isCustomSection ? (
                                                        <>
                                                            <Layers className="size-3" />
                                                            Choose Registered Section
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PenLine className="size-3" />
                                                            Custom Code
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {!isCustomSection && sections.length > 0 ? (
                                                <Select
                                                    value={data.section}
                                                    onValueChange={(val) => setData('section', val)}
                                                >
                                                    <SelectTrigger id="section" aria-invalid={!!errors.section} className="text-sm font-mono">
                                                        <SelectValue placeholder="Select section from Sections module..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-72">
                                                        {Object.entries(groupedSections).map(([progCode, secList]) => (
                                                            <SelectGroup key={progCode}>
                                                                <SelectLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 px-2 py-1">
                                                                    {progCode} Program Sections
                                                                </SelectLabel>
                                                                {secList.map((s) => (
                                                                    <SelectItem key={s.id} value={s.section_code} className="cursor-pointer">
                                                                        <div className="flex items-center justify-between w-full gap-4">
                                                                            <span className="font-mono font-semibold">{s.section_code}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Year {s.year_level} ({s.max_students || 40} seats)
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id="section"
                                                    value={data.section}
                                                    onChange={(e) => setData('section', e.target.value)}
                                                    placeholder="e.g. BEED 3-A, BSED-ENG 2-B"
                                                    required
                                                    aria-invalid={!!errors.section}
                                                    className="text-sm font-mono"
                                                />
                                            )}

                                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                <span>
                                                    {!isCustomSection
                                                        ? 'Synced with the Sections module database.'
                                                        : 'Manual entry for unlisted section.'}
                                                </span>
                                                <Link
                                                    href="/sections"
                                                    target="_blank"
                                                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                                >
                                                    Sections Module <ExternalLink className="size-2.5" />
                                                </Link>
                                            </div>
                                            <InputError message={errors.section} />
                                        </div>

                                        {/* Right Column: Selected Section or Subject Info Box */}
                                        <div className="space-y-2 mt-auto">
                                            {selectedSection ? (
                                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                                            <Users className="size-3.5" />
                                                            Section Details
                                                        </span>
                                                        <Badge variant="outline" className="border-primary/30 text-primary bg-background text-[10px] font-mono font-semibold">
                                                            {selectedSection.section_code}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs font-medium text-foreground truncate">
                                                        {selectedSection.program?.name || selectedSection.program?.code || 'Academic Degree Program'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-primary/15">
                                                        <span>Year {selectedSection.year_level}</span>
                                                        <span>•</span>
                                                        <span>Class Capacity: <strong className="text-foreground">{selectedSection.max_students || 40} seats</strong></span>
                                                    </div>
                                                </div>
                                            ) : selectedSubject ? (
                                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                                                    <div className="space-y-0.5">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {selectedSubject.code}
                                                        </span>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {selectedSubject.title}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-medium">
                                                        {selectedSubject.units ?? 3} Units
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3.5 text-center text-xs text-muted-foreground">
                                                    Choose a course and registered section to inspect class enrollment limits.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Classroom & Attendance Facility */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <DoorOpen className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Classroom & Biometric Terminal</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Assign physical classroom and link with ZKTeco biometric terminals for verification.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="classroom_id">
                                                Classroom (ZKTeco Binding)
                                            </Label>
                                            <Select
                                                value={data.classroom_id}
                                                onValueChange={handleClassroomSelect}
                                            >
                                                <SelectTrigger id="classroom_id">
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

                                        <div className="space-y-2">
                                            <Label htmlFor="room">
                                                Room Label <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="room"
                                                value={data.room}
                                                onChange={(e) => setData('room', e.target.value)}
                                                placeholder="e.g. ED 101, Education Lab 2"
                                                required
                                                aria-invalid={!!errors.room}
                                            />
                                            <InputError message={errors.room} />
                                        </div>
                                    </div>

                                    {selectedClassroom?.zkteco_device ? (
                                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-start gap-3">
                                            <Fingerprint className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Biometric Verification Active
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Connected to <strong>{selectedClassroom.zkteco_device.device_name}</strong>. Faculty taps in this classroom will automatically verify timetable attendance.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                            <AlertCircle className="size-5 shrink-0 text-muted-foreground/70 mt-0.5" />
                                            <div className="space-y-0.5 text-xs text-muted-foreground">
                                                <p className="font-medium text-foreground">Standard / Manual Verification</p>
                                                <p>
                                                    No automated biometric device is linked to this room. Faculty schedule presence will be tracked manually or via department log.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Card 3: Weekly Timetable & Period Allocation */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="size-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Weekly Timetable & Periods</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {timeSlotsForm.length} / 3 slots
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Assign recurring weekly days and time slot blocks for this schedule.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-4">
                                    {/* Slot Selection Control Box */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                                            <div className="w-full sm:w-48 space-y-1.5">
                                                <Label htmlFor="day_select" className="text-xs font-medium">
                                                    Day of Week
                                                </Label>
                                                <Select value={newDay} onValueChange={setNewDay}>
                                                    <SelectTrigger id="day_select" className="w-full">
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

                                            <div className="w-full sm:flex-1 space-y-1.5">
                                                <Label htmlFor="time_slot_select" className="text-xs font-medium">
                                                    Time Slot Period
                                                </Label>
                                                <Select value={newTimeSlotId} onValueChange={setNewTimeSlotId}>
                                                    <SelectTrigger id="time_slot_select" className="w-full">
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
                                                onClick={addTimeSlot}
                                                disabled={!newDay || !newTimeSlotId || timeSlotsForm.length >= 3}
                                                className="w-full sm:w-auto h-10 px-4 text-xs font-medium shrink-0"
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {timeSlotsForm.map((slot, index) => {
                                                const slotDetails = getTimeSlot(slot.time_slot_id);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/40"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                                <Clock className="size-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-sm font-semibold text-foreground">
                                                                        {getDayLabel(slot.day)}
                                                                    </span>
                                                                    {slotDetails && (
                                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                                                            {slotDetails.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
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
                                                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">Remove</span>
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                                            <Clock className="size-8 text-muted-foreground/40 mb-2" />
                                            <p className="font-medium text-foreground">No weekly periods added yet</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Select a day and time slot block above to schedule recurring sessions.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Actions & Overview Column (1 Column) */}
                        <div className="space-y-6">
                            {/* Schedule Status Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Schedule Status</CardTitle>
                                    <CardDescription className="text-xs">
                                        Determine operational status and student visibility.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-4">
                                    <div className="flex items-start space-x-3 rounded-lg border border-border p-3.5 bg-muted/20">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                                Active Schedule
                                            </Label>
                                            <p className="text-xs text-muted-foreground leading-normal">
                                                Enable for student enrollment, timetable publication, and faculty load calculations.
                                            </p>
                                        </div>
                                    </div>
                                    <InputError message={errors.is_active} />
                                </CardContent>
                            </Card>

                            {/* Live Preview & Readiness Checklist Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold">Live Preview</CardTitle>
                                        <Badge variant={data.is_active ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                                            {data.is_active ? 'Active' : 'Draft'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3.5 text-xs">
                                    <div className="space-y-1 border-b border-border/60 pb-2.5">
                                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Course Offering</span>
                                        <p className="font-semibold text-foreground text-sm">
                                            {selectedSubject
                                                ? `${selectedSubject.code} — ${selectedSubject.title}`
                                                : <span className="text-muted-foreground italic font-normal">Not selected</span>}
                                        </p>
                                    </div>

                                    <div className="space-y-1 border-b border-border/60 pb-2.5">
                                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Academic Term</span>
                                        <p className="font-medium text-foreground">
                                            {selectedSemester
                                                ? `${selectedSemester.name} (${selectedSemester.academic_year})`
                                                : <span className="text-muted-foreground italic font-normal">Not selected</span>}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 border-b border-border/60 pb-2.5">
                                        <div>
                                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Section</span>
                                            <p className="font-semibold text-foreground">
                                                {data.section || <span className="text-muted-foreground italic font-normal">—</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Room</span>
                                            <p className="font-semibold text-foreground">
                                                {data.room || <span className="text-muted-foreground italic font-normal">—</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 border-b border-border/60 pb-2.5">
                                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Attendance Terminal</span>
                                        <p className="font-medium text-foreground flex items-center gap-1.5">
                                            {selectedClassroom?.zkteco_device ? (
                                                <>
                                                    <span className="inline-block size-2 rounded-full bg-emerald-500" />
                                                    <span>{selectedClassroom.zkteco_device.device_name}</span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">Standard / Manual</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-1">
                                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Configuration Checklist</span>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex items-center gap-2">
                                                {isSubjectReady ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                                                )}
                                                <span className={isSubjectReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                                    Course selected
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isSemesterReady ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                                                )}
                                                <span className={isSemesterReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                                    Semester assigned
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isRoomSectionReady ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                                                )}
                                                <span className={isRoomSectionReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                                    Room & section defined
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isSlotsReady ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                                                )}
                                                <span className={isSlotsReady ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                                    Weekly time slots added ({timeSlotsForm.length}/3)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Action Controls Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <CardTitle className="text-base font-semibold">Save Schedule</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2.5">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-10 gap-1.5 font-medium"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="size-4 mr-2" />
                                                Creating Schedule...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                Create Schedule
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        asChild
                                        className="w-full h-10"
                                    >
                                        <Link href={schedules()}>Cancel</Link>
                                    </Button>
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
            { title: 'Schedules', href: schedules() },
            { title: 'Create Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
