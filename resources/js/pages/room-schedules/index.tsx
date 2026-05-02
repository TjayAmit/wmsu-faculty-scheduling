import { Head, Link, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, CalendarDays, Filter } from 'lucide-react';
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
    index as roomSchedules,
    create as roomSchedulesCreate,
    show as roomSchedulesShow,
    edit as roomSchedulesEdit,
    destroy as roomSchedulesDestroy,
    calendar as roomSchedulesCalendar,
} from '@/routes/room-schedules';
import type { RoomSchedulesIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, classrooms }: RoomSchedulesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [classroomId, setClassroomId] = useState(filters.classroom_id?.toString() || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            roomSchedules(),
            {
                search,
                per_page: perPage,
                classroom_id: classroomId,
                date_from: dateFrom,
                date_to: dateTo,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate({ search: value, page: 1 });
        }, 350);
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
        router.delete(roomSchedulesDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
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
            <Head title="Room Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <TablePageHeader
                            title="Room Schedules"
                            count={data.total}
                            search={search}
                            searchPlaceholder="Search by building or room..."
                            onSearchChange={handleSearchChange}
                            createHref={roomSchedulesCreate().url}
                            createLabel="New Schedule"
                        />
                        <Button variant="outline" size="sm" asChild>
                            <Link href={roomSchedulesCalendar.url()}>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Calendar View
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="classroom_filter" className="text-xs">Classroom</Label>
                                <Select
                                    value={classroomId}
                                    onValueChange={(value) => {
                                        setClassroomId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="classroom_filter" className="w-[200px]">
                                        <SelectValue placeholder="All classrooms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.building} - {room.room_number}
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
                                    setClassroomId('');
                                    setDateFrom('');
                                    setDateTo('');
                                    setTimeout(() => navigate({ classroom_id: '', date_from: '', date_to: '', page: 1 }), 0);
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
                                    Time
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Classroom
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Schedule
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
                                                <CalendarDays className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No room schedules found</p>
                                                {search && (
                                                    <p className="mt-0.5 text-sm">
                                                        Try a different search or{' '}
                                                        <button
                                                            onClick={() => handleSearchChange('')}
                                                            className="text-primary hover:underline"
                                                        >
                                                            clear the filter
                                                        </button>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(roomSchedulesShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {formatDate(item.date)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.start_time} - {item.end_time}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.classroom
                                                ? `${item.classroom.building} - ${item.classroom.room_number}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.schedule?.subject?.code || item.schedule?.section || '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
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
                                                    <DropdownMenuItem onClick={() => router.get(roomSchedulesShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(roomSchedulesEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
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
                                ))
                            )}
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
                title="Delete Room Schedule"
                itemName={data.data.find((rs) => rs.id === deleteId)?.classroom?.room_number}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Room Schedules', href: roomSchedules() }]}>
        {page}
    </AppLayout>
);
