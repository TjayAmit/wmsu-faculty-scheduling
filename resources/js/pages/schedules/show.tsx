import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as schedules, edit as schedulesEdit, destroy as schedulesDestroy } from '@/routes/schedules';
import type { SchedulesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

export default function Show({ schedule }: SchedulesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(schedulesDestroy(schedule.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Schedule - ${schedule.subject.code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={schedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>{schedule.subject.code} - {schedule.subject.title}</CardTitle>
                            <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                {schedule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={schedulesEdit(schedule.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Subject Code</p>
                                <p>{schedule.subject.code}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Subject Title</p>
                                <p>{schedule.subject.title}</p>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Time Slots</p>
                            {schedule.time_slots && schedule.time_slots.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {schedule.time_slots.map((slot, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                            {dayLabels[slot.day]}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No time slots assigned</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Room</p>
                                <p>{schedule.room}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Section</p>
                                <p>{schedule.section}</p>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Semester</p>
                            <p>{schedule.semester.name} ({schedule.semester.academic_year})</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Teacher Assignment</p>
                            {schedule.teacher_assignment ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant={schedule.teacher_assignment.is_active ? 'default' : 'secondary'}>
                                        {schedule.teacher_assignment.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <span>{schedule.teacher_assignment.teacher.user.name}</span>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">Not assigned</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p>{schedule.created_at}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p>{schedule.updated_at}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Schedule</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete the schedule for{' '}
                                    <span className="font-medium text-foreground">{schedule.subject.code} - {schedule.subject.title}</span>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Schedules', href: schedules() },
            { title: 'View Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
