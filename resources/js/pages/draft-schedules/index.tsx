import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, FileText, CheckCircle, XCircle, Send } from 'lucide-react';
import { useRef, useState } from 'react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import {
    index as draftSchedules,
    create as draftSchedulesCreate,
    show as draftSchedulesShow,
    edit as draftSchedulesEdit,
    destroy as draftSchedulesDestroy,
    submit as draftSchedulesSubmit,
    approve as draftSchedulesApprove,
    reject as draftSchedulesReject,
} from '@/routes/draft-schedules';
import {
    draftScheduleStatusOptions,
    getDraftScheduleStatusVariant,
    getDraftScheduleStatusLabel,
} from '@/types/draftSchedules';
import type { DraftSchedulesIndexProps, DraftSchedule } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters }: DraftSchedulesIndexProps) {
    const [status, setStatus] = useState(filters.status || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            draftSchedules(),
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

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(draftSchedulesDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleSubmit = (id: number) => {
        setProcessingId(id);
        router.post(draftSchedulesSubmit(id).url, {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const handleApprove = (id: number) => {
        setProcessingId(id);
        router.post(draftSchedulesApprove(id).url, {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const handleReject = (id: number) => {
        setProcessingId(id);
        router.post(draftSchedulesReject(id).url, { comments: '' }, {
            onFinish: () => setProcessingId(null),
        });
    };

    return (
        <>
            <Head title="Assign Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold">Assign Schedule</h1>
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
                                    {draftScheduleStatusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button asChild size="sm">
                                <a href={draftSchedulesCreate().url}>
                                    New Assignment
                                </a>
                            </Button>
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
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No assignments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item: DraftSchedule) => (
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
                                            <Badge variant={getDraftScheduleStatusVariant(item.status)} className="text-xs">
                                                {getDraftScheduleStatusLabel(item.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3.5 pl-4 pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={processingId === item.id}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <a href={draftSchedulesShow(item.id).url}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={draftSchedulesEdit(item.id).url}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {item.status === 'draft' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleSubmit(item.id)}
                                                            disabled={processingId === item.id}
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Submit for Review
                                                        </DropdownMenuItem>
                                                    )}
                                                    {item.status === 'pending_review' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(item.id)}
                                                                disabled={processingId === item.id}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleReject(item.id)}
                                                                disabled={processingId === item.id}
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                itemName="assignment"
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Assign Schedule', href: draftSchedules() },
        ]}
    >
        {page}
    </AppLayout>
);
