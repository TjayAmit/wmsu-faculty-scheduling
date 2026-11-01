import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, DoorOpen, Fingerprint, CheckCircle2, Users, CalendarDays, Plus, Clock, AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    index as classrooms,
    create as classroomsCreate,
    show as classroomsShow,
    edit as classroomsEdit,
    destroy as classroomsDestroy,
} from '@/routes/classrooms';
import type { ClassroomsIndexProps } from '@/types';

export default function Index({ data, filters, stats }: ClassroomsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            classrooms(),
            { search, per_page: perPage, ...params },
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

    const handleDelete = () => {
        if (!deleteId) {
return;
}

        setIsDeleting(true);
        router.delete(classroomsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Classrooms" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (OUTSIDE table card) */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Classrooms
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage academic rooms, lecture halls, computer laboratories, and seating capacities.
                    </p>
                </div>

                {/* 2. Summary KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Rooms
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <DoorOpen className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Across {stats.total_buildings} {stats.total_buildings === 1 ? 'building' : 'buildings'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Active Rooms
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.active}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.inactive} inactive / maintenance
                            </p>
                        </div>

                        {/* Room Schedule Load & 7am-7pm Operating Window */}
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Schedule Load (7am-7pm)
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight text-foreground">
                                    {stats.avg_utilization ?? 0}%
                                </span>
                                <span className="text-xs text-muted-foreground">Avg Load</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs">
                                <span className={(stats.full_rooms ?? 0) > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                                    {stats.full_rooms ?? 0} full of schedule
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {stats.available_rooms ?? stats.active} open
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Capacity
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Users className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight text-foreground">
                                    {stats.total_capacity.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">Seats</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Avg {stats.avg_capacity} seats per room
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-purple-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Biometric Terminals
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Fingerprint className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.with_device}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.without_device} without device assigned
                            </p>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search classrooms…"
                        onSearchChange={handleSearchChange}
                        createHref={classroomsCreate().url}
                        createLabel="New Classroom"
                    />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Room
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Name
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Type
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Capacity
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Schedule Availability (7am-7pm)
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    ZKTeco Device (1:1)
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
                                    <TableCell colSpan={8} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <DoorOpen className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No classrooms found</p>
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
                                        onClick={() => router.get(classroomsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.full_identifier || `${item.building} ${item.room_number}`}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.room_name || '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant="secondary">
                                                {item.room_type_label || item.room_type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.capacity}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            {item.availability ? (
                                                <div className="space-y-1.5 min-w-[170px]">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                item.availability.is_full
                                                                    ? 'border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-semibold gap-1'
                                                                    : item.availability.status === 'busy'
                                                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold'
                                                                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold'
                                                            }
                                                        >
                                                            {item.availability.is_full ? (
                                                                <>
                                                                    <AlertTriangle className="size-3" />
                                                                    Full of Schedule
                                                                </>
                                                            ) : item.availability.status === 'busy' ? (
                                                                'Busy'
                                                            ) : (
                                                                'Available'
                                                            )}
                                                        </Badge>
                                                        <span className="font-mono text-[11px] font-semibold text-foreground">
                                                            {item.availability.weekly_available_hours}h free
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full transition-all ${
                                                                item.availability.is_full
                                                                    ? 'bg-destructive'
                                                                    : item.availability.status === 'busy'
                                                                      ? 'bg-amber-500'
                                                                      : 'bg-emerald-500'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(100, Math.max(item.availability.weekly_booked_hours > 0 ? 5 : 0, item.availability.weekly_utilization_rate))}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <span>{item.availability.weekly_booked_hours}h booked / week</span>
                                                        <span>{item.availability.weekly_utilization_rate}%</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">7 AM - 7 PM</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            {(item as { zkteco_device?: { id: number; device_name: string; ip_address: string } | null }).zkteco_device ? (
                                                <Badge variant="outline" className="gap-1.5 font-medium">
                                                    <Fingerprint className="h-3 w-3 text-primary" />
                                                    {(item as { zkteco_device?: { device_name: string } }).zkteco_device?.device_name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No device bound</span>
                                            )}
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
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.get(classroomsShow(item.id))}>
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                        View Schedules
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(`/room-schedules/create?classroom_id=${item.id}`)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Book Room Schedule
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(classroomsEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Classroom
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
                title="Delete Classroom"
                itemName={data.data.find((c) => c.id === deleteId)?.full_identifier || data.data.find((c) => c.id === deleteId)?.room_number}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Classrooms', href: classrooms() }]}>
        {page}
    </AppLayout>
);
