import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as roomSchedules, store as roomSchedulesStore } from '@/routes/room-schedules';
import type { ClassroomOption } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface CreateProps {
    classrooms: ClassroomOption[];
}

export default function Create({ classrooms }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        classroom_id: '',
        schedule_id: '',
        date: '',
        start_time: '',
        end_time: '',
        notes: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(roomSchedulesStore.url());
    };

    return (
        <>
            <Head title="Create Room Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={roomSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Room Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="classroom_id">Classroom *</Label>
                                <Select
                                    value={data.classroom_id}
                                    onValueChange={(value) => setData('classroom_id', value)}
                                >
                                    <SelectTrigger id="classroom_id">
                                        <SelectValue placeholder="Select classroom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.building} - {room.room_number}
                                                {room.room_name && ` (${room.room_name})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.classroom_id} />
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
                                    <Label htmlFor="schedule_id">Schedule (Optional)</Label>
                                    <Input
                                        id="schedule_id"
                                        type="number"
                                        value={data.schedule_id}
                                        onChange={(e) => setData('schedule_id', e.target.value)}
                                        placeholder="Schedule ID"
                                    />
                                    <InputError message={errors.schedule_id} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_time} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this room schedule"
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
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
                                    {processing ? 'Creating...' : 'Create Schedule'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={roomSchedules()}>Cancel</Link>
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
            { title: 'Room Schedules', href: roomSchedules() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
