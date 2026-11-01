import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Filter,
    MapPin,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import {
    show as facultyDraftSchedulesShow,
    approve as facultyDraftSchedulesApprove,
    reject as facultyDraftSchedulesReject,
} from '@/routes/faculty-draft-schedules';
import {
    index as schedules,
    create as schedulesCreate,
    show as schedulesShow,
    edit as schedulesEdit,
    destroy as schedulesDestroy,
} from '@/routes/schedules';
import type { SchedulesIndexProps } from '@/types';
import type { FacultyDraftSchedule } from '@/types/facultyDraftSchedules';
import {
    facultyDraftScheduleStatusOptions,
    getFacultyDraftScheduleStatusVariant,
    getFacultyDraftScheduleStatusLabel,
} from '@/types/facultyDraftSchedules';

const dayLabels: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
};

export default function Index({ activeTab = 'schedules', data, drafts, counts, stats, filters }: SchedulesIndexProps) {
    const [currentTab, setCurrentTab] = useState<'schedules' | 'drafts'>(
        (filters.tab as 'schedules' | 'drafts') || activeTab || 'schedules',
    );
    const [search, setSearch] = useState(filters.search || '');
    const [draftSearch, setDraftSearch] = useState(filters.draft_search || '');
    const [draftStatus, setDraftStatus] = useState(filters.draft_status || '_all');
    const [perPage, setPerPage] = useState(Number(filters.per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingDraftId, setProcessingDraftId] = useState<number | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [rejectId, setRejectId] = useState<number | null>(null);

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const draftSearchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            schedules(),
            {
                tab: currentTab,
                search: currentTab === 'schedules' ? search : undefined,
                draft_search: currentTab === 'drafts' ? draftSearch : undefined,
                draft_status: currentTab === 'drafts' && draftStatus !== '_all' ? draftStatus : undefined,
                per_page: perPage,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleTabChange = (newTab: 'schedules' | 'drafts') => {
        setCurrentTab(newTab);
        router.get(
            schedules(),
            {
                tab: newTab,
                search: newTab === 'schedules' ? search : undefined,
                draft_search: newTab === 'drafts' ? draftSearch : undefined,
                draft_status: newTab === 'drafts' && draftStatus !== '_all' ? draftStatus : undefined,
                per_page: perPage,
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

    const handleDraftSearchChange = (value: string) => {
        setDraftSearch(value);
        clearTimeout(draftSearchTimeout.current);
        draftSearchTimeout.current = setTimeout(() => {
            navigate({ draft_search: value, drafts_page: 1 });
        }, 350);
    };

    const handleDraftStatusChange = (value: string) => {
        setDraftStatus(value);
        navigate({ draft_status: value === '_all' ? undefined : value, drafts_page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1, drafts_page: 1 });
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

    const handleApproveDraft = (id: number) => {
        setProcessingDraftId(id);
        router.post(facultyDraftSchedulesApprove(id).url, {}, {
            preserveScroll: true,
            onFinish: () => setProcessingDraftId(null),
        });
    };

    const openRejectDialog = (id: number) => {
        setRejectId(id);
        setRejectComments('');
        setShowRejectDialog(true);
    };

    const handleRejectDraft = () => {
        if (!rejectId) return;

        setProcessingDraftId(rejectId);
        router.post(facultyDraftSchedulesReject(rejectId).url, { comments: rejectComments }, {
            preserveScroll: true,
            onFinish: () => {
                setProcessingDraftId(null);
                setShowRejectDialog(false);
                setRejectId(null);
            },
        });
    };

    return (
        <>
            <Head title={currentTab === 'drafts' ? 'Faculty Draft Proposals' : 'Course Schedules'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header & Navigation Tabs */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Schedules
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage course timetables, period allocations, faculty proposals, and draft reviews.
                        </p>
                    </div>

                    {/* Sub-module Tab Switcher */}
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 shadow-xs">
                        <button
                            type="button"
                            onClick={() => handleTabChange('schedules')}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                currentTab === 'schedules'
                                    ? 'bg-[#800000] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            <CalendarDays className="size-4" />
                            <span>Course Schedules</span>
                            <span
                                className={`rounded-full px-1.5 py-0.2 text-xs font-semibold ${
                                    currentTab === 'schedules'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {counts?.schedules ?? data.total}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('drafts')}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                currentTab === 'drafts'
                                    ? 'bg-[#800000] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            <FileText className="size-4" />
                            <span>Draft Proposals</span>
                            {(counts?.pending_drafts ?? 0) > 0 ? (
                                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                    {counts?.pending_drafts} Pending
                                </span>
                            ) : (
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-xs font-semibold ${
                                        currentTab === 'drafts'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {counts?.drafts ?? drafts?.total ?? 0}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Overview Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Course Schedules */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('schedules')}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            currentTab === 'schedules'
                                ? 'border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]/20 dark:bg-[#800000]/10'
                                : 'border-border bg-card hover:border-primary/40'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Course Schedules
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats?.total_schedules ?? counts?.schedules ?? data.total}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats ? `${stats.assigned_schedules} assigned • ${stats.unassigned_schedules} free` : 'Active course offerings'}
                        </p>
                    </button>

                    {/* Card 2: Assigned Faculty */}
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Assigned Faculty
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats?.assigned_schedules ?? '—'}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Classes with assigned teachers
                        </p>
                    </div>

                    {/* Card 3: Draft Proposals */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('drafts')}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            currentTab === 'drafts'
                                ? 'border-purple-600 bg-purple-500/5 ring-1 ring-purple-500/20 dark:bg-purple-500/10'
                                : 'border-border bg-card hover:border-purple-500/40'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Draft Proposals
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <FileText className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats?.total_drafts ?? counts?.drafts ?? 0}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats ? `${stats.approved_drafts} approved • ${stats.rejected_drafts} rejected` : 'Faculty proposals'}
                        </p>
                    </button>

                    {/* Card 4: Action Required / Pending Review */}
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentTab('drafts');
                            setDraftStatus('pending_review');
                            router.get(
                                schedules(),
                                {
                                    tab: 'drafts',
                                    draft_status: 'pending_review',
                                    per_page: perPage,
                                },
                                { preserveState: true, preserveScroll: true },
                            );
                        }}
                        className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                            (stats?.pending_drafts ?? counts?.pending_drafts ?? 0) > 0
                                ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500'
                                : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Pending Review
                            </span>
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                    (stats?.pending_drafts ?? counts?.pending_drafts ?? 0) > 0
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}
                            >
                                {(stats?.pending_drafts ?? counts?.pending_drafts ?? 0) > 0 ? (
                                    <Clock className="h-4 w-4" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats?.pending_drafts ?? counts?.pending_drafts ?? 0}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {(stats?.pending_drafts ?? counts?.pending_drafts ?? 0) > 0 ? (
                                <span className="font-medium text-amber-700 dark:text-amber-400">Requires review</span>
                            ) : (
                                <span className="text-emerald-700 dark:text-emerald-400">All submissions processed</span>
                            )}
                        </p>
                    </button>
                </div>

                {/* 2. TAB 1: Course Schedules */}
                {currentTab === 'schedules' && (
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
                                                    <p className="text-sm font-medium">No course schedules found</p>
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
                )}

                {/* 3. TAB 2: Draft Proposals */}
                {currentTab === 'drafts' && drafts && (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* Draft Filters Toolbar */}
                        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {drafts.total} {drafts.total === 1 ? 'proposal' : 'proposals'}
                                </span>
                                {draftStatus !== '_all' && (
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        Filtered
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Search Bar moved to the right */}
                                <div className="relative w-full sm:w-64 lg:w-72">
                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search faculty or subject..."
                                        value={draftSearch}
                                        onChange={(e) => handleDraftSearchChange(e.target.value)}
                                        className="h-9 pl-8 pr-8 text-sm bg-background border-border shadow-none focus-visible:ring-1"
                                    />
                                    {draftSearch && (
                                        <button
                                            type="button"
                                            onClick={() => handleDraftSearchChange('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            title="Clear search"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Designed All Statuses Dropdown */}
                                <Select value={draftStatus} onValueChange={handleDraftStatusChange}>
                                    <SelectTrigger className="h-9 w-[175px] bg-background border-border hover:bg-muted/40 transition-colors shadow-none text-xs sm:text-sm font-medium">
                                        <div className="flex items-center gap-2 truncate">
                                            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            {draftStatus === '_all' && <span>All statuses</span>}
                                            {draftStatus === 'approved' && (
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                    Approved
                                                </span>
                                            )}
                                            {draftStatus === 'pending_review' && (
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                                    Pending Review
                                                </span>
                                            )}
                                            {draftStatus === 'rejected' && (
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                                                    Rejected
                                                </span>
                                            )}
                                            {draftStatus === 'draft' && (
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent align="end" className="w-[185px]">
                                        <SelectItem value="_all" className="cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                                                <span className="font-medium">All statuses</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="pending_review" className="cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span>Pending Review</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="approved" className="cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <span>Approved</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected" className="cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                                <span>Rejected</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="draft" className="cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                                <span>Draft</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {draftStatus !== '_all' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDraftStatusChange('_all')}
                                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Draft Proposals Table */}
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                        Teacher
                                    </TableHead>
                                    <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">
                                        Target Schedule
                                    </TableHead>
                                    <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">
                                        Semester
                                    </TableHead>
                                    <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="h-11 py-0 pl-4 pr-6 text-sm font-medium text-muted-foreground">
                                        Submitted
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {drafts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="rounded-full bg-muted p-3">
                                                    <FileText className="h-6 w-6 opacity-40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">No draft proposals found</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        Faculty draft submissions and approval requests will appear here.
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    drafts.data.map((item: FacultyDraftSchedule) => (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40"
                                            onClick={() => router.get(facultyDraftSchedulesShow(item.id).url)}
                                        >
                                            <TableCell className="py-3.5 pl-6 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {item.teacher?.user?.name || '—'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.teacher?.user?.email || ''}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.schedule?.subject?.code} - {item.schedule?.subject?.title}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <span className="text-sm text-muted-foreground">
                                                    {item.schedule?.semester?.name || '—'}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={getFacultyDraftScheduleStatusVariant(item.status)}
                                                        className="text-xs capitalize"
                                                    >
                                                        {getFacultyDraftScheduleStatusLabel(item.status)}
                                                    </Badge>

                                                    {item.status === 'pending_review' && (
                                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApproveDraft(item.id);
                                                                }}
                                                                disabled={processingDraftId === item.id}
                                                            >
                                                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                                Approve
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openRejectDialog(item.id);
                                                                }}
                                                                disabled={processingDraftId === item.id}
                                                            >
                                                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5 pl-4 pr-6">
                                                <span className="text-sm text-muted-foreground">
                                                    {item.submitted_at ? fmtDate(item.submitted_at) : '—'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            meta={{
                                total: drafts.total,
                                from: drafts.from,
                                to: drafts.to,
                                current_page: drafts.current_page,
                                last_page: drafts.last_page,
                            }}
                            perPage={perPage}
                            onPageChange={(page) => navigate({ drafts_page: page })}
                            onPerPageChange={handlePerPageChange}
                        />
                    </div>
                )}
            </div>

            {/* Schedule Delete Confirmation Dialog */}
            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Schedule"
                description="Are you sure you want to delete this schedule? This action cannot be undone and will remove all associated teacher assignments."
                onConfirm={handleDelete}
                loading={isDeleting}
            />

            {/* Draft Proposal Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Reject Draft Schedule</DialogTitle>
                        <DialogDescription>
                            Provide reason or feedback to the instructor explaining why this proposal was rejected.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <Textarea
                            placeholder="Add reason for rejection..."
                            value={rejectComments}
                            onChange={(e) => setRejectComments(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                            disabled={processingDraftId !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectDraft}
                            disabled={processingDraftId !== null}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Schedules', href: schedules() }]}>
        {page}
    </AppLayout>
);
