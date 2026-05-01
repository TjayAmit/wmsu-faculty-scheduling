import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Send } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import {
    index as facultyDraftSchedules,
    approve as facultyDraftSchedulesApprove,
    reject as facultyDraftSchedulesReject,
} from '@/routes/faculty-draft-schedules';
import {
    getFacultyDraftScheduleStatusVariant,
    getFacultyDraftScheduleStatusLabel,
} from '@/types/facultyDraftSchedules';
import type { FacultyDraftSchedulesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Show({ draftSchedule }: FacultyDraftSchedulesShowProps) {
    const [showReject, setShowReject] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(facultyDraftSchedulesApprove(draftSchedule.id).url, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleReject = () => {
        setIsProcessing(true);
        router.post(facultyDraftSchedulesReject(draftSchedule.id).url, { comments: rejectComments }, {
            onFinish: () => {
                setIsProcessing(false);
                setShowReject(false);
            },
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
            <Head title={`Draft Schedule - ${draftSchedule.schedule.subject.code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={facultyDraftSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Draft Schedules
                        </Link>
                    </Button>
                    {draftSchedule.status === 'pending_review' && (
                        <div className="flex items-center gap-2">
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
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Schedule Request</CardTitle>
                            <Badge variant={getFacultyDraftScheduleStatusVariant(draftSchedule.status)}>
                                {getFacultyDraftScheduleStatusLabel(draftSchedule.status)}
                            </Badge>
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
                                <Badge variant={getFacultyDraftScheduleStatusVariant(draftSchedule.status)} className="w-fit">
                                    {getFacultyDraftScheduleStatusLabel(draftSchedule.status)}
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
                                <p className="text-sm font-medium text-muted-foreground">Notes from Teacher</p>
                                <p className="whitespace-pre-wrap">{draftSchedule.notes}</p>
                            </div>
                        )}

                        {draftSchedule.submitted_at && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                                <p>{formatDate(draftSchedule.submitted_at)}</p>
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
                                    <p>{formatDate(draftSchedule.reviewed_at)}</p>
                                </div>
                            </>
                        )}

                        {draftSchedule.review_comments && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Review Comments</p>
                                <p className="whitespace-pre-wrap">{draftSchedule.review_comments}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p className="text-sm">{new Date(draftSchedule.created_at).toLocaleString()}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p className="text-sm">{new Date(draftSchedule.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reject Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Reject Draft Schedule</DialogTitle>
                        <DialogDescription>
                            Please provide comments explaining why this draft schedule is being rejected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter rejection comments..."
                            value={rejectComments}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectComments(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowReject(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={isProcessing || !rejectComments.trim()}
                        >
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
            { title: 'Draft Schedules', href: facultyDraftSchedules() },
            { title: 'View Request', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
