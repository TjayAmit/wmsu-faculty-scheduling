import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2, CheckCircle, XCircle, Send, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import {
    index as draftSchedules,
    show as draftSchedulesShow,
    destroy as draftSchedulesDestroy,
    submit as draftSchedulesSubmit,
    approve as draftSchedulesApprove,
    reject as draftSchedulesReject,
} from '@/routes/draft-schedules';
import type { DraftSchedulesIndexProps, DraftSchedule } from '@/types';
import {
    draftScheduleStatusOptions,
    getDraftScheduleStatusVariant,
    getDraftScheduleStatusLabel,
} from '@/types/draftSchedules';
import { DraftScheduleFormModal } from './draft-schedule-form-modal';

export default function Index({
    data,
    filters,
    teachers = [],
    schedules = [],
    isTeacherRole = false,
    currentTeacher = null,
}: DraftSchedulesIndexProps) {
    const [status, setStatus] = useState(filters.status || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Modal state for Create and Edit requests
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DraftSchedule | null>(null);

    const handleOpenCreate = () => {
        setEditingItem(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (item: DraftSchedule) => {
        setEditingItem(item);
        setFormModalOpen(true);
    };

    // Auto-open modal if redirected with ?create=1 or ?edit=ID
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === '1') {
            setEditingItem(null);
            setFormModalOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('create');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        } else if (params.get('edit')) {
            const editId = Number(params.get('edit'));
            const target = data.data.find((item) => item.id === editId);
            if (target) {
                setEditingItem(target);
                setFormModalOpen(true);
            }
            const url = new URL(window.location.href);
            url.searchParams.delete('edit');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
    }, [data.data]);

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
        if (!deleteId) {
return;
}

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
            <Head title="Request Schedule" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full min-w-0">
                {/* 1. Page Header (OUTSIDE table card) */}
                <div className="space-y-1.5 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Schedule Requests
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isTeacherRole
                            ? 'Submit and track your proposed teaching schedules and review approvals.'
                            : 'Submit and monitor term schedule proposals, teaching preferences, and review approvals.'}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                {data.total} total
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                <span>{isTeacherRole ? 'New Request' : 'New Assignment'}</span>
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
                                        onClick={() => router.get(draftSchedulesShow(item.id).url)}
                                        className="border-b border-border transition-colors hover:bg-muted/40 cursor-pointer"
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.teacher?.full_name || item.teacher?.user?.name || `${item.teacher?.first_name ?? ''} ${item.teacher?.last_name ?? ''}`.trim() || 'Unassigned Teacher'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.schedule?.subject?.code ?? 'N/A'} - {item.schedule?.subject?.title ?? 'No Title'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {item.schedule?.semester?.name ?? '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={getDraftScheduleStatusVariant(item.status)} className="text-xs">
                                                {getDraftScheduleStatusLabel(item.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {fmtDate(item.submitted_at)}
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            className="py-3.5 pl-4 pr-6 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                {item.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => handleSubmit(item.id)}
                                                        disabled={processingId === item.id}
                                                        title="Submit for Review"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        <span className="sr-only">Submit for Review</span>
                                                    </Button>
                                                )}

                                                {item.status === 'pending_review' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
                                                            onClick={() => handleApprove(item.id)}
                                                            disabled={processingId === item.id}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="sr-only">Approve</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleReject(item.id)}
                                                            disabled={processingId === item.id}
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="sr-only">Reject</span>
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    onClick={() => handleOpenEdit(item)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => setDeleteId(item.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
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

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                itemName="assignment"
            />

            <DraftScheduleFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                draftSchedule={editingItem}
                teachers={teachers}
                schedules={schedules}
                isTeacherRole={isTeacherRole}
                currentTeacher={currentTeacher}
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
