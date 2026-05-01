import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import InputError from '@/components/input-error';
import { index as draftSchedules, update as draftSchedulesUpdate } from '@/routes/draft-schedules';
import type { DraftSchedulesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ draftSchedule, teachers, schedules }: DraftSchedulesFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        teacher_id: draftSchedule?.teacher_id.toString() || '',
        schedule_id: draftSchedule?.schedule_id.toString() || '',
        notes: draftSchedule?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (draftSchedule) {
            put(draftSchedulesUpdate(draftSchedule.id));
        }
    };

    return (
        <>
            <Head title="Edit Assignment" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={draftSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Schedule Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Teacher</Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) => setData('teacher_id', value)}
                                >
                                    <SelectTrigger id="teacher_id">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.teacher_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule_id">Schedule</Label>
                                <Select
                                    value={data.schedule_id}
                                    onValueChange={(value) => setData('schedule_id', value)}
                                >
                                    <SelectTrigger id="schedule_id">
                                        <SelectValue placeholder="Select schedule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schedules.map((schedule) => (
                                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                {schedule.subject.code} - {schedule.subject.title} ({schedule.semester.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.schedule_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                    placeholder="Optional notes about this assignment..."
                                    rows={4}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={draftSchedules()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Assignment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Assign Schedule', href: draftSchedules() },
            { title: 'Edit Assignment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
