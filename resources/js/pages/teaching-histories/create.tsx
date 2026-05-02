import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as teachingHistories, store as teachingHistoriesStore } from '@/routes/teaching-histories';
import type { TeachingHistoriesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Create({ teachers, semesters, subjects }: TeachingHistoriesFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        teacher_id: '',
        semester_id: '',
        subject_id: '',
        schedule_id: '',
        hours_assigned: '',
        hours_completed: '',
        status: 'incomplete',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(teachingHistoriesStore.url());
    };

    return (
        <>
            <Head title="Create Teaching History" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={teachingHistories()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Teaching History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="teacher_id">Teacher *</Label>
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
                                                    {teacher.first_name} {teacher.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.teacher_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester_id">Semester *</Label>
                                    <Select
                                        value={data.semester_id}
                                        onValueChange={(value) => setData('semester_id', value)}
                                    >
                                        <SelectTrigger id="semester_id">
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesters.map((semester) => (
                                                <SelectItem key={semester.id} value={semester.id.toString()}>
                                                    {semester.name} {semester.year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.semester_id} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_id">Subject *</Label>
                                    <Select
                                        value={data.subject_id}
                                        onValueChange={(value) => setData('subject_id', value)}
                                    >
                                        <SelectTrigger id="subject_id">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.code} - {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.subject_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schedule_id">Schedule ID (Optional)</Label>
                                    <Input
                                        id="schedule_id"
                                        type="number"
                                        value={data.schedule_id}
                                        onChange={(e) => setData('schedule_id', e.target.value)}
                                        placeholder="Link to schedule"
                                    />
                                    <InputError message={errors.schedule_id} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="hours_assigned">Hours Assigned *</Label>
                                    <Input
                                        id="hours_assigned"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.hours_assigned}
                                        onChange={(e) => setData('hours_assigned', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.hours_assigned} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hours_completed">Hours Completed</Label>
                                    <Input
                                        id="hours_completed"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.hours_completed}
                                        onChange={(e) => setData('hours_completed', e.target.value)}
                                    />
                                    <InputError message={errors.hours_completed} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="incomplete">Incomplete</SelectItem>
                                            <SelectItem value="dropped">Dropped</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this teaching assignment"
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create History'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={teachingHistories()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Teaching Histories', href: teachingHistories() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
