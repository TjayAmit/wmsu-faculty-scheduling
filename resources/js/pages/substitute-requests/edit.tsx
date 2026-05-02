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
import { index as substituteRequests, show as substituteRequestsShow, update as substituteRequestsUpdate } from '@/routes/substitute-requests';
import type { SubstituteRequestsFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ substituteRequest, teachers }: SubstituteRequestsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        requesting_teacher_id: substituteRequest?.requesting_teacher_id?.toString() || '',
        substitute_teacher_id: substituteRequest?.substitute_teacher_id?.toString() || '',
        schedule_id: substituteRequest?.schedule_id?.toString() || '',
        date: substituteRequest?.date || '',
        reason: substituteRequest?.reason || '',
        notes: substituteRequest?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (substituteRequest) {
            put(substituteRequestsUpdate.url(substituteRequest.id));
        }
    };

    return (
        <>
            <Head title="Edit Substitute Request" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={substituteRequest ? substituteRequestsShow(substituteRequest.id) : substituteRequests()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Substitute Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="requesting_teacher_id">Requesting Teacher *</Label>
                                    <Select
                                        value={data.requesting_teacher_id}
                                        onValueChange={(value) => setData('requesting_teacher_id', value)}
                                    >
                                        <SelectTrigger id="requesting_teacher_id">
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers?.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.first_name} {teacher.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.requesting_teacher_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="substitute_teacher_id">Substitute Teacher (Optional)</Label>
                                    <Select
                                        value={data.substitute_teacher_id}
                                        onValueChange={(value) => setData('substitute_teacher_id', value)}
                                    >
                                        <SelectTrigger id="substitute_teacher_id">
                                            <SelectValue placeholder="Select substitute" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers?.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.first_name} {teacher.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.substitute_teacher_id} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.date} />
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

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason *</Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Why do you need a substitute?"
                                    rows={3}
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
                                    placeholder="Any additional information"
                                    rows={2}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={substituteRequest ? substituteRequestsShow(substituteRequest.id) : substituteRequests()}>Cancel</Link>
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
            { title: 'Substitute Requests', href: substituteRequests() },
            { title: 'Edit Request', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
