import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, BookOpen, CheckCircle, Calendar, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import {
    index as assignSchedules,
    destroy as assignSchedulesDestroy,
} from '@/routes/assign-schedules';
import type { AssignSchedulesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function Show({ assignment }: AssignSchedulesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(assignSchedulesDestroy(assignment.id).url, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title={`Assignment - ${assignment.schedule.subject.code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={assignSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Assignments
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDelete(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Remove Assignment
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Schedule Assignment</CardTitle>
                            <Badge variant="default">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approved & Generated
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                                    <p className="font-medium">{assignment.teacher.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{assignment.teacher.user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                                    <p className="font-medium">
                                        {assignment.schedule.subject.code} - {assignment.schedule.subject.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Semester</p>
                            <p>{assignment.schedule.semester.name} ({assignment.schedule.semester.academic_year})</p>
                        </div>

                        {assignment.notes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="whitespace-pre-wrap">{assignment.notes}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Review Comments</p>
                            <p className="text-sm">{assignment.review_comments}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Assigned By</p>
                                <p className="text-sm">{assignment.reviewer?.name || 'Unknown'}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Assigned At</p>
                                <p className="text-sm">{formatDate(assignment.reviewed_at)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p className="text-sm">{new Date(assignment.created_at).toLocaleString()}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p className="text-sm">{new Date(assignment.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Remove Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this schedule assignment? This will delete the associated teacher schedules.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Removing...' : 'Remove'}
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
            { title: 'Assign Schedules', href: assignSchedules() },
            { title: 'View Assignment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
