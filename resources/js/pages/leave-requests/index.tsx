import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, Calendar, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import {
    index as leaveRequests,
    create as leaveRequestsCreate,
    show as leaveRequestsShow,
    edit as leaveRequestsEdit,
    destroy as leaveRequestsDestroy,
    approve as leaveRequestsApprove,
    reject as leaveRequestsReject,
    cancel as leaveRequestsCancel,
} from '@/routes/leave-requests';
import type { LeaveRequestsIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, teachers }: LeaveRequestsIndexProps) {
    const [status, setStatus] = useState(filters.status || 'all');
    const [teacherId, setTeacherId] = useState(filters.teacher_id?.toString() || 'all');
    const [leaveType, setLeaveType] = useState(filters.leave_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            leaveRequests(),
            {
                status: status === 'all' ? '' : status,
                teacher_id: teacherId === 'all' ? '' : teacherId,
                leave_type: leaveType === 'all' ? '' : leaveType,
                date_from: dateFrom,
                date_to: dateTo,
                per_page: perPage,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleFilterChange = () => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate({ page: 1 });
        }, 350);
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(leaveRequestsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleApprove = (id: number) => {
        router.post(leaveRequestsApprove.url(id));
    };

    const handleReject = (id: number) => {
        router.post(leaveRequestsReject.url(id), { reason: 'Rejected by admin' });
    };

    const handleCancel = (id: number) => {
        router.post(leaveRequestsCancel.url(id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
            pending: { variant: 'secondary', icon: Clock },
            approved: { variant: 'default', icon: CheckCircle },
            rejected: { variant: 'destructive', icon: XCircle },
            cancelled: { variant: 'outline', icon: Ban },
        };
        const config = variants[status] || { variant: 'default', icon: Clock };
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Leave Requests" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Leave Requests"
                        count={data.total}
                        search=""
                        searchPlaceholder="Search leave requests..."
                        onSearchChange={() => {}}
                        createHref={leaveRequestsCreate().url}
                        createLabel="New Request"
                    />

                    {/* Filters */}
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status_filter" className="text-xs">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="status_filter" className="w-[140px]">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_filter" className="text-xs">Teacher</Label>
                                <Select
                                    value={teacherId}
                                    onValueChange={(value) => {
                                        setTeacherId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="teacher_filter" className="w-[180px]">
                                        <SelectValue placeholder="All teachers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All teachers</SelectItem>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="leave_type_filter" className="text-xs">Leave Type</Label>
                                <Select
                                    value={leaveType}
                                    onValueChange={(value) => {
                                        setLeaveType(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="leave_type_filter" className="w-[160px]">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="sick">Sick Leave</SelectItem>
                                        <SelectItem value="vacation">Vacation Leave</SelectItem>
                                        <SelectItem value="personal">Personal Leave</SelectItem>
                                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatus('all');
                                    setTeacherId('all');
                                    setLeaveType('all');
                                    setDateFrom('');
                                    setDateTo('');
                                    setTimeout(() => navigate({ status: '', teacher_id: '', leave_type: '', date_from: '', date_to: '', page: 1 }), 0);
                                }}
                            >
                                Clear filters
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Teacher
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Leave Type
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Duration
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Days
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Approved By
                                </TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <Calendar className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No leave requests found</p>
                                                <p className="mt-0.5 text-sm">
                                                    Try adjusting your filters or{' '}
                                                    <button
                                                        onClick={() => {
                                                            setStatus('all');
                                                            setTeacherId('all');
                                                            setLeaveType('all');
                                                            navigate({ status: '', teacher_id: '', leave_type: '', page: 1 });
                                                        }}
                                                        className="text-primary hover:underline"
                                                    >
                                                        clear all filters
                                                    </button>
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(leaveRequestsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.teacher
                                                    ? `${item.teacher.first_name} ${item.teacher.last_name}`
                                                    : '-'}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {getLeaveTypeLabel(item.leave_type)}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{formatDate(item.start_date)}</span>
                                                <span className="text-xs text-muted-foreground/60">to {formatDate(item.end_date)}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.leave_days || 1} {item.leave_days === 1 ? 'day' : 'days'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            {getStatusBadge(item.status)}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.approver?.name || (item.status === 'approved' ? 'System' : '-')}
                                        </TableCell>

                                        <TableCell
                                            className="py-3.5 pl-4 pr-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.get(leaveRequestsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(leaveRequestsEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleApprove(item.id)}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleReject(item.id)}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {item.status === 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleCancel(item.id)}>
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )))
                            }
                        </TableBody>
                    </Table>

                    <TablePagination
                        meta={{
                            total: data.total,
                            from: data.from,
                            to: data.to,
                            current_page: data.current_page,
                            last_page: data.last_page,
                        }}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Leave Request"
                itemName={data.data.find((lr) => lr.id === deleteId)?.teacher?.first_name + ' ' + data.data.find((lr) => lr.id === deleteId)?.teacher?.last_name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Leave Requests', href: leaveRequests() }]}>
        {page}
    </AppLayout>
);
