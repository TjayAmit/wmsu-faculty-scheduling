import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, BookOpen, Archive } from 'lucide-react';
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
    index as teachingHistories,
    create as teachingHistoriesCreate,
    show as teachingHistoriesShow,
    edit as teachingHistoriesEdit,
    destroy as teachingHistoriesDestroy,
    archive as teachingHistoriesArchive,
} from '@/routes/teaching-histories';
import type { TeachingHistoriesIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, teachers, semesters }: TeachingHistoriesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [teacherId, setTeacherId] = useState(filters.teacher_id?.toString() || '');
    const [semesterId, setSemesterId] = useState(filters.semester_id?.toString() || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            teachingHistories(),
            {
                search,
                per_page: perPage,
                teacher_id: teacherId,
                semester_id: semesterId,
                status,
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
        router.delete(teachingHistoriesDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleArchive = (id: number) => {
        router.post(teachingHistoriesArchive.url(id));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            completed: 'default',
            incomplete: 'secondary',
            dropped: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <>
            <Head title="Teaching Histories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Teaching Histories"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search by teacher or subject..."
                        onSearchChange={handleSearchChange}
                        createHref={teachingHistoriesCreate().url}
                        createLabel="New History"
                    />

                    {/* Filters */}
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex flex-wrap items-end gap-4">
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
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="semester_filter" className="text-xs">Semester</Label>
                                <Select
                                    value={semesterId}
                                    onValueChange={(value) => {
                                        setSemesterId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="semester_filter" className="w-[160px]">
                                        <SelectValue placeholder="All semesters" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((semester) => (
                                            <SelectItem key={semester.id} value={semester.id.toString()}>
                                                {semester.name} {semester.year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="incomplete">Incomplete</SelectItem>
                                        <SelectItem value="dropped">Dropped</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTeacherId('');
                                    setSemesterId('');
                                    setStatus('');
                                    setTimeout(() => navigate({ teacher_id: '', semester_id: '', status: '', page: 1 }), 0);
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
                                    Subject
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Hours
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Progress
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
                                                <BookOpen className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No teaching histories found</p>
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
                                        onClick={() => router.get(teachingHistoriesShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.teacher
                                                    ? `${item.teacher.first_name} ${item.teacher.last_name}`
                                                    : '-'}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.subject
                                                ? `${item.subject.code} - ${item.subject.name}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.semester
                                                ? `${item.semester.name} ${item.semester.year}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.hours_completed}/{item.hours_assigned} hrs
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${item.completion_percentage || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round(item.completion_percentage || 0)}%
                                                </span>
                                            </div>
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
                                                    <DropdownMenuItem onClick={() => router.get(teachingHistoriesShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(teachingHistoriesEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {!item.archived_at && (
                                                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
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
                title="Delete Teaching History"
                itemName={data.data.find((th) => th.id === deleteId)?.subject?.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Teaching Histories', href: teachingHistories() }]}>
        {page}
    </AppLayout>
);
