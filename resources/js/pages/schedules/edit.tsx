import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { index as schedules, show as schedulesShow, update as schedulesUpdate } from '@/routes/schedules';
import type { SchedulesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface TimeSlot {
    day: string;
    time_slot_id: string;
}

export default function Edit({ schedule, subjects, semesters, timeSlots, daysOfWeek }: SchedulesFormProps) {
    const [timeSlotsForm, setTimeSlotsForm] = useState<TimeSlot[]>([]);
    const [newDay, setNewDay] = useState('');
    const [newTimeSlotId, setNewTimeSlotId] = useState('');

    useEffect(() => {
        if (schedule?.time_slots) {
            setTimeSlotsForm(schedule.time_slots);
        }
    }, [schedule]);

    const { data, setData, put, processing, errors } = useForm({
        subject_id: schedule?.subject_id.toString() || '',
        semester_id: schedule?.semester_id.toString() || '',
        time_slots: schedule?.time_slots || [],
        room: schedule?.room || '',
        section: schedule?.section || '',
        is_active: schedule?.is_active ?? true,
    });

    const addTimeSlot = () => {
        if (!newDay || !newTimeSlotId) return;
        if (timeSlotsForm.length >= 3) return;
        
        const duplicate = timeSlotsForm.some(
            slot => slot.day === newDay && slot.time_slot_id === newTimeSlotId
        );
        if (duplicate) return;

        const newSlot: TimeSlot = { day: newDay, time_slot_id: newTimeSlotId };
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
        const dayObj = daysOfWeek.find(d => d.value === day);
        return dayObj?.label || day;
    };

    const getTimeSlotLabel = (timeSlotId: string) => {
        const slot = timeSlots.find(t => t.id.toString() === timeSlotId);
        return slot?.name || timeSlotId;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (schedule) {
            put(schedulesUpdate.url(schedule.id));
        }
    };

    return (
        <>
            <Head title="Edit Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={schedule ? schedulesShow(schedule.id) : schedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject_id">Subject</Label>
                                <Select
                                    value={data.subject_id}
                                    onValueChange={(value) => setData('subject_id', value)}
                                >
                                    <SelectTrigger id="subject_id">
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.code} - {subject.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.subject_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="semester_id">Semester</Label>
                                <Select
                                    value={data.semester_id}
                                    onValueChange={(value) => setData('semester_id', value)}
                                >
                                    <SelectTrigger id="semester_id">
                                        <SelectValue placeholder="Select a semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((semester) => (
                                            <SelectItem key={semester.id} value={semester.id.toString()}>
                                                {semester.name} ({semester.academic_year})
                                                {semester.is_current && ' - Current'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.semester_id} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Time Slots (1-3)</Label>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Add up to 3 day and time slot combinations
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_day" className="text-sm">Day</Label>
                                            <Select
                                                value={newDay}
                                                onValueChange={setNewDay}
                                                disabled={timeSlotsForm.length >= 3}
                                            >
                                                <SelectTrigger id="new_day">
                                                    <SelectValue placeholder="Select day" />
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

                                        <div className="space-y-2">
                                            <Label htmlFor="new_time_slot_id" className="text-sm">Time Slot</Label>
                                            <Select
                                                value={newTimeSlotId}
                                                onValueChange={setNewTimeSlotId}
                                                disabled={timeSlotsForm.length >= 3}
                                            >
                                                <SelectTrigger id="new_time_slot_id">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={slot.id} value={slot.id.toString()}>
                                                            {slot.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addTimeSlot}
                                        disabled={!newDay || !newTimeSlotId || timeSlotsForm.length >= 3}
                                        className="mt-3"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Time Slot ({timeSlotsForm.length}/3)
                                    </Button>

                                    <InputError message={errors.time_slots} />
                                </div>

                                {timeSlotsForm.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">Selected Time Slots</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {timeSlotsForm.map((slot, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-2 px-3 py-1.5"
                                                >
                                                    <span>
                                                        {getDayLabel(slot.day)} - {getTimeSlotLabel(slot.time_slot_id)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTimeSlot(index)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="room">Room</Label>
                                    <Input
                                        id="room"
                                        value={data.room}
                                        onChange={(e) => setData('room', e.target.value)}
                                        placeholder="e.g., Room 101"
                                        required
                                    />
                                    <InputError message={errors.room} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Input
                                        id="section"
                                        value={data.section}
                                        onChange={(e) => setData('section', e.target.value)}
                                        placeholder="e.g., Section A"
                                        required
                                    />
                                    <InputError message={errors.section} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active schedule
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={schedule ? schedulesShow(schedule.id) : schedules()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
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
