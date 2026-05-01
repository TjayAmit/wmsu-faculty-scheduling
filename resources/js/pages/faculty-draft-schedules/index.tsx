import { Head, router } from '@inertiajs/react';
import { Eye, CheckCircle, XCircle, Send, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TablePagination } from '@/components/table-pagination';
import {
    index as facultyDraftSchedules,
    show as facultyDraftSchedulesShow,
    approve as facultyDraftSchedulesApprove,
    reject as facultyDraftSchedulesReject,
} from '@/routes/faculty-draft-schedules';
import {
    facultyDraftScheduleStatusOptions,
    getFacultyDraftScheduleStatusVariant,
    getFacultyDraftScheduleStatusLabel,
} from '@/types/facultyDraftSchedules';
import type { FacultyDraftSchedulesIndexProps, FacultyDraftSchedule } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters }: FacultyDraftSchedulesIndexProps) {
    const [status, setStatus] = useState(filters.status || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [rejectId, setRejectId] = useState<number | null>(null);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            facultyDraftSchedules(),
            { status: status === '_all' ? '' : status, per_page: perPage, ...params },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ status: value === '_all' ? '' : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleApprove = (id: number) => {
        setProcessingId(id);
        router.post(facultyDraftSchedulesApprove(id).url, {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const openRejectDialog = (id: number) => {
        setRejectId(id);
        setRejectComments('');
        setShowRejectDialog(true);
    };

    const handleReject = () => {
        if (!rejectId) return;
        setProcessingId(rejectId);
        router.post(facultyDraftSchedulesReject(rejectId).url, { comments: rejectComments }, {
            onFinish: () => {
                setProcessingId(null);
                setShowRejectDialog(false);
                setRejectId(null);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Draft Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <h1 className="text-xl font-semibold">Draft Schedules</h1>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {data.total} total
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all">All statuses</SelectItem>
                                    {facultyDraftScheduleStatusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Teacher</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Schedule</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Semester</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Submitted</TableHead>
                                <TableHead className="h-11 py-0 pl-4 pr-6 text-right text-sm font-medium text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No draft schedules found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((item: FacultyDraftSchedule) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-border transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.teacher.user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.schedule.subject.code} - {item.schedule.subject.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {item.schedule.semester.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={getFacultyDraftScheduleStatusVariant(item.status)} className="text-xs">
                                                {getFacultyDraftScheduleStatusLabel(item.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {item.submitted_at ? formatDate(item.submitted_at) : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3.5 pl-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button asChild variant="ghost" size="sm">
                                                    <a href={facultyDraftSchedulesShow(item.id).url}>
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </a>
                                                </Button>
                                                {item.status === 'pending_review' && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleApprove(item.id)}
                                                            disabled={processingId === item.id}
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openRejectDialog(item.id)}
                                                            disabled={processingId === item.id}
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        meta={data}
                        perPage={perPage}
                        onPageChange={(page) => navigate({ page })}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
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
                        <Button variant="outline" size="sm" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={processingId !== null || !rejectComments.trim()}
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

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Draft Schedules', href: facultyDraftSchedules() },
        ]}
    >
        {page}
    </AppLayout>
);
