import { Head, router } from '@inertiajs/react';
import {
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    GraduationCap,
    UserPlus,
    UserX,
    Filter,
    CalendarPlus,
    Users,
    CheckCircle2,
    Clock,
    BookOpen,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { create as assignSchedulesCreate } from '@/routes/assign-schedules';
import {
    index as teachers,
    create as teachersCreate,
    show as teachersShow,
    edit as teachersEdit,
    destroy as teachersDestroy,
} from '@/routes/teachers';
import type { TeachersIndexProps, TeacherFilters } from '@/types';

export default function Index({ data, filters, employmentTypes, stats }: TeachersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [workload, setWorkload] = useState(filters.workload || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            teachers(),
            {
                search,
                workload: workload === '_all' ? undefined : workload,
                per_page: perPage,
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

    const handleWorkloadChange = (newWorkload: string) => {
        setWorkload(newWorkload);
        router.get(
            teachers(),
            {
                search,
                workload: newWorkload === '_all' ? undefined : newWorkload,
                per_page: perPage,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleFilterChange = (key: keyof TeacherFilters, value: any) => {
        router.get(teachers(), { ...filters, [key]: value }, { preserveState: true });
    };

    const createUserAccount = (teacherId: number) => {
        router.get(`/teachers/${teacherId}/create-user-account`);
    };

    const unlinkUserAccount = (teacherId: number) => {
        if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
            router.delete(`/teachers/${teacherId}/unlink-user-account`);
        }
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(teachersDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const getEmploymentTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            full_time: 'default',
            part_time: 'secondary',
            casual: 'outline',
        };
        const labels: Record<string, string> = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            casual: 'Casual',
        };

        return <Badge variant={variants[type] || 'default'}>{labels[type] || type}</Badge>;
    };

    return (
        <>
            <Head title="Teachers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Teachers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage faculty instructors, monitor teaching workloads, and allocate course schedules.
                        </p>
                    </div>

                    {/* Quick Workload Navigation Filter Pills */}
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 shadow-xs">
                        <button
                            type="button"
                            onClick={() => handleWorkloadChange('_all')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                workload === '_all'
                                    ? 'bg-[#800000] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            All ({stats?.total_teachers ?? data.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleWorkloadChange('assigned')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                workload === 'assigned'
                                    ? 'bg-[#800000] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            With Schedules ({stats?.assigned_teachers ?? 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleWorkloadChange('unassigned')}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                workload === 'unassigned'
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Available ({stats?.unassigned_teachers ?? 0})
                        </button>
                    </div>
                </div>

                {/* 2. Summary KPI Cards (Curricula design) */}
                {stats && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Faculty
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total_teachers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active academic personnel
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Assigned Teachers
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.assigned_teachers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Holding class assignments
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Available (Free)
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.unassigned_teachers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Ready for schedule allocation
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-purple-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Course Offerings
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total_course_offerings}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active term schedules
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. Main Teachers Table Card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search faculty teachers…"
                        onSearchChange={handleSearchChange}
                        createHref={teachersCreate().url}
                        createLabel="New Teacher"
                    />

                    {showFilters && (
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex justify-between items-center mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="without_user"
                                        checked={filters.without_user || false}
                                        onCheckedChange={(checked) => handleFilterChange('without_user', checked)}
                                    />
                                    <label htmlFor="without_user" className="text-sm">
                                        Without User Account
                                    </label>
                                </div>

                                <Select
                                    value={filters.is_active?.toString() || ''}
                                    onValueChange={(value) => handleFilterChange('is_active', value ? value === 'true' : undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.employment_type || ''}
                                    onValueChange={(value) => handleFilterChange('employment_type', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Employment Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employmentTypes?.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.department || ''}
                                    onValueChange={(value) => handleFilterChange('department', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Departments */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Teacher
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Email
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Employee ID
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Department
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Employment Type
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Teaching Workload
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    User Account
                                </TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <GraduationCap className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No teachers found</p>
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
                                    const assignmentCount = item.active_assignments_count ?? 0;
                                    const isAvailable = assignmentCount === 0;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                            onClick={() => router.get(teachersShow(item.id))}
                                        >
                                            <TableCell className="py-3.5 pl-6 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.full_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.rank || 'Instructor'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.email}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5 text-sm font-mono text-muted-foreground">
                                                {item.employee_id}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.department || '-'}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                {getEmploymentTypeBadge(item.employment_type)}
                                            </TableCell>

                                            {/* Teaching Workload Column with Clear Decision-Making Badges */}
                                            <TableCell className="px-4 py-3.5">
                                                {isAvailable ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1 text-xs"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        Available (0 courses)
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-medium text-xs gap-1"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-blue-500" />
                                                        {assignmentCount} {assignmentCount === 1 ? 'Course' : 'Courses'}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                {Boolean(item.has_user_account || item.user_id || item.user) ? (
                                                    <div className="flex items-center space-x-1">
                                                        <Badge variant="default" className="text-xs">
                                                            <UserPlus className="w-3 h-3 mr-1" />
                                                            Linked
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.user?.name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <UserX className="w-3 h-3 mr-1" />
                                                        No Account
                                                    </Badge>
                                                )}
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
                                                        {/* Primary Decision Action: Assign Course Schedule */}
                                                        <DropdownMenuItem
                                                            onClick={() => router.get(`${assignSchedulesCreate().url}?teacher_id=${item.id}`)}
                                                            className="font-medium text-primary focus:text-primary"
                                                        >
                                                            <CalendarPlus className="mr-2 h-4 w-4" />
                                                            Assign Schedule
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => router.get(teachersShow(item.id))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Profile & Schedule
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => router.get(teachersEdit(item.id))}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Profile
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        {!Boolean(item.has_user_account || item.user_id || item.user) ? (
                                                            <DropdownMenuItem onClick={() => createUserAccount(item.id)}>
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Create Account
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => unlinkUserAccount(item.id)}
                                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Unlink User
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(item.id)}
                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Teacher
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
                        meta={data}
                        perPage={perPage}
                        onPageChange={(page) => navigate({ page })}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Teacher"
                description="Are you sure you want to delete this teacher? This action cannot be undone."
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Teachers', href: teachers() }]}>
        {page}
    </AppLayout>
);
