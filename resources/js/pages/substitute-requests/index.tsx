import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, Users, CheckCircle, XCircle, Ban, Clock } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    index as substituteRequests,
    create as substituteRequestsCreate,
    show as substituteRequestsShow,
    edit as substituteRequestsEdit,
    destroy as substituteRequestsDestroy,
    approve as substituteRequestsApprove,
    reject as substituteRequestsReject,
    cancel as substituteRequestsCancel,
} from '@/routes/substitute-requests';
import type { SubstituteRequestsIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, teachers }: SubstituteRequestsIndexProps) {
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [status, setStatus] = useState(filters.status || '');
    const [requestingTeacherId, setRequestingTeacherId] = useState(filters.requesting_teacher_id?.toString() || '');
    const [substituteTeacherId, setSubstituteTeacherId] = useState(filters.substitute_teacher_id?.toString() || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            substituteRequests(),
            {
                per_page: perPage,
                status,
                requesting_teacher_id: requestingTeacherId,
                substitute_teacher_id: substituteTeacherId,
                date_from: dateFrom,
                date_to: dateTo,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleFilterChange = () => {
        navigate({ page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(substituteRequestsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleApprove = (id: number) => {
        router.post(substituteRequestsApprove.url(id));
    };

    const handleReject = (id: number) => {
        router.post(substituteRequestsReject.url(id), { reason: 'Rejected by admin' });
    };

    const handleCancel = (id: number) => {
        router.post(substituteRequestsCancel.url(id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            cancelled: 'outline',
        };
        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="mr-1 h-3 w-3" />,
            approved: <CheckCircle className="mr-1 h-3 w-3" />,
            rejected: <XCircle className="mr-1 h-3 w-3" />,
            cancelled: <Ban className="mr-1 h-3 w-3" />,
        };
        return (
            <Badge variant={variants[status] || 'secondary'} className="flex items-center">
                {icons[status]}
                {status}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title="Substitute Requests" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Substitute Requests"
                        count={data.total}
                        search={''}
                        searchPlaceholder=""
                        onSearchChange={() => {}}
                        createHref={substituteRequestsCreate().url}
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requesting_teacher_filter" className="text-xs">Requesting Teacher</Label>
                                <Select
                                    value={requestingTeacherId}
                                    onValueChange={(value) => {
                                        setRequestingTeacherId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="requesting_teacher_filter" className="w-[180px]">
                                        <SelectValue placeholder="All teachers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="substitute_teacher_filter" className="text-xs">Substitute Teacher</Label>
                                <Select
                                    value={substituteTeacherId}
                                    onValueChange={(value) => {
                                        setSubstituteTeacherId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="substitute_teacher_filter" className="w-[180px]">
                                        <SelectValue placeholder="All substitutes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from" className="text-xs">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => {
                                        setDateFrom(e.target.value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                    className="w-[160px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to" className="text-xs">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => {
                                        setDateTo(e.target.value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                    className="w-[160px]"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatus('');
                                    setRequestingTeacherId('');
                                    setSubstituteTeacherId('');
                                    setDateFrom('');
                                    setDateTo('');
                                    setTimeout(() => navigate({ status: '', requesting_teacher_id: '', substitute_teacher_id: '', date_from: '', date_to: '', page: 1 }), 0);
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
                                    Date
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Requesting Teacher
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Substitute Teacher
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Reason
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <Users className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No substitute requests found</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(substituteRequestsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {formatDate(item.date)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.requesting_teacher
                                                ? `${item.requesting_teacher.first_name} ${item.requesting_teacher.last_name}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.substitute_teacher
                                                ? `${item.substitute_teacher.first_name} ${item.substitute_teacher.last_name}`
                                                : 'Not assigned'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground max-w-xs truncate">
                                            {item.reason}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            {getStatusBadge(item.status)}
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
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => router.get(substituteRequestsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => router.get(substituteRequestsEdit(item.id))}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleApprove(item.id)}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleReject(item.id)}>
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleCancel(item.id)}>
                                                                <Ban className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
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
                title="Delete Substitute Request"
                itemName={data.data.find((sr) => sr.id === deleteId)?.requesting_teacher?.last_name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Substitute Requests', href: substituteRequests() }]}>
        {page}
    </AppLayout>
);
