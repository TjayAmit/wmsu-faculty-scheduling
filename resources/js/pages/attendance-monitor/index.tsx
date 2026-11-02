import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Cpu,
    Filter,
    GraduationCap,
    Info,
    MapPin,
    Printer,
    QrCode,
    RefreshCw,
    Search,
    ShieldAlert,
    User,
    UserCheck,
    UserX,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface ScheduleSession {
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    room: string;
    scheduled_date: string;
    formatted_date: string;
    start_time: string;
    end_time: string;
    duration: string;
    status: 'present' | 'absent' | 'on_leave' | 'in_session' | 'scheduled' | 'cancelled';
    is_late: boolean;
    late_minutes: number;
    clock_in_time: string | null;
    audit_source: string;
    leave_type: string | null;
    leave_reason: string | null;
}

interface TeacherMonitorRow {
    id: number;
    name: string;
    employee_id: string;
    department: string;
    email: string | null;
    rank: string | null;
    employment_type: string;
    days_present: number;
    days_absent: number;
    days_on_leave: number;
    classes_present: number;
    classes_absent: number;
    classes_on_leave: number;
    classes_upcoming: number;
    classes_in_session: number;
    total_past_classes: number;
    absence_percentage: number;
    attendance_percentage: number;
    has_absences: boolean;
    has_leaves: boolean;
    breakdown: ScheduleSession[]; // Ordered present to past
}

interface GlobalStats {
    total_teachers: number;
    teachers_with_absence: number;
    teachers_on_leave: number;
    total_days_present: number;
    total_days_absent: number;
    total_days_on_leave: number;
    overall_absence_rate: number;
}

interface Props {
    teachers: TeacherMonitorRow[];
    stats: GlobalStats;
    filters: {
        period: 'month' | 'semester' | 'today' | 'custom';
        start_date: string;
        end_date: string;
        department: string;
        search: string;
        tab: 'all' | 'absent' | 'leave' | 'perfect';
    };
    departments: string[];
    today_date: string;
    date_range_label: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Faculty Administration', href: '/admin/dashboard' },
    { title: 'Faculty Attendance Monitor', href: '/attendance-monitor' },
];

export default function AttendanceMonitorPage({
    teachers,
    stats,
    filters,
    departments,
    today_date,
    date_range_label,
}: Props) {
    const [expandedTeacherId, setExpandedTeacherId] = useState<number | null>(() => {
        // Automatically expand the first teacher who has absences if available
        const firstWithAbsence = teachers.find((t) => t.has_absences);
        return firstWithAbsence ? firstWithAbsence.id : teachers[0]?.id ?? null;
    });

    const [search, setSearch] = useState(filters.search || '');
    const [period, setPeriod] = useState(filters.period || 'month');
    const [dept, setDept] = useState(filters.department || 'all');
    const [activeTab, setActiveTab] = useState(filters.tab || 'all');
    const [customStart, setCustomStart] = useState(filters.start_date);
    const [customEnd, setCustomEnd] = useState(filters.end_date);

    const toggleExpand = (id: number) => {
        setExpandedTeacherId((prev) => (prev === id ? null : id));
    };

    const updateFilterParams = (overrides: Record<string, any>) => {
        router.get(
            '/attendance-monitor',
            {
                period: overrides.period ?? period,
                department: overrides.department ?? dept,
                search: overrides.search ?? search,
                tab: overrides.tab ?? activeTab,
                start_date: overrides.start_date ?? customStart,
                end_date: overrides.end_date ?? customEnd,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilterParams({ search });
    };

    const handleReset = () => {
        setSearch('');
        setPeriod('month');
        setDept('all');
        setActiveTab('all');
        router.get('/attendance-monitor', {}, { preserveState: false, preserveScroll: false });
    };

    return (
        <>
            <Head title="Faculty Attendance Monitor" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
                {/* ── Top Header Bar ── */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/80 pb-3.5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Faculty Attendance & Absence Monitor
                            </h1>
                            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                                {date_range_label}
                            </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Simplified faculty presence overview: track days present, days absent, approved leaves, and absence rates past-to-present.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="h-8 text-xs gap-1.5"
                        >
                            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                            Print Report
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 text-xs gap-1.5"
                        >
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* ── 4 At-A-Glance Metric Tiles ── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {/* Monitored Teachers */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Monitored Faculty
                            </span>
                            <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                                {stats.total_teachers}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Active teaching instructors
                            </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <GraduationCap className="h-4.5 w-4.5" />
                        </div>
                    </div>

                    {/* Faculty with Absences */}
                    <div
                        onClick={() => {
                            setActiveTab('absent');
                            updateFilterParams({ tab: 'absent' });
                        }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-all cursor-pointer hover:border-border/80"
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Instructors with Absences
                            </span>
                            <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                                {stats.teachers_with_absence}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {stats.total_days_absent} total missed class days
                            </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#800000] dark:bg-red-950/40 dark:text-red-400">
                            <UserX className="h-4.5 w-4.5" />
                        </div>
                    </div>

                    {/* Faculty on Leave */}
                    <div
                        onClick={() => {
                            setActiveTab('leave');
                            updateFilterParams({ tab: 'leave' });
                        }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-all cursor-pointer hover:border-amber-500/40"
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                On Approved Leave
                            </span>
                            <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                                {stats.teachers_on_leave}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {stats.total_days_on_leave} days covered by leave
                            </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Calendar className="h-4.5 w-4.5" />
                        </div>
                    </div>

                    {/* Overall Campus Absence Rate */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Campus Absence Rate
                            </span>
                            <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                                {stats.overall_absence_rate}%
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Missed classes vs total held
                            </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
                            <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                    </div>
                </div>

                {/* ── Filters Bar ── */}
                <Card className="gap-0 py-0 border-border bg-card shadow-xs">
                    {/* Status Tabs Switcher */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('all');
                                    updateFilterParams({ tab: 'all' });
                                }}
                                className={cn(
                                    'rounded-md px-3 py-1 text-xs font-semibold transition-all',
                                    activeTab === 'all'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                All Faculty ({stats.total_teachers})
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('absent');
                                    updateFilterParams({ tab: 'absent' });
                                }}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all',
                                    activeTab === 'absent'
                                        ? 'bg-[#800000] text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                                )}
                            >
                                <UserX className="h-3.5 w-3.5" />
                                With Absences ({stats.teachers_with_absence})
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('leave');
                                    updateFilterParams({ tab: 'leave' });
                                }}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all',
                                    activeTab === 'leave'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                                )}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                On Leave ({stats.teachers_on_leave})
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('perfect');
                                    updateFilterParams({ tab: 'perfect' });
                                }}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all',
                                    activeTab === 'perfect'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                                )}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                100% Present
                            </button>
                        </div>

                        <span className="text-xs text-muted-foreground">
                            Click any teacher row below to inspect schedule breakdown
                        </span>
                    </div>

                    {/* Filter Inputs Row */}
                    <div className="p-3 bg-card">
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
                            {/* Search box */}
                            <form onSubmit={handleSearchSubmit} className="relative lg:col-span-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by teacher name or ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-8.5 text-xs"
                                />
                            </form>

                            {/* Period selector */}
                            <div className="lg:col-span-3">
                                <Select
                                    value={period}
                                    onValueChange={(val: any) => {
                                        setPeriod(val);
                                        updateFilterParams({ period: val });
                                    }}
                                >
                                    <SelectTrigger className="h-8.5 text-xs">
                                        <SelectValue placeholder="Select Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Current Month (Nov 2026)</SelectItem>
                                        <SelectItem value="today">Today Only</SelectItem>
                                        <SelectItem value="semester">Entire Semester</SelectItem>
                                        <SelectItem value="custom">Custom Date Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department selector */}
                            <div className="lg:col-span-3">
                                <Select
                                    value={dept}
                                    onValueChange={(val) => {
                                        setDept(val);
                                        updateFilterParams({ department: val });
                                    }}
                                >
                                    <SelectTrigger className="h-8.5 text-xs">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Action or Custom Range Inputs */}
                            {period === 'custom' ? (
                                <div className="flex items-center gap-1 lg:col-span-2">
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => {
                                            setCustomStart(e.target.value);
                                            updateFilterParams({ start_date: e.target.value, period: 'custom' });
                                        }}
                                        className="h-8.5 w-full rounded-md border border-input bg-transparent px-2 text-[11px]"
                                    />
                                    <span className="text-muted-foreground text-xs">&ndash;</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => {
                                            setCustomEnd(e.target.value);
                                            updateFilterParams({ end_date: e.target.value, period: 'custom' });
                                        }}
                                        className="h-8.5 w-full rounded-md border border-input bg-transparent px-2 text-[11px]"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-end lg:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReset}
                                        className="h-8.5 text-xs w-full justify-center"
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── Main Simplified Teacher Table ── */}
                <Card className="gap-0 py-0 border-border bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs font-semibold">
                                    <TableHead className="w-[36px]"></TableHead>
                                    <TableHead className="min-w-[190px]">Instructor Name &amp; ID</TableHead>
                                    <TableHead className="text-center w-[120px]">Days Present</TableHead>
                                    <TableHead className="text-center w-[120px]">Days Absent</TableHead>
                                    <TableHead className="text-center w-[120px]">Days on Leave</TableHead>
                                    <TableHead className="min-w-[160px]">Absence Rate (Past &rarr; Present)</TableHead>
                                    <TableHead className="text-center w-[130px]">Classes Evaluated</TableHead>
                                    <TableHead className="text-right w-[110px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.length > 0 ? (
                                    teachers.map((teacher) => {
                                        const isExpanded = expandedTeacherId === teacher.id;
                                        const rate = teacher.absence_percentage;

                                        return (
                                            <React.Fragment key={teacher.id}>
                                                {/* Main Teacher Summary Row */}
                                                <TableRow
                                                    onClick={() => toggleExpand(teacher.id)}
                                                    className={cn(
                                                        'cursor-pointer transition-colors border-b select-none',
                                                        isExpanded ? 'bg-muted/40' : 'hover:bg-muted/25'
                                                    )}
                                                >
                                                    {/* Expand Chevron */}
                                                    <TableCell className="text-center p-2">
                                                        <div className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4 text-foreground" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* 1. Teacher Name & Employee ID */}
                                                    <TableCell>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                                                <span>{teacher.name}</span>
                                                                {teacher.has_absences && (
                                                                    <span className="h-2 w-2 rounded-full bg-[#800000]" title="Has unexcused class absences" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                                <span className="font-mono font-medium">{teacher.employee_id}</span>
                                                                <span>&bull;</span>
                                                                <span className="truncate">{teacher.department}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* 2. Days Present */}
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 text-xs"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            {teacher.days_present} {teacher.days_present === 1 ? 'Day' : 'Days'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* 3. Days Absent */}
                                                    <TableCell className="text-center">
                                                        {teacher.days_absent > 0 ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300 font-semibold px-2 py-0.5 text-xs"
                                                            >
                                                                <UserX className="h-3 w-3 mr-1 text-red-700 dark:text-red-400" />
                                                                {teacher.days_absent} {teacher.days_absent === 1 ? 'Day' : 'Days'}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                0 Days
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/* 4. Days on Leave */}
                                                    <TableCell className="text-center">
                                                        {teacher.days_on_leave > 0 ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 text-xs"
                                                            >
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {teacher.days_on_leave} {teacher.days_on_leave === 1 ? 'Day' : 'Days'}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                0 Days
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/* 5. Percentage of Absences vs Total Evaluated */}
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className={cn(
                                                                    'font-bold',
                                                                    rate >= 30 ? 'text-[#800000] dark:text-red-400' : rate > 0 ? 'text-amber-600' : 'text-emerald-600'
                                                                )}>
                                                                    {rate}% Absences
                                                                </span>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {teacher.classes_present}/{teacher.total_past_classes} attended
                                                                </span>
                                                            </div>
                                                            {/* Mini Progress Bar */}
                                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        'h-full transition-all duration-300',
                                                                        rate >= 30 ? 'bg-[#800000]' : rate > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    )}
                                                                    style={{ width: `${Math.min(100, rate)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* 6. Classes Evaluated */}
                                                    <TableCell className="text-center text-xs">
                                                        <span className="font-semibold text-foreground">
                                                            {teacher.total_past_classes}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground block">
                                                            past scheduled
                                                        </span>
                                                    </TableCell>

                                                    {/* 7. Action Button */}
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleExpand(teacher.id)}
                                                            className="h-7 text-xs text-primary hover:text-primary gap-1 px-2"
                                                        >
                                                            {isExpanded ? 'Hide' : 'Breakdown'}
                                                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Breakdown Drawer (Ordered present to past) */}
                                                {isExpanded && (
                                                    <TableRow className="bg-muted/15 border-b hover:bg-muted/15">
                                                        <TableCell colSpan={8} className="p-0">
                                                            <div className="p-4 space-y-3 border-l-4 border-l-primary bg-background/50 m-2 rounded-lg border border-border shadow-xs">
                                                                {/* Breakdown Header */}
                                                                <div className="border-b border-border/80 pb-2.5">
                                                                    <div>
                                                                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                                                            <span>Schedule &amp; Attendance Breakdown: {teacher.name}</span>
                                                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                                                ID: {teacher.employee_id}
                                                                            </Badge>
                                                                        </h4>
                                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                            All teaching sessions ordered from present/most recent down to past dates.
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Sessions List */}
                                                                {teacher.breakdown.length > 0 ? (
                                                                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                                                        {teacher.breakdown.map((session) => {
                                                                            const isAbsent = session.status === 'absent';
                                                                            const isPresent = session.status === 'present';
                                                                            const isOnLeave = session.status === 'on_leave';
                                                                            const isInSession = session.status === 'in_session';
                                                                            const isScheduled = session.status === 'scheduled';

                                                                            return (
                                                                                <div
                                                                                    key={session.id}
                                                                                    className={cn(
                                                                                        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
                                                                                        isAbsent && 'border-border bg-muted/20',
                                                                                        isPresent && 'border-border bg-card hover:bg-muted/30',
                                                                                        isOnLeave && 'border-amber-500/40 bg-amber-500/5',
                                                                                        isInSession && 'border-blue-500/40 bg-blue-500/5'
                                                                                    )}
                                                                                >
                                                                                    {/* Left: Date, Time & Subject */}
                                                                                    <div className="flex items-start gap-3 min-w-0">
                                                                                        {/* Date Badge */}
                                                                                        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-muted/60 px-2.5 py-1 text-center min-w-[80px] shrink-0">
                                                                                            <span className="text-xs font-bold text-foreground">
                                                                                                {session.start_time}
                                                                                            </span>
                                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                                {session.end_time}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Details */}
                                                                                        <div className="min-w-0 space-y-0.5">
                                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                                <span className="font-bold text-xs text-foreground">
                                                                                                    {session.subject_code}
                                                                                                </span>
                                                                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium">
                                                                                                    Sec {session.section}
                                                                                                </Badge>
                                                                                                <span className="text-xs text-muted-foreground font-medium truncate max-w-xs">
                                                                                                    {session.subject_title}
                                                                                                </span>
                                                                                            </div>

                                                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                                                                                <span className="font-semibold text-foreground/90">
                                                                                                    {session.formatted_date}
                                                                                                </span>
                                                                                                <span>&bull;</span>
                                                                                                <span className="inline-flex items-center gap-1">
                                                                                                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                                                                    {session.room}
                                                                                                </span>
                                                                                                <span>&bull;</span>
                                                                                                <span>{session.duration}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Right: Attendance Verification Audit & Status Pill */}
                                                                                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border shrink-0">
                                                                                        {/* Status Badge */}
                                                                                        {isAbsent && (
                                                                                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300 font-semibold text-xs px-2 py-0.5 gap-1">
                                                                                                <UserX className="h-3 w-3 text-red-700" /> Absent (Missed)
                                                                                            </Badge>
                                                                                        )}
                                                                                        {isPresent && (
                                                                                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs px-2 py-0.5 gap-1">
                                                                                                <CheckCircle2 className="h-3 w-3" /> Present
                                                                                            </Badge>
                                                                                        )}
                                                                                        {isOnLeave && (
                                                                                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs px-2 py-0.5 gap-1">
                                                                                                <Calendar className="h-3 w-3" /> On Leave
                                                                                            </Badge>
                                                                                        )}
                                                                                        {isInSession && (
                                                                                            <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold text-xs px-2 py-0.5 gap-1">
                                                                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> In Session
                                                                                            </Badge>
                                                                                        )}
                                                                                        {isScheduled && (
                                                                                            <Badge variant="outline" className="border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 gap-1">
                                                                                                <Clock className="h-3 w-3" /> Upcoming
                                                                                            </Badge>
                                                                                        )}

                                                                                        {/* When clock-in happened / Audit record */}
                                                                                        <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                                                                            {session.clock_in_time ? (
                                                                                                <span className="font-medium text-foreground">
                                                                                                    Clocked in at {session.clock_in_time}
                                                                                                    {session.is_late && ` (Late by ${session.late_minutes}m)`}
                                                                                                    {' '}&bull; {session.audit_source}
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span>{session.audit_source}</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="py-6 text-center text-xs text-muted-foreground">
                                                                        No class sessions found for this teacher in the selected period.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <GraduationCap className="h-7 w-7 text-muted-foreground/40" />
                                                <p className="text-xs font-semibold text-foreground">No faculty instructors found</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Try clearing your search term, switching the tab filter, or expanding the period.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </>
    );
}

AttendanceMonitorPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
