import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Plus, User, BookOpen, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    index as assignSchedules,
    store as assignSchedulesStore,
} from '@/routes/assign-schedules';
import type { AssignSchedulesCreateProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Create({ teachers, schedules }: AssignSchedulesCreateProps) {
    const [teacherId, setTeacherId] = useState('');
    const [scheduleId, setScheduleId] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedSchedule = schedules.find(s => s.id.toString() === scheduleId);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!teacherId || !scheduleId) return;

        setIsSubmitting(true);
        router.post(assignSchedulesStore().url, {
            teacher_id: teacherId,
            schedule_id: scheduleId,
            notes: notes,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Assign Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={assignSchedules().url}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Assignments
                        </a>
                    </Button>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assign Schedule to Teacher</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="teacher">
                                        <User className="mr-1 inline h-4 w-4" />
                                        Teacher
                                    </Label>
                                    <Select value={teacherId} onValueChange={setTeacherId} required>
                                        <SelectTrigger id="teacher">
                                            <SelectValue placeholder="Select a teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schedule">
                                        <BookOpen className="mr-1 inline h-4 w-4" />
                                        Schedule
                                    </Label>
                                    <Select value={scheduleId} onValueChange={setScheduleId} required>
                                        <SelectTrigger id="schedule">
                                            <SelectValue placeholder="Select a schedule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schedules.map((schedule) => (
                                                <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                    {schedule.name} ({schedule.semester})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedSchedule && selectedSchedule.timeSlots.length > 0 && (
                                    <div className="rounded-md bg-muted p-4">
                                        <Label className="mb-2 block text-sm font-medium">
                                            <Clock className="mr-1 inline h-4 w-4" />
                                            Schedule Time Slots
                                        </Label>
                                        <ul className="space-y-1 text-sm">
                                            {selectedSchedule.timeSlots.map((slot, index) => (
                                                <li key={index} className="text-muted-foreground">
                                                    {slot.day}: {slot.start_time} - {slot.end_time}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                        placeholder="Add any notes about this assignment..."
                                        rows={4}
                                    />
                                </div>

                                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        This will automatically approve the assignment and generate teacher schedules immediately.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" type="button" asChild>
                                        <a href={assignSchedules().url}>Cancel</a>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!teacherId || !scheduleId || isSubmitting}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Assigning...' : 'Assign Schedule'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Assign Schedules', href: assignSchedules() },
            { title: 'New Assignment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
