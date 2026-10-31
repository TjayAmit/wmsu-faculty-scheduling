import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, BookOpen, CheckCircle2, GraduationCap, Library } from 'lucide-react';
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
    index as curricula,
    create as curriculaCreate,
    show as curriculaShow,
    edit as curriculaEdit,
    destroy as curriculaDestroy,
} from '@/routes/curricula';
import type { CurriculaIndexProps } from '@/types';

export default function Index({ data, filters, stats }: CurriculaIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            curricula(),
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
        router.delete(curriculaDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const getYearLevelLabel = (yearLevel: number): string => {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = yearLevel <= 3 ? suffixes[yearLevel] : suffixes[0];

        return `${yearLevel}${suffix} Year`;
    };

    return (
        <>
            <Head title="Curriculum" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (OUTSIDE table card) */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Curricula
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure degree program curricula, academic years, prerequisite chains, and courses.
                    </p>
                </div>

                {/* 2. Summary KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Curricula
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Defined across all programs
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Required Courses
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.required}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.elective} elective / optional
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Programs Covered
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.programs_count}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active degree programs
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-purple-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Distinct Subjects
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Library className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.subjects_count}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.has_prerequisites} with prerequisites
                            </p>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search curriculum…"
                        onSearchChange={handleSearchChange}
                        createHref={curriculaCreate().url}
                        createLabel="New Curriculum"
                    />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Program
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Subject
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Year Level
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Units
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Required
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
                                                <p className="text-sm font-medium">No curriculum found</p>
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
                                        onClick={() => router.get(curriculaShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.program?.full_name || item.program?.name || 'N/A'}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.subject?.title || 'N/A'}
                                            <div className="text-xs text-muted-foreground/70">
                                                {item.subject?.code}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {getYearLevelLabel(item.year_level)}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant="secondary">
                                                {item.semester_type_label || item.semester_type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.effective_units ?? item.units_override ?? '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={item.is_required ? 'default' : 'secondary'}>
                                                {item.is_required ? 'Required' : 'Elective'}
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
                                                    <DropdownMenuItem onClick={() => router.get(curriculaShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(curriculaEdit(item.id))}>
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
                title="Delete Curriculum"
                itemName={data.data.find((c) => c.id === deleteId)?.subject?.title}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Curriculum', href: curricula() }]}>
        {page}
    </AppLayout>
);
