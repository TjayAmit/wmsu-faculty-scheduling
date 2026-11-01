import { Head, router } from '@inertiajs/react';
import { Archive, BookOpen, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import {
    archive as teachingHistoriesArchive,
    create as teachingHistoriesCreate,
    destroy as teachingHistoriesDestroy,
    edit as teachingHistoriesEdit,
    index as teachingHistories,
    show as teachingHistoriesShow,
} from '@/routes/teaching-histories';
import type { TeachingHistoriesIndexProps } from '@/types';

export default function Index({
    data,
    filters,
    teachers,
    semesters,
    isTeacherRole = false,
    canCreate = true,
}: TeachingHistoriesIndexProps) {
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
                teacher_id: isTeacherRole ? undefined : teacherId,
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
        if (!deleteId) {
            return;
        }

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

    // Teaching history is an archival record; teachers cannot manually create it
    const shouldShowCreate = !isTeacherRole && canCreate;

    return (
        <>
            <Head title={isTeacherRole ? 'My Teaching History' : 'Teaching Histories'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (OUTSIDE table card) */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {isTeacherRole ? 'Teaching History' : 'Teaching Histories'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isTeacherRole
                            ? 'Official record of your faculty teaching assignments, subject loads, and completed academic terms.'
                            : 'Review faculty teaching track records, historical subject loads, and academic term service.'}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder={isTeacherRole ? 'Search by subject code or title...' : 'Search by teacher or subject...'}
                        onSearchChange={handleSearchChange}
                        createHref={shouldShowCreate ? teachingHistoriesCreate().url : undefined}
                        createLabel="New History"
                    >
                        {/* Only administrative roles can filter across different teachers */}
                        {!isTeacherRole && teachers && teachers.length > 0 && (
                            <Select
                                value={teacherId}
                                onValueChange={(value) => {
                                    setTeacherId(value);
                                    setTimeout(() => handleFilterChange(), 0);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[150px] text-xs">
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
                        )}

                        <Select
                            value={semesterId}
                            onValueChange={(value) => {
                                setSemesterId(value);
                                setTimeout(() => handleFilterChange(), 0);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[150px] text-xs">
                                <SelectValue placeholder="All semesters" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((semester) => (
                                    <SelectItem key={semester.id} value={semester.id.toString()}>
                                        {semester.name} {semester.year || semester.academic_year || ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={status}
                            onValueChange={(value) => {
                                setStatus(value);
                                setTimeout(() => handleFilterChange(), 0);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[130px] text-xs">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                            </SelectContent>
                        </Select>

                        {((!isTeacherRole && teacherId) || semesterId || status) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTeacherId('');
                                    setSemesterId('');
                                    setStatus('');
                                    setTimeout(() => navigate({ teacher_id: '', semester_id: '', status: '', page: 1 }), 0);
                                }}
                                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear filters
                            </Button>
                        )}
                    </TablePageHeader>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                {!isTeacherRole && (
                                    <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                        Teacher
                                    </TableHead>
                                )}
                                <TableHead className={!isTeacherRole ? 'h-11 px-4 py-0 text-sm font-medium text-muted-foreground' : 'h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground'}>
                                    Subject / Course
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Class / Details
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
                                    <TableCell colSpan={isTeacherRole ? 7 : 8} className="h-44 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <BookOpen className="h-6 w-6 opacity-40 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    No teaching history records found
                                                </p>
                                                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                                                    {isTeacherRole
                                                        ? 'Teaching history is an archival record generated automatically from your official assignments and completed terms. Once academic terms conclude, verified teaching records are logged here.'
                                                        : 'Teaching history entries reflect past assignments and verified course loads.'}
                                                </p>
                                                {search && (
                                                    <p className="mt-2 text-xs">
                                                        Try a different search or{' '}
                                                        <button
                                                            onClick={() => handleSearchChange('')}
                                                            className="text-primary hover:underline font-medium"
                                                        >
                                                            clear filters
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
                                        {!isTeacherRole && (
                                            <TableCell className="py-3.5 pl-6 pr-4">
                                                <span className="text-sm font-medium text-foreground">
                                                    {item.teacher
                                                        ? `${item.teacher.first_name} ${item.teacher.last_name}`
                                                        : '-'}
                                                </span>
                                            </TableCell>
                                        )}

                                        <TableCell className={!isTeacherRole ? 'px-4 py-3.5 text-sm' : 'py-3.5 pl-6 pr-4 text-sm'}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    {item.subject?.code || '—'}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {item.subject?.title || item.subject?.name || 'Assigned Course'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.semester
                                                ? `${item.semester.name} ${item.semester.year || item.semester.academic_year || ''}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-xs text-muted-foreground">
                                            {item.schedule ? (
                                                <span className="font-medium text-foreground">
                                                    {item.schedule.section}
                                                    {item.schedule.room ? ` • ${item.schedule.room}` : ''}
                                                </span>
                                            ) : (
                                                <span>{item.notes || '—'}</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.hours_completed}/{item.hours_assigned} hrs
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${Math.min(100, Math.max(0, item.completion_percentage || 0))}%` }}
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
                                                        View Details
                                                    </DropdownMenuItem>

                                                    {/* Teachers cannot edit, archive, or delete official academic records */}
                                                    {!isTeacherRole && (
                                                        <>
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
                                                        </>
                                                    )}
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
                title="Delete Teaching History"
                itemName={data.data.find((th) => th.id === deleteId)?.subject?.title || data.data.find((th) => th.id === deleteId)?.subject?.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Teaching History', href: teachingHistories() }]}>
        {page}
    </AppLayout>
);
