import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Cpu,
    DoorOpen,
    Eye,
    Fingerprint,
    MoreVertical,
    Pencil,
    Plus,
    Radio,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
    Wifi,
    WifiOff,
    Activity,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface ClassroomItem {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
}

interface ZktecoDeviceItem {
    id: number;
    classroom_id: number;
    device_name: string;
    ip_address: string;
    port: number;
    comm_key?: string | null;
    serial_number?: string | null;
    model_name?: string | null;
    connection_type: 'tcp' | 'udp' | 'push';
    status: 'online' | 'offline' | 'error' | 'disabled';
    last_sync_at?: string | null;
    last_heartbeat_at?: string | null;
    is_active: boolean;
    notes?: string | null;
    attendance_logs_count?: number;
    classroom?: ClassroomItem | null;
}

interface TeacherOption {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    full_name: string;
    employee_id: string;
    biometric_pin?: string | null;
}

interface Props {
    data: {
        data: ZktecoDeviceItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search?: string;
        status?: string;
        per_page?: number;
    };
    stats: {
        total_devices: number;
        online_devices: number;
        offline_devices: number;
        unassigned_classrooms: number;
    };
    teachers: TeacherOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Biometric Devices', href: '/zkteco-devices' },
];

export default function ZktecoDevicesIndex({ data, filters, stats, teachers }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(Number(filters.per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [simulateDevice, setSimulateDevice] = useState<ZktecoDeviceItem | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const punchForm = useForm({
        biometric_pin: '',
        punch_time: '',
        verify_type: 'fingerprint',
        punch_type: 'auto',
    });

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            '/zkteco-devices',
            { search, status: statusFilter, per_page: perPage, ...params },
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

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        navigate({ status: value, page: 1 });
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
        router.delete(`/zkteco-devices/${deleteId}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handlePing = (deviceId: number) => {
        router.post(`/zkteco-devices/${deviceId}/ping`, {}, { preserveScroll: true });
    };

    const handleSync = (deviceId: number) => {
        router.post(`/zkteco-devices/${deviceId}/sync`, {}, { preserveScroll: true });
    };

    const openSimulateModal = (device: ZktecoDeviceItem) => {
        const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        punchForm.setData({
            biometric_pin: teachers[0]?.biometric_pin || teachers[0]?.employee_id || '',
            punch_time: nowLocal,
            verify_type: 'fingerprint',
            punch_type: 'auto',
        });
        setSimulateDevice(device);
    };

    const submitSimulatedPunch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!simulateDevice) {
            return;
        }
        punchForm.post(`/zkteco-devices/${simulateDevice.id}/simulate-punch`, {
            preserveScroll: true,
            onSuccess: () => {
                setSimulateDevice(null);
            },
        });
    };

    const renderStatusBadge = (status: ZktecoDeviceItem['status']) => {
        switch (status) {
            case 'online':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1.5">
                        <Wifi className="h-3 w-3" />
                        Online
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive" className="gap-1.5">
                        <WifiOff className="h-3 w-3" />
                        Error
                    </Badge>
                );
            case 'disabled':
                return (
                    <Badge variant="outline" className="text-muted-foreground gap-1.5">
                        Disabled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="gap-1.5">
                        <WifiOff className="h-3 w-3" />
                        Offline
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title="ZKTeco Biometric Devices" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (OUTSIDE card) */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            ZKTeco Biometric Devices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage classroom-bound ZKTeco attendance terminals. Each device applies exclusively to one classroom for subject presence verification.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href="/zkteco-logs">
                                <Activity className="mr-2 h-4 w-4" />
                                Attendance Punch Logs
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/zkteco-devices/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Register Device
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 2. Summary KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Registered Terminals
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Cpu className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.total_devices}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            1-to-1 bound to classrooms
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Online Terminals
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Wifi className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.online_devices}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Ready to verify teacher clock-ins
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Offline / Standby
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <WifiOff className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.offline_devices}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Awaiting network heartbeat or sync
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Unassigned Classrooms
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <DoorOpen className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
                            {stats.unassigned_classrooms}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Active classrooms without a device
                        </p>
                    </div>
                </div>

                {/* 3. Main Table Card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                            {data.total} {data.total === 1 ? 'device' : 'devices'} registered
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search device, IP, or room..."
                                    className="h-9 pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 w-[150px]">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Device Terminal
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Assigned Classroom (1:1)
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Network Endpoint
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Last Sync
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                        Punches
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-52 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                                                    <Fingerprint className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">
                                                    No ZKTeco biometric devices found
                                                </p>
                                                <p className="max-w-sm text-xs text-muted-foreground">
                                                    Register a ZKTeco device and bind it to a classroom so teachers can clock in for their scheduled subjects.
                                                </p>
                                                <Button asChild size="sm" className="mt-2">
                                                    <Link href="/zkteco-devices/create">
                                                        <Plus className="mr-1.5 h-4 w-4" />
                                                        Register First Device
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.data.map((device) => (
                                        <TableRow
                                            key={device.id}
                                            className="cursor-pointer transition-colors hover:bg-muted/40"
                                            onClick={() => router.visit(`/zkteco-devices/${device.id}`)}
                                        >
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Fingerprint className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {device.device_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {device.model_name || 'ZKTeco Terminal'}
                                                            {device.serial_number ? ` · SN: ${device.serial_number}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {device.classroom ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="gap-1.5 font-medium">
                                                            <DoorOpen className="h-3.5 w-3.5 text-primary" />
                                                            {device.classroom.building} {device.classroom.room_number}
                                                        </Badge>
                                                        {device.classroom.room_name && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({device.classroom.room_name})
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Unassigned</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                                                        {device.ip_address}:{device.port}
                                                    </code>
                                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                                        {device.connection_type}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {renderStatusBadge(device.status)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                                                {device.last_sync_at ? fmtDate(device.last_sync_at) : 'Never synced'}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <Badge variant="secondary">
                                                    {device.attendance_logs_count ?? 0} punches
                                                </Badge>
                                            </TableCell>

                                            <TableCell
                                                className="px-4 py-3 text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => openSimulateModal(device)}
                                                    >
                                                        <Fingerprint className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                        Clock-In Test
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(`/zkteco-devices/${device.id}`)}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Terminal
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePing(device.id)}>
                                                                <Radio className="mr-2 h-4 w-4" />
                                                                Test Connection (Ping)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSync(device.id)}>
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                Sync Attendance Logs
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(`/zkteco-devices/${device.id}/edit`)}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Configuration
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => setDeleteId(device.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remove Device
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
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
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            {/* Simulate Teacher Clock-In Modal */}
            <Dialog open={simulateDevice !== null} onOpenChange={(open) => !open && setSimulateDevice(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-primary" />
                            Simulate Classroom Clock-In
                        </DialogTitle>
                        <DialogDescription>
                            Test room-verified attendance on{' '}
                            <span className="font-semibold text-foreground">
                                {simulateDevice?.device_name}
                            </span>{' '}
                            bound to{' '}
                            <span className="font-semibold text-foreground">
                                {simulateDevice?.classroom
                                    ? `${simulateDevice.classroom.building} ${simulateDevice.classroom.room_number}`
                                    : 'Assigned Classroom'}
                            </span>
                            . The teacher will only be marked present if their scheduled subject at this time is assigned to this exact classroom.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSimulatedPunch} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Quick Select Faculty Member</Label>
                            <Select
                                value={punchForm.data.biometric_pin}
                                onValueChange={(val) => punchForm.setData('biometric_pin', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a teacher or enter PIN below..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => {
                                        const pinValue = t.biometric_pin || t.employee_id;
                                        return (
                                            <SelectItem key={t.id} value={pinValue}>
                                                {t.full_name} ({t.employee_id}
                                                {t.biometric_pin ? ` · PIN: ${t.biometric_pin}` : ''})
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="biometric_pin">Biometric PIN / Employee ID</Label>
                                <Input
                                    id="biometric_pin"
                                    value={punchForm.data.biometric_pin}
                                    onChange={(e) => punchForm.setData('biometric_pin', e.target.value)}
                                    placeholder="e.g. T-0001 or 1001"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="punch_time">Punch Date & Time</Label>
                                <Input
                                    id="punch_time"
                                    type="datetime-local"
                                    value={punchForm.data.punch_time}
                                    onChange={(e) => punchForm.setData('punch_time', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Verification Method</Label>
                                <Select
                                    value={punchForm.data.verify_type}
                                    onValueChange={(val) => punchForm.setData('verify_type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fingerprint">Fingerprint Sensor</SelectItem>
                                        <SelectItem value="face">Facial Recognition</SelectItem>
                                        <SelectItem value="rfid_card">RFID Badge</SelectItem>
                                        <SelectItem value="password">PIN Password</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Punch State</Label>
                                <Select
                                    value={punchForm.data.punch_type}
                                    onValueChange={(val) => punchForm.setData('punch_type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Auto Detect (In / Out)</SelectItem>
                                        <SelectItem value="check_in">Time In (Check-In)</SelectItem>
                                        <SelectItem value="check_out">Time Out (Check-Out)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSimulateDevice(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={punchForm.processing}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Verify & Record Punch
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove ZKTeco Device"
                description="Are you sure you want to remove this ZKTeco terminal? Its bound classroom will become unassigned."
            />
        </>
    );
}

ZktecoDevicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
