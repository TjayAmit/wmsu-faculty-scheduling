import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, Users, ToggleLeft, ToggleRight } from 'lucide-react';
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
    index as sections,
    create as sectionsCreate,
    show as sectionsShow,
    edit as sectionsEdit,
    destroy as sectionsDestroy,
    toggleStatus as sectionsToggleStatus,
} from '@/routes/sections';
import type { SectionsIndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, programs, semesters }: SectionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [programId, setProgramId] = useState(filters.program_id?.toString() || '');
    const [semesterId, setSemesterId] = useState(filters.semester_id?.toString() || '');
    const [yearLevel, setYearLevel] = useState(filters.year_level?.toString() || '');
    const [isActive, setIsActive] = useState(filters.is_active?.toString() || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            sections(),
            {
                search,
                per_page: perPage,
                program_id: programId,
                semester_id: semesterId,
                year_level: yearLevel,
                is_active: isActive,
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
        router.delete(sectionsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(sectionsToggleStatus.url(id));
    };

    const getStatusBadge = (isActive: boolean) => {
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
    };

    return (
        <>
            <Head title="Sections" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Sections"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search by section code or program..."
                        onSearchChange={handleSearchChange}
                        createHref={sectionsCreate().url}
                        createLabel="New Section"
                    />

                    {/* Filters */}
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="program_filter" className="text-xs">Program</Label>
                                <Select
                                    value={programId}
                                    onValueChange={(value) => {
                                        setProgramId(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="program_filter" className="w-[180px]">
                                        <SelectValue placeholder="All programs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                {program.name}
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
                                <Label htmlFor="year_level_filter" className="text-xs">Year Level</Label>
                                <Select
                                    value={yearLevel}
                                    onValueChange={(value) => {
                                        setYearLevel(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="year_level_filter" className="w-[130px]">
                                        <SelectValue placeholder="All years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                Year {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_filter" className="text-xs">Status</Label>
                                <Select
                                    value={isActive}
                                    onValueChange={(value) => {
                                        setIsActive(value);
                                        setTimeout(() => handleFilterChange(), 0);
                                    }}
                                >
                                    <SelectTrigger id="status_filter" className="w-[130px]">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setProgramId('');
                                    setSemesterId('');
                                    setYearLevel('');
                                    setIsActive('');
                                    setTimeout(() => navigate({ program_id: '', semester_id: '', year_level: '', is_active: '', page: 1 }), 0);
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
                                    Section Code
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Program
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Semester
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Year
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Students
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Adviser
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
                                                <Users className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No sections found</p>
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
                                        onClick={() => router.get(sectionsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.section_code}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.program?.name || '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.semester
                                                ? `${item.semester.name} ${item.semester.year}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            Year {item.year_level}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <span>{item.current_students}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span>{item.max_students}</span>
                                                {item.enrollment_percentage !== undefined && (
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({Math.round(item.enrollment_percentage)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.adviser
                                                ? `${item.adviser.first_name} ${item.adviser.last_name}`
                                                : '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            {getStatusBadge(item.is_active)}
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
                                                    <DropdownMenuItem onClick={() => router.get(sectionsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(sectionsEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(item.id)}>
                                                        {item.is_active ? (
                                                            <>
                                                                <ToggleLeft className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleRight className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
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
                title="Delete Section"
                itemName={data.data.find((s) => s.id === deleteId)?.section_code}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Sections', href: sections() }]}>
        {page}
    </AppLayout>
);
