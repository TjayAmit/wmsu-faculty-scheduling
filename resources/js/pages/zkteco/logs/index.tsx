import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Cpu,
    DoorOpen,
    Fingerprint,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { BreadcrumbItem } from '@/types';

interface LogItem {
    id: number;
    zkteco_device_id: number;
    classroom_id: number;
    biometric_pin: string;
    punch_time: string;
    punch_type: 'check_in' | 'check_out' | 'auto';
    verify_type: 'fingerprint' | 'face' | 'rfid_card' | 'password' | 'other';
    match_status: 'matched' | 'mismatched_room' | 'no_scheduled_class' | 'teacher_not_found' | 'duplicate_ignored';
    rejection_reason?: string | null;
    device?: {
        id: number;
        device_name: string;
        ip_address: string;
    } | null;
    qr_kiosk?: {
        id: number;
        kiosk_name: string;
        browser_name?: string | null;
    } | null;
    classroom?: {
        id: number;
        building: string;
        room_number: string;
        room_name?: string | null;
    } | null;
    teacher?: {
        id: number;
        full_name: string;
        employee_id: string;
    } | null;
    teacher_schedule?: {
        id: number;
        room?: string | null;
        section?: string | null;
        start_time?: string;
        end_time?: string;
        subject?: {
            id: number;
            code: string;
            title: string;
        } | null;
    } | null;
}

interface DeviceFilterOption {
    id: number;
    device_name: string;
    classroom_name: string;
}

interface Props {
    data: {
        data: LogItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search?: string;
        match_status?: string;
        zkteco_device_id?: string;
        date?: string;
        per_page?: number;
    };
    stats: {
        total: number;
        matched: number;
        mismatched_room: number;
        no_scheduled_class: number;
        teacher_not_found: number;
    };
    devices: DeviceFilterOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Biometric Devices', href: '/zkteco-devices' },
    { title: 'Room Attendance Punch Logs', href: '/zkteco-logs' },
];

export default function ZktecoLogsIndex({ data, filters, stats, devices }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [matchStatus, setMatchStatus] = useState(filters.match_status || 'all');
    const [deviceId, setDeviceId] = useState(String(filters.zkteco_device_id || 'all'));
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [perPage, setPerPage] = useState(Number(filters.per_page) || 10);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            '/zkteco-logs',
            {
                search,
                match_status: matchStatus,
                zkteco_device_id: deviceId,
                date: dateFilter,
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

    const renderMatchBadge = (status: LogItem['match_status']) => {
        switch (status) {
            case 'matched':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Present (Room Verified)
                    </Badge>
                );
            case 'mismatched_room':
                return (
                    <Badge variant="destructive" className="gap-1.5">
                        <ShieldAlert className="h-3 w-3" />
                        Wrong Classroom
                    </Badge>
                );
            case 'no_scheduled_class':
                return (
                    <Badge variant="secondary" className="gap-1.5">
                        <Clock className="h-3 w-3" />
                        No Scheduled Class
                    </Badge>
                );
            case 'teacher_not_found':
                return (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        Unknown PIN
                    </Badge>
                );
            default:
                return <Badge variant="outline">Duplicate Ignored</Badge>;
        }
    };

    return (
        <>
            <Head title="Room Attendance Punch Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Classroom Attendance Punch Logs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Audit trail of faculty biometric clock-ins verified against scheduled subject classrooms.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/zkteco-devices">
                            <Cpu className="mr-2 h-4 w-4" />
                            Manage ZKTeco Devices
                        </Link>
                    </Button>
                </div>

                {/* 2. KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Total Punch Logs
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Fingerprint className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.total}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Biometric logs captured
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Verified Present
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.matched}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Right room & scheduled time
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-destructive/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Wrong Classroom
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.mismatched_room}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Non-scheduled room rejected
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Unscheduled / Unknown
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.no_scheduled_class + stats.teacher_not_found}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.no_scheduled_class} no schedule • {stats.teacher_not_found} unknown PIN
                        </p>
                    </div>
                </div>

                {/* 3. Main Log Table */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                            {data.total} {data.total === 1 ? 'record' : 'records'}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full sm:w-60">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search teacher, room, PIN..."
                                    className="h-9 pl-9"
                                />
                            </div>

                            <Select
                                value={matchStatus}
                                onValueChange={(val) => {
                                    setMatchStatus(val);
                                    navigate({ match_status: val, page: 1 });
                                }}
                            >
                                <SelectTrigger className="h-9 w-[180px]">
                                    <SelectValue placeholder="Verification Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Verification States</SelectItem>
                                    <SelectItem value="matched">Present (Room Verified)</SelectItem>
                                    <SelectItem value="mismatched_room">Wrong Classroom</SelectItem>
                                    <SelectItem value="no_scheduled_class">No Scheduled Class</SelectItem>
                                    <SelectItem value="teacher_not_found">Unknown PIN</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={deviceId}
                                onValueChange={(val) => {
                                    setDeviceId(val);
                                    navigate({ zkteco_device_id: val, page: 1 });
                                }}
                            >
                                <SelectTrigger className="h-9 w-[200px]">
                                    <SelectValue placeholder="All Classroom Devices" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classroom Devices</SelectItem>
                                    {devices.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.classroom_name} ({d.device_name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    navigate({ date: e.target.value, page: 1 });
                                }}
                                className="h-9 w-[155px]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Punch Timestamp
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Faculty Member
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Clocked-In Device & Room
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Scheduled Subject & Assigned Room
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Room Verification
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Audit Explanation
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-44 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <Fingerprint className="h-8 w-8 opacity-40" />
                                                <p className="text-sm font-medium text-foreground">
                                                    No attendance punch logs found
                                                </p>
                                                <p className="text-xs">
                                                    Punches from classroom ZKTeco terminals will appear here in real time.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                                                <div>
                                                    {new Date(log.punch_time).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {new Date(log.punch_time).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}{' '}
                                                    · <span className="uppercase">{log.verify_type}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {log.teacher ? (
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {log.teacher.full_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {log.teacher.employee_id} · PIN: {log.biometric_pin}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Unknown PIN: <code>{log.biometric_pin}</code>
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    {log.classroom && (
                                                        <Badge variant="outline" className="w-fit gap-1 font-medium">
                                                            <DoorOpen className="h-3 w-3 text-primary" />
                                                            {log.classroom.building} {log.classroom.room_number}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.device?.device_name || log.qr_kiosk?.kiosk_name || 'Classroom Terminal'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {log.teacher_schedule?.subject ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {log.teacher_schedule.subject.code} — {log.teacher_schedule.subject.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Assigned Room: <strong>{log.teacher_schedule.room || 'N/A'}</strong>
                                                            {log.teacher_schedule.section ? ` · Sec ${log.teacher_schedule.section}` : ''}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        No active schedule in time window
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {renderMatchBadge(log.match_status)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-xs text-muted-foreground max-w-md">
                                                {log.rejection_reason}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <TablePagination
                        currentPage={data.current_page}
                        lastPage={data.last_page}
                        perPage={perPage}
                        total={data.total}
                        from={data.from}
                        to={data.to}
                        onPageChange={(page: number) => navigate({ page })}
                        onPerPageChange={(val: number) => {
                            setPerPage(val);
                            navigate({ per_page: val, page: 1 });
                        }}
                    />
                </div>
            </div>
        </>
    );
}

ZktecoLogsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
