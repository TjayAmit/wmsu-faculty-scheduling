import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, CheckCircle, XCircle, Ban } from 'lucide-react';
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
import { index as substituteRequests, edit as substituteRequestsEdit, destroy as substituteRequestsDestroy, approve as substituteRequestsApprove, reject as substituteRequestsReject, cancel as substituteRequestsCancel } from '@/routes/substitute-requests';
import type { SubstituteRequestsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ substituteRequest }: SubstituteRequestsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(substituteRequestsDestroy(substituteRequest.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleApprove = () => {
        router.post(substituteRequestsApprove.url(substituteRequest.id));
    };

    const handleReject = () => {
        router.post(substituteRequestsReject.url(substituteRequest.id), { reason: 'Rejected by admin' });
    };

    const handleCancel = () => {
        router.post(substituteRequestsCancel.url(substituteRequest.id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            cancelled: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isPending = substituteRequest.status === 'pending';

    return (
        <>
            <Head title={`Substitute Request - ${substituteRequest.requesting_teacher?.last_name || 'Details'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={substituteRequests()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>Substitute Request Details</CardTitle>
                            {getStatusBadge(substituteRequest.status)}
                        </div>
                        <div className="flex items-center gap-2">
                            {isPending && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleApprove}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleReject}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCancel}>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </>
                            )}
                            {isPending && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={substituteRequestsEdit(substituteRequest.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
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
                            <p className="text-sm font-medium text-muted-foreground">Date</p>
                            <p>{formatDate(substituteRequest.date)}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Requesting Teacher</p>
                            <p>
                                {substituteRequest.requesting_teacher
                                    ? `${substituteRequest.requesting_teacher.first_name} ${substituteRequest.requesting_teacher.last_name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Substitute Teacher</p>
                            <p>
                                {substituteRequest.substitute_teacher
                                    ? `${substituteRequest.substitute_teacher.first_name} ${substituteRequest.substitute_teacher.last_name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        {substituteRequest.schedule && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Linked Schedule</p>
                                <p>Schedule ID: {substituteRequest.schedule.id}</p>
                                {substituteRequest.schedule.room && <p>Room: {substituteRequest.schedule.room}</p>}
                                {substituteRequest.schedule.section && <p>Section: {substituteRequest.schedule.section}</p>}
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Reason</p>
                            <p>{substituteRequest.reason}</p>
                        </div>

                        {substituteRequest.notes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p>{substituteRequest.notes}</p>
                            </div>
                        )}

                        {substituteRequest.approver && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                                <p>{substituteRequest.approver.name}</p>
                                {substituteRequest.approved_at && (
                                    <p className="text-sm text-muted-foreground">
                                        on {formatDate(substituteRequest.approved_at)}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{substituteRequest.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{substituteRequest.updated_at}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Substitute Request</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this substitute request from{' '}
                                    <span className="font-medium text-foreground">
                                        {substituteRequest.requesting_teacher?.first_name} {substituteRequest.requesting_teacher?.last_name}
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
            { title: 'Substitute Requests', href: substituteRequests() },
            { title: 'View Request', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
