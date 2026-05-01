import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, CalendarDays } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import {
    index as schedules,
    create as schedulesCreate,
    show as schedulesShow,
    edit as schedulesEdit,
    destroy as schedulesDestroy,
} from '@/routes/schedules';
import type { SchedulesIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

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

    const getAssignmentStatus = (schedule: (typeof data.data)[0]) => {
        if (schedule.teacher_assignment && schedule.teacher_assignment.is_active) {
            return { label: 'Assigned', variant: 'default' as const };
        }
        return { label: 'Unassigned', variant: 'secondary' as const };
    };

    return (
        <>
            <Head title="Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Schedules"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search schedules…"
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
                                    Day & Time
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Room
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Section
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Teacher
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
                                                <CalendarDays className="h-5 w-5 opacity-50" />
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
                                    const assignmentStatus = getAssignmentStatus(item);
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                            onClick={() => router.get(schedulesShow(item.id))}
                                        >
                                            <TableCell className="py-3.5 pl-6 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.subject.code}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.subject.title}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {dayLabels[item.day_of_week]}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.time_slot.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.room}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.section}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.semester.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground/70">
                                                        {item.semester.academic_year}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                {item.teacher_assignment ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.teacher_assignment.teacher.user.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground/50 italic">
                                                        Not assigned
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <Badge variant={assignmentStatus.variant} className="text-xs">
                                                        {assignmentStatus.label}
                                                    </Badge>
                                                </div>
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
                                                        <DropdownMenuItem onClick={() => router.get(schedulesShow(item.id))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.get(schedulesEdit(item.id))}>
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
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Schedule"
                itemName={data.data.find((s) => s.id === deleteId)?.subject.title}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Schedules', href: schedules() }]}>
        {page}
    </AppLayout>
);
