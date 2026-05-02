import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Archive } from 'lucide-react';
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
import { index as teachingHistories, edit as teachingHistoriesEdit, destroy as teachingHistoriesDestroy, archive as teachingHistoriesArchive } from '@/routes/teaching-histories';
import type { TeachingHistoriesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ teachingHistory }: TeachingHistoriesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(teachingHistoriesDestroy(teachingHistory.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleArchive = () => {
        router.post(teachingHistoriesArchive.url(teachingHistory.id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            completed: 'default',
            incomplete: 'secondary',
            dropped: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const completionPercentage = teachingHistory.hours_assigned > 0
        ? (teachingHistory.hours_completed / teachingHistory.hours_assigned) * 100
        : 0;

    return (
        <>
            <Head title={`Teaching History - ${teachingHistory.subject?.name || 'Details'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={teachingHistories()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Teaching History Details</CardTitle>
                            {teachingHistory.archived_at && (
                                <Badge variant="secondary">Archived</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {!teachingHistory.archived_at && (
                                <Button variant="outline" size="sm" onClick={handleArchive}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                </Button>
                            )}
                            <Button asChild variant="outline" size="sm">
                                <Link href={teachingHistoriesEdit(teachingHistory.id)}>
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
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                            <p>
                                {teachingHistory.teacher
                                    ? `${teachingHistory.teacher.first_name} ${teachingHistory.teacher.last_name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Subject</p>
                            <p>
                                {teachingHistory.subject
                                    ? `${teachingHistory.subject.code} - ${teachingHistory.subject.name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Semester</p>
                            <p>
                                {teachingHistory.semester
                                    ? `${teachingHistory.semester.name} ${teachingHistory.semester.year}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Hours</p>
                            <div className="flex items-center gap-2">
                                <p>{teachingHistory.hours_completed} / {teachingHistory.hours_assigned} hours</p>
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {Math.round(completionPercentage)}%
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            {getStatusBadge(teachingHistory.status)}
                        </div>

                        {teachingHistory.schedule && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Linked Schedule</p>
                                <p>Schedule ID: {teachingHistory.schedule.id}</p>
                                {teachingHistory.schedule.room && <p>Room: {teachingHistory.schedule.room}</p>}
                                {teachingHistory.schedule.section && <p>Section: {teachingHistory.schedule.section}</p>}
                            </div>
                        )}

                        {teachingHistory.notes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p>{teachingHistory.notes}</p>
                            </div>
                        )}

                        {teachingHistory.archived_at && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Archived At</p>
                                <p>{teachingHistory.archived_at}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{teachingHistory.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{teachingHistory.updated_at}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Teaching History</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this teaching history record for{' '}
                                    <span className="font-medium text-foreground">
                                        {teachingHistory.subject?.name || 'this subject'}
                                    </span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete History'}
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
            { title: 'Teaching Histories', href: teachingHistories() },
            { title: 'View History', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
