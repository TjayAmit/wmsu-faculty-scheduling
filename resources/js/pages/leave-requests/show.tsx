import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, CheckCircle, XCircle, Ban, Calendar } from 'lucide-react';
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
import { index as leaveRequests, edit as leaveRequestsEdit, destroy as leaveRequestsDestroy, approve as leaveRequestsApprove, reject as leaveRequestsReject, cancel as leaveRequestsCancel } from '@/routes/leave-requests';
import type { LeaveRequestsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ leaveRequest }: LeaveRequestsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(leaveRequestsDestroy(leaveRequest.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleApprove = () => {
        router.post(leaveRequestsApprove.url(leaveRequest.id));
    };

    const handleReject = () => {
        router.post(leaveRequestsReject.url(leaveRequest.id), { reason: 'Rejected by admin' });
    };

    const handleCancel = () => {
        router.post(leaveRequestsCancel.url(leaveRequest.id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            cancelled: 'outline',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const getLeaveTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            sick: 'Sick Leave',
            vacation: 'Vacation Leave',
            personal: 'Personal Leave',
            emergency: 'Emergency Leave',
            maternity: 'Maternity Leave',
            paternity: 'Paternity Leave',
            other: 'Other',
        };
        return labels[type] || type;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const calculateDays = () => {
        const start = new Date(leaveRequest.start_date);
        const end = new Date(leaveRequest.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <>
            <Head title={`Leave Request - ${leaveRequest.teacher?.first_name || 'Details'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={leaveRequests()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Leave Request Details</CardTitle>
                            {getStatusBadge(leaveRequest.status)}
                        </div>
                        <div className="flex items-center gap-2">
                            {leaveRequest.status === 'pending' && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleApprove}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Approve
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleReject}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                        Reject
                                    </Button>
                                </>
                            )}
                            {leaveRequest.status === 'pending' && (
                                <Button variant="outline" size="sm" onClick={handleCancel}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                            <Button asChild variant="outline" size="sm">
                                <Link href={leaveRequestsEdit(leaveRequest.id)}>
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
                    <CardContent className="space-y-6">
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                            <p>
                                {leaveRequest.teacher
                                    ? `${leaveRequest.teacher.first_name} ${leaveRequest.teacher.last_name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                            <p>{getLeaveTypeLabel(leaveRequest.leave_type)}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(leaveRequest.start_date)}</span>
                                <span className="text-muted-foreground">→</span>
                                <span>{formatDate(leaveRequest.end_date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Reason</p>
                            <p className="whitespace-pre-wrap">{leaveRequest.reason}</p>
                        </div>

                        {leaveRequest.notes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                                <p className="whitespace-pre-wrap">{leaveRequest.notes}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            {getStatusBadge(leaveRequest.status)}
                        </div>

                        {leaveRequest.approved_by && (
                            <>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                                    <p>{leaveRequest.approver?.name || 'Unknown'}</p>
                                </div>

                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                                    <p>{leaveRequest.approved_at ? new Date(leaveRequest.approved_at).toLocaleString('en-US') : '-'}</p>
                                </div>
                            </>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{new Date(leaveRequest.created_at).toLocaleString('en-US')}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{new Date(leaveRequest.updated_at).toLocaleString('en-US')}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Leave Request</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this leave request for{' '}
                                    <span className="font-medium text-foreground">
                                        {leaveRequest.teacher
                                            ? `${leaveRequest.teacher.first_name} ${leaveRequest.teacher.last_name}`
                                            : 'this teacher'}
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
                            {isDeleting ? 'Deleting…' : 'Delete Request'}
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
            { title: 'Leave Requests', href: leaveRequests() },
            { title: 'View Request', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
