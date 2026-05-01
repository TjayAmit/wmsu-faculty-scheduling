import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import { index as schedules, show as schedulesShow, update as schedulesUpdate } from '@/routes/schedules';
import type { SchedulesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ schedule, subjects, semesters, timeSlots, daysOfWeek }: SchedulesFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        subject_id: schedule?.subject_id.toString() || '',
        semester_id: schedule?.semester_id.toString() || '',
        time_slot_id: schedule?.time_slot_id.toString() || '',
        day_of_week: schedule?.day_of_week || '',
        room: schedule?.room || '',
        section: schedule?.section || '',
        is_active: schedule?.is_active ?? true,
    });

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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="day_of_week">Day of Week</Label>
                                    <Select
                                        value={data.day_of_week}
                                        onValueChange={(value) => setData('day_of_week', value)}
                                    >
                                        <SelectTrigger id="day_of_week">
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
                                    <InputError message={errors.day_of_week} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time_slot_id">Time Slot</Label>
                                    <Select
                                        value={data.time_slot_id}
                                        onValueChange={(value) => setData('time_slot_id', value)}
                                    >
                                        <SelectTrigger id="time_slot_id">
                                            <SelectValue placeholder="Select time slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((slot) => (
                                                <SelectItem key={slot.id} value={slot.id.toString()}>
                                                    {slot.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.time_slot_id} />
                                </div>
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
