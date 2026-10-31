import { Head, router } from '@inertiajs/react';
import { CalendarDays, Clock, Eye, MapPin, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
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
    index as schedules,
    create as schedulesCreate,
    show as schedulesShow,
    edit as schedulesEdit,
    destroy as schedulesDestroy,
} from '@/routes/schedules';
import type { SchedulesIndexProps } from '@/types';

const dayLabels: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
};

export default function Index({ data, filters }: SchedulesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            schedules(),
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
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(schedulesDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Schedules" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (OUTSIDE table card) */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Schedules
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage course timetables, period allocations, classroom assignments, and section schedules.
                    </p>
                </div>

                {/* 2. Table Card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search by subject code, title, room, or section…"
                        onSearchChange={handleSearchChange}
                        createHref={schedulesCreate().url}
                        createLabel="New Schedule"
                    />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Subject
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Days & Timetable
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Room & Section
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Assigned Faculty
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
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <CalendarDays className="h-6 w-6 opacity-40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No schedules found</p>
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
                                data.data.map((item) => {
                                    const teacher = item.teacher_assignment?.teacher?.user;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                            onClick={() => router.get(schedulesShow(item.id))}
                                        >
                                            <TableCell className="py-3.5 pl-6 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.subject?.code || '—'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                        {item.subject?.title || '—'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5 px-4">
                                                {item.time_slots && item.time_slots.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5 items-center">
                                                        {item.time_slots.map((slot, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="outline"
                                                                className="text-xs font-normal bg-muted/30 text-foreground"
                                                            >
                                                                {dayLabels[slot.day] || slot.day}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">TBA</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-3.5 px-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                                                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{item.room || 'TBA'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Users className="size-3 text-muted-foreground shrink-0" />
                                                        <span>Sec: {item.section || '—'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-foreground">
                                                        {item.semester?.name || '—'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.semester?.academic_year || ''}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5 px-4">
                                                {item.teacher_assignment && teacher ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {teacher.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {teacher.email}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs text-muted-foreground font-normal">
                                                        Unassigned
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-3.5 px-4">
                                                {item.is_active ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-xs font-normal">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell
                                                className="py-3.5 pl-4 pr-6 text-right"
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
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem
                                                            onClick={() => router.get(schedulesShow(item.id))}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.get(schedulesEdit(item.id))}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit schedule
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteId(item.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete schedule
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Schedule"
                description="Are you sure you want to delete this schedule? This action cannot be undone and will remove all associated teacher assignments."
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Schedules', href: schedules() }]}>
        {page}
    </AppLayout>
);
