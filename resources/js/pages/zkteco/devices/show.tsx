import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    DoorOpen,
    Fingerprint,
    Network,
    Pencil,
    Radio,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
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

interface ClassroomData {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    capacity: number;
}

interface DeviceData {
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
    classroom?: ClassroomData | null;
}

interface LogEntry {
    id: number;
    biometric_pin: string;
    punch_time: string;
    punch_type: string;
    verify_type: string;
    match_status: 'matched' | 'mismatched_room' | 'no_scheduled_class' | 'teacher_not_found' | 'duplicate_ignored';
    rejection_reason?: string | null;
    teacher?: {
        id: number;
        full_name: string;
        employee_id: string;
    } | null;
    teacher_schedule?: {
        id: number;
        room?: string | null;
        section?: string | null;
        subject?: {
            code: string;
            title: string;
        } | null;
    } | null;
}

interface TeacherOption {
    id: number;
    full_name: string;
    employee_id: string;
    biometric_pin?: string | null;
}

interface Props {
    device: DeviceData;
    recentLogs: LogEntry[];
    logStats: {
        total_punches: number;
        matched_present: number;
        mismatched_room: number;
        no_schedule: number;
    };
    teachers: TeacherOption[];
}

export default function ZktecoDeviceShow({ device, recentLogs, logStats, teachers }: Props) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSimulate, setShowSimulate] = useState(false);

    const punchForm = useForm({
        biometric_pin: teachers[0]?.biometric_pin || teachers[0]?.employee_id || '',
        punch_time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16),
        verify_type: 'fingerprint',
        punch_type: 'auto',
    });

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/zkteco-devices/${device.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handlePing = () => {
        router.post(`/zkteco-devices/${device.id}/ping`, {}, { preserveScroll: true });
    };

    const handleSync = () => {
        router.post(`/zkteco-devices/${device.id}/sync`, {}, { preserveScroll: true });
    };

    const handleSimulateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        punchForm.post(`/zkteco-devices/${device.id}/simulate-punch`, {
            preserveScroll: true,
            onSuccess: () => setShowSimulate(false),
        });
    };

    const renderMatchBadge = (status: LogEntry['match_status']) => {
        switch (status) {
            case 'matched':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Present
                    </Badge>
                );
            case 'mismatched_room':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Wrong Classroom
                    </Badge>
                );
            case 'no_scheduled_class':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        No Scheduled Class
                    </Badge>
                );
            case 'teacher_not_found':
                return (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1">
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
            <Head title={`${device.device_name} - ZKTeco Terminal`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {device.device_name}
                            </h1>
                            {device.status === 'online' ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1.5">
                                    <Wifi className="h-3 w-3" />
                                    Online
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="gap-1.5">
                                    <WifiOff className="h-3 w-3" />
                                    {device.status}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Bound exclusively to{' '}
                            <span className="font-semibold text-foreground">
                                {device.classroom
                                    ? `${device.classroom.building} ${device.classroom.room_number}`
                                    : 'Unassigned Classroom'}
                            </span>{' '}
                            · Endpoint: {device.ip_address}:{device.port} ({device.connection_type.toUpperCase()})
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="default" size="sm" onClick={() => setShowSimulate(true)}>
                            <Fingerprint className="mr-1.5 h-4 w-4" />
                            Simulate Clock-In
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePing}>
                            <Radio className="mr-1.5 h-4 w-4" />
                            Test Ping
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSync}>
                            <RefreshCw className="mr-1.5 h-4 w-4" />
                            Sync Logs
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/zkteco-devices/${device.id}/edit`}>
                                <Pencil className="mr-1.5 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* 2. Stats & Hardware Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Total Punches on Device
                        </span>
                        <div className="mt-2 text-2xl font-bold text-foreground">
                            {logStats.total_punches}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Verified Present (Right Room)
                        </span>
                        <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {logStats.matched_present}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Wrong Classroom Rejected
                        </span>
                        <div className="mt-2 text-2xl font-bold text-destructive">
                            {logStats.mismatched_room}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Off-Schedule Punches
                        </span>
                        <div className="mt-2 text-2xl font-bold text-foreground">
                            {logStats.no_schedule}
                        </div>
                    </div>
                </div>

                {/* 3. Details Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                            <DoorOpen className="h-5 w-5 text-primary" />
                            <h2 className="text-base font-semibold text-foreground">
                                Assigned Classroom (1:1)
                            </h2>
                        </div>
                        {device.classroom ? (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Building & Room</span>
                                    <Link
                                        href={`/classrooms/${device.classroom.id}`}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        {device.classroom.building} {device.classroom.room_number}
                                    </Link>
                                </div>
                                {device.classroom.room_name && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Name</span>
                                        <span className="font-medium">{device.classroom.room_name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Seating Capacity</span>
                                    <span className="font-medium">{device.classroom.capacity} seats</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No classroom bound.</p>
                        )}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 lg:col-span-2">
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                            <Network className="h-5 w-5 text-primary" />
                            <h2 className="text-base font-semibold text-foreground">
                                Hardware & Network Specifications
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">IP & Port</p>
                                <p className="mt-1 font-mono font-semibold">
                                    {device.ip_address}:{device.port}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Hardware Model</p>
                                <p className="mt-1 font-medium">{device.model_name || 'ZKTeco Standard'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Serial Number</p>
                                <p className="mt-1 font-mono">{device.serial_number || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Protocol Mode</p>
                                <p className="mt-1 uppercase font-medium">{device.connection_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Last Synced</p>
                                <p className="mt-1 font-medium">
                                    {device.last_sync_at ? fmtDate(device.last_sync_at) : 'Never'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Last Heartbeat</p>
                                <p className="mt-1 font-medium">
                                    {device.last_heartbeat_at ? fmtDate(device.last_heartbeat_at) : 'No heartbeat yet'}
                                </p>
                            </div>
                        </div>
                        {device.notes && (
                            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                                <strong>Notes:</strong> {device.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Recent Classroom Punch Logs */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Recent Biometric Punches in this Classroom
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Shows faculty clock-ins on this terminal and whether their subject schedule matched this room.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/zkteco-logs?zkteco_device_id=${device.id}`}>
                                View All Logs
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Punch Time
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Faculty Member
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Scheduled Subject
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Verification Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                        Audit Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                                            No attendance punches recorded on this device yet. Click "Simulate Clock-In" above to test room verification.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                                                {new Date(log.punch_time).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {log.teacher ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {log.teacher.full_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            ID: {log.teacher.employee_id} · PIN: {log.biometric_pin}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Unrecognized PIN: <code>{log.biometric_pin}</code>
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {log.teacher_schedule?.subject ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {log.teacher_schedule.subject.code} — {log.teacher_schedule.subject.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Scheduled Room: {log.teacher_schedule.room || 'N/A'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {renderMatchBadge(log.match_status)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-xs text-muted-foreground max-w-md">
                                                {log.rejection_reason || 'Verified present in assigned classroom.'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Simulate Punch Modal */}
            <Dialog open={showSimulate} onOpenChange={setShowSimulate}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-primary" />
                            Simulate Clock-In on {device.device_name}
                        </DialogTitle>
                        <DialogDescription>
                            Classroom:{' '}
                            <strong>
                                {device.classroom
                                    ? `${device.classroom.building} ${device.classroom.room_number}`
                                    : 'Assigned Room'}
                            </strong>
                            . Teacher will only be marked present if their subject at the chosen time is scheduled in this classroom.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSimulateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Faculty Member</Label>
                            <Select
                                value={punchForm.data.biometric_pin}
                                onValueChange={(val) => punchForm.setData('biometric_pin', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a teacher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => {
                                        const pinVal = t.biometric_pin || t.employee_id;
                                        return (
                                            <SelectItem key={t.id} value={pinVal}>
                                                {t.full_name} ({t.employee_id})
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Biometric PIN / Employee ID</Label>
                                <Input
                                    value={punchForm.data.biometric_pin}
                                    onChange={(e) => punchForm.setData('biometric_pin', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Punch Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={punchForm.data.punch_time}
                                    onChange={(e) => punchForm.setData('punch_time', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowSimulate(false)}>
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
                open={showDelete}
                onOpenChange={setShowDelete}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove ZKTeco Device"
                description="Are you sure you want to delete this ZKTeco device? The classroom will become unassigned."
            />
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Biometric Devices', href: '/zkteco-devices' },
    { title: 'Device Details', href: '#' },
];

ZktecoDeviceShow.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
