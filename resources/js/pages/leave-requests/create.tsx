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
import type { LeaveRequestTeacher } from '@/types';
import { index as leaveRequests, store as leaveRequestsStore } from '@/routes/leave-requests';
import type { LeaveRequestsFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Create({ teachers }: LeaveRequestsFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        teacher_id: '',
        leave_type: 'sick',
        start_date: '',
        end_date: '',
        reason: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(leaveRequestsStore.url());
    };

    return (
        <>
            <Head title="Create Leave Request" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={leaveRequests()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Leave Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label htmlFor="leave_type">Leave Type *</Label>
                                <Select
                                    value={data.leave_type}
                                    onValueChange={(value) => setData('leave_type', value)}
                                >
                                    <SelectTrigger id="leave_type">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">Sick Leave</SelectItem>
                                        <SelectItem value="vacation">Vacation Leave</SelectItem>
                                        <SelectItem value="personal">Personal Leave</SelectItem>
                                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.leave_type} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date *</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason *</Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Please provide a detailed reason for your leave request"
                                    rows={4}
                                    required
                                />
                                <InputError message={errors.reason} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional information or special considerations"
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Request'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={leaveRequests()}>Cancel</Link>
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
            { title: 'Leave Requests', href: leaveRequests() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
