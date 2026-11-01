import { Head, Link, useForm } from '@inertiajs/react';
import { Save, DoorOpen, Calendar, Clock, CheckCircle2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as roomSchedules, store as roomSchedulesStore } from '@/routes/room-schedules';
import type { ClassroomOption } from '@/types';

interface CreateProps {
    classrooms: ClassroomOption[];
    selectedClassroomId?: string | number | null;
}

export default function Create({ classrooms, selectedClassroomId }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        classroom_id: selectedClassroomId ? String(selectedClassroomId) : '',
        schedule_id: '',
        date: '',
        start_time: '',
        end_time: '',
        notes: '',
        is_active: true,
    });

    const selectedClassroom = classrooms.find((c) => c.id.toString() === data.classroom_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(roomSchedulesStore.url());
    };

    return (
        <>
            <Head title="Create Room Schedule" />

            {/* Container fits within viewport without artificial scrollbars */}
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description */}
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Create Room Schedule
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Allocate physical classroom reservations, date assignments, and active usage hours.
                    </p>
                </div>

                {/* 2. Compact Form Layout: Full-width utilization with zero vertical overflow */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
                        {/* Main Details Card (8 cols) */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <DoorOpen className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Room & Reservation Period</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Select physical classroom, calendar date, and reservation time window.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3.5">
                                    <div className="grid gap-3.5 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="classroom_id" className="text-xs font-medium">
                                                Classroom <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.classroom_id}
                                                onValueChange={(value) => setData('classroom_id', value)}
                                            >
                                                <SelectTrigger id="classroom_id" className="h-9 text-xs" aria-invalid={!!errors.classroom_id}>
                                                    <SelectValue placeholder="Select classroom..." />
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

                                        <div className="space-y-1.5">
                                            <Label htmlFor="date" className="text-xs font-medium">
                                                Reservation Date <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                                aria-invalid={!!errors.date}
                                            />
                                            <InputError message={errors.date} />
                                        </div>
                                    </div>

                                    <div className="grid gap-3.5 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium">
                                                Time Window <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Input
                                                        id="start_time"
                                                        type="time"
                                                        value={data.start_time}
                                                        onChange={(e) => setData('start_time', e.target.value)}
                                                        className="h-9 text-xs font-mono"
                                                        placeholder="Start"
                                                        required
                                                        aria-invalid={!!errors.start_time}
                                                    />
                                                    <InputError message={errors.start_time} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Input
                                                        id="end_time"
                                                        type="time"
                                                        value={data.end_time}
                                                        onChange={(e) => setData('end_time', e.target.value)}
                                                        className="h-9 text-xs font-mono"
                                                        placeholder="End"
                                                        required
                                                        aria-invalid={!!errors.end_time}
                                                    />
                                                    <InputError message={errors.end_time} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="schedule_id" className="text-xs font-medium">
                                                Linked Schedule ID (Optional)
                                            </Label>
                                            <Input
                                                id="schedule_id"
                                                type="number"
                                                value={data.schedule_id}
                                                onChange={(e) => setData('schedule_id', e.target.value)}
                                                placeholder="e.g. 101"
                                                className="h-9 text-xs font-mono"
                                                aria-invalid={!!errors.schedule_id}
                                            />
                                            <InputError message={errors.schedule_id} />
                                        </div>
                                    </div>

                                    {/* Remarks field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-xs font-medium">
                                            Notes / Purpose (Optional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="e.g. Special exam venue, departmental defense session..."
                                            rows={2}
                                            className="text-xs resize-none"
                                            aria-invalid={!!errors.notes}
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary & Save Action Card (4 cols) */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Summary & Actions</CardTitle>
                                        </div>
                                        <Badge variant={data.is_active ? 'default' : 'secondary'} className="text-[10px] uppercase font-semibold">
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3.5 space-y-3.5">
                                    {/* Active checkbox */}
                                    <div className="flex items-start space-x-2.5 rounded-lg border border-border bg-muted/20 p-2.5">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-medium cursor-pointer">
                                                Active Room Booking
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground leading-snug">
                                                Marks the classroom as reserved during this time slot.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Live overview */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                                        <div className="flex justify-between items-center gap-2 border-b border-border/50 pb-1.5">
                                            <span className="text-muted-foreground font-medium shrink-0">Classroom:</span>
                                            <span className="font-semibold text-foreground text-right truncate">
                                                {selectedClassroom
                                                    ? `${selectedClassroom.building} ${selectedClassroom.room_number}`
                                                    : <span className="text-muted-foreground font-normal italic">Not selected</span>}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-2 border-b border-border/50 pb-1.5">
                                            <span className="text-muted-foreground font-medium shrink-0">Date:</span>
                                            <span className="font-semibold text-foreground text-right">
                                                {data.date || <span className="text-muted-foreground font-normal italic">—</span>}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-muted-foreground font-medium shrink-0">Time Window:</span>
                                            <span className="font-mono text-foreground text-right font-medium">
                                                {data.start_time && data.end_time
                                                    ? `${data.start_time} — ${data.end_time}`
                                                    : <span className="text-muted-foreground font-sans font-normal italic">—</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Save and Cancel buttons right here without scrolling */}
                                    <div className="space-y-2 pt-1">
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
                                                    Create Room Schedule
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            type="button"
                                            asChild
                                            className="w-full h-9"
                                        >
                                            <Link href={selectedClassroomId ? `/classrooms/${selectedClassroomId}` : '/classrooms'}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
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
            { title: 'Room Schedules', href: roomSchedules() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
