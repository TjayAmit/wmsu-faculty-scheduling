import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';
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
import { router } from '@inertiajs/react';
import {
    index as draftSchedules,
    edit as draftSchedulesEdit,
    destroy as draftSchedulesDestroy,
    submit as draftSchedulesSubmit,
    approve as draftSchedulesApprove,
    reject as draftSchedulesReject,
} from '@/routes/draft-schedules';
import {
    getDraftScheduleStatusVariant,
    getDraftScheduleStatusLabel,
} from '@/types/draftSchedules';
import type { DraftSchedulesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Show({ draftSchedule }: DraftSchedulesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = () => {
        setIsProcessing(true);
        router.delete(draftSchedulesDestroy(draftSchedule.id), {
            onFinish: () => {
                setIsProcessing(false);
                setShowDelete(false);
            },
        });
    };

    const handleSubmit = () => {
        setIsProcessing(true);
        router.post(draftSchedulesSubmit(draftSchedule.id).url, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(draftSchedulesApprove(draftSchedule.id).url, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleReject = () => {
        setIsProcessing(true);
        router.post(draftSchedulesReject(draftSchedule.id).url, { comments: rejectComments }, {
            onFinish: () => {
                setIsProcessing(false);
                setShowReject(false);
            },
        });
    };

    return (
        <>
            <Head title={`Assignment - ${draftSchedule.schedule.subject.code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={draftSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Schedule Assignment</CardTitle>
                            <Badge variant={getDraftScheduleStatusVariant(draftSchedule.status)}>
                                {getDraftScheduleStatusLabel(draftSchedule.status)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {draftSchedule.status === 'draft' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit for Review
                                </Button>
                            )}
                            {draftSchedule.status === 'pending_review' && (
                                <>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowReject(true)}
                                        disabled={isProcessing}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                            <Button asChild variant="outline" size="sm">
                                <Link href={draftSchedulesEdit(draftSchedule.id)}>
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
                                <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                                <p>{draftSchedule.teacher.user.name}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge variant={getDraftScheduleStatusVariant(draftSchedule.status)} className="w-fit">
                                    {getDraftScheduleStatusLabel(draftSchedule.status)}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                            <p>
                                {draftSchedule.schedule.subject.code} - {draftSchedule.schedule.subject.title}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Semester</p>
                            <p>{draftSchedule.schedule.semester.name} ({draftSchedule.schedule.semester.academic_year})</p>
                        </div>

                        {draftSchedule.notes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="whitespace-pre-wrap">{draftSchedule.notes}</p>
                            </div>
                        )}

                        {draftSchedule.submitted_at && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                                <p>{new Date(draftSchedule.submitted_at).toLocaleString()}</p>
                            </div>
                        )}

                        {draftSchedule.reviewed_at && (
                            <>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Reviewed By</p>
                                    <p>{draftSchedule.reviewer?.name || 'Unknown'}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Reviewed At</p>
                                    <p>{new Date(draftSchedule.reviewed_at).toLocaleString()}</p>
                                </div>
                            </>
                        )}

                        {draftSchedule.review_comments && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Review Comments</p>
                                <p className="whitespace-pre-wrap">{draftSchedule.review_comments}</p>
                            </div>
                        )}

                        {draftSchedule.teacher_assignment && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Teacher Assignment</p>
                                <Badge variant={draftSchedule.teacher_assignment.is_active ? 'default' : 'secondary'} className="w-fit">
                                    {draftSchedule.teacher_assignment.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p>{new Date(draftSchedule.created_at).toLocaleString()}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p>{new Date(draftSchedule.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Assignment</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this schedule assignment? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isProcessing}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Reject Assignment</DialogTitle>
                        <DialogDescription>
                            Please provide comments explaining why this assignment is being rejected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={4}
                            placeholder="Enter rejection comments..."
                            value={rejectComments}
                            onChange={(e) => setRejectComments(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowReject(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleReject} disabled={isProcessing}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
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
            { title: 'Assign Schedule', href: draftSchedules() },
            { title: 'View Assignment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
