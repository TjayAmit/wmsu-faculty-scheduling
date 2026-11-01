import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Cookie,
    DoorOpen,
    ExternalLink,
    Laptop,
    Power,
    QrCode,
    Search,
    ShieldCheck,
    Sparkles,
    Trash2,
    Unlink,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { QrPassModal, type QrPassTeacher } from '@/components/qr-pass-modal';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ClassroomOption {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    label: string;
}

interface KioskItem {
    id: number;
    kiosk_name: string;
    classroom_id: number;
    classroom?: {
        id: number;
        building: string;
        room_number: string;
        room_name?: string | null;
    } | null;
    browser_name?: string | null;
    ip_address?: string | null;
    registered_by_name: string;
    registered_at?: string | null;
    last_used_at?: string | null;
    scans_count: number;
    is_active: boolean;
    notes?: string | null;
    is_this_browser: boolean;
}

interface CurrentBrowserKiosk {
    id: number;
    kiosk_name: string;
    classroom_id: number;
    classroom_label: string;
    browser_name?: string | null;
    is_active: boolean;
    registered_at?: string | null;
}

interface Props {
    kiosks: KioskItem[];
    classrooms: ClassroomOption[];
    teachers: QrPassTeacher[];
    currentBrowserKiosk: CurrentBrowserKiosk | null;
    detectedBrowser: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Biometric Attendance', href: '/zkteco-devices' },
    { title: 'QR Kiosk Terminals', href: '/qr-kiosks' },
];

export default function QrKiosksIndex({
    kiosks,
    classrooms,
    teachers,
    currentBrowserKiosk,
    detectedBrowser,
}: Props) {
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<KioskItem | null>(null);
    const [selectedTeacherPass, setSelectedTeacherPass] = useState<QrPassTeacher | null>(null);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'kiosks' | 'passes'>('kiosks');

    const { data, setData, post, processing, errors } = useForm({
        classroom_id: currentBrowserKiosk ? String(currentBrowserKiosk.classroom_id) : '',
        kiosk_name: currentBrowserKiosk ? currentBrowserKiosk.kiosk_name : '',
        notes: '',
        launch_scanner: false,
    });

    const handleClassroomSelect = (val: string) => {
        const room = classrooms.find((c) => String(c.id) === val);
        const suggestedName = room
            ? `${room.building} ${room.room_number} — ${detectedBrowser}`
            : data.kiosk_name;
        setData({
            ...data,
            classroom_id: val,
            kiosk_name: suggestedName,
        });
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/qr-kiosks/register-browser', {
            onSuccess: () => setRegisterDialogOpen(false),
        });
    };

    const handleUnregisterThisBrowser = () => {
        router.post('/qr-kiosks/unregister-browser');
    };

    const handleToggleKiosk = (kiosk: KioskItem) => {
        router.post(`/qr-kiosks/${kiosk.id}/toggle`, {}, { preserveScroll: true });
    };

    const filteredTeachers = teachers.filter((t) => {
        const q = teacherSearch.toLowerCase().trim();
        if (!q) return true;
        return (
            t.full_name.toLowerCase().includes(q) ||
            t.employee_id.toLowerCase().includes(q) ||
            (t.department && t.department.toLowerCase().includes(q))
        );
    });

    return (
        <>
            <Head title="Classroom QR Kiosk Terminals" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Classroom QR Kiosk Terminals
                            </h1>
                            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs">
                                Biometric Alternative
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Register this device&apos;s browser via encrypted session cookie to a specific classroom for single-scan QR clock-in.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="h-9 gap-2">
                            <Link href="/kiosk/scanner">
                                <ExternalLink className="size-4" />
                                Open Kiosk Scanner Page
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 gap-2"
                            onClick={() => setRegisterDialogOpen(true)}
                        >
                            <Cookie className="size-4" />
                            {currentBrowserKiosk ? 'Rebind This Browser' : 'Register This Browser'}
                        </Button>
                    </div>
                </div>

                {/* 2. This Browser Registration Banner Card */}
                <div
                    className={`rounded-xl border p-5 shadow-xs transition-all ${
                        currentBrowserKiosk
                            ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                            : 'border-primary/30 bg-primary/5'
                    }`}
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div
                                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                    currentBrowserKiosk
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-primary/15 text-primary'
                                }`}
                            >
                                <Laptop className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-bold text-foreground">
                                        {currentBrowserKiosk
                                            ? `This Browser is Registered to ${currentBrowserKiosk.classroom_label}`
                                            : 'This Browser is Not Registered as a Classroom Kiosk Yet'}
                                    </h2>
                                    {currentBrowserKiosk ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                                            <CheckCircle2 className="size-3" />
                                            Cookie Bound & Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[11px] font-mono">
                                            Detected: {detectedBrowser}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground max-w-3xl">
                                    {currentBrowserKiosk ? (
                                        <>
                                            Terminal Name: <strong className="text-foreground">{currentBrowserKiosk.kiosk_name}</strong> &bull; Registered on{' '}
                                            {currentBrowserKiosk.registered_at}. Teachers can now scan their QR pass on{' '}
                                            <code className="text-foreground font-mono">/kiosk/scanner</code> in this browser without logging in, and a single clock-in marks them <strong>Present</strong>.
                                        </>
                                    ) : (
                                        <>
                                            To use this computer or tablet as a classroom QR clock-in kiosk, click <strong>Register This Browser</strong> and select the classroom. An encrypted cookie will bind this browser to that classroom so the public scanner page works outside authenticated routes.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {currentBrowserKiosk ? (
                                <>
                                    <Button asChild size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                                        <Link href="/kiosk/scanner">
                                            <QrCode className="size-4" />
                                            Launch Classroom Scanner
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs"
                                        onClick={() => setRegisterDialogOpen(true)}
                                    >
                                        Change Classroom
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                                        onClick={handleUnregisterThisBrowser}
                                    >
                                        <Unlink className="size-3.5" />
                                        Unbind Browser
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 gap-2"
                                    onClick={() => setRegisterDialogOpen(true)}
                                >
                                    <Sparkles className="size-4" />
                                    Bind This Browser to a Classroom
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Navigation Tabs: Registered Kiosks vs Faculty QR Passes */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={activeTab === 'kiosks' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => setActiveTab('kiosks')}
                        >
                            <Laptop className="size-3.5" />
                            Registered Browser Terminals ({kiosks.length})
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'passes' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => setActiveTab('passes')}
                        >
                            <Users className="size-3.5" />
                            Faculty QR Passes ({teachers.length})
                        </Button>
                    </div>
                </div>

                {activeTab === 'kiosks' ? (
                    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                            Kiosk Terminal & Browser
                                        </TableHead>
                                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                            Bound Classroom
                                        </TableHead>
                                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                            Registered By
                                        </TableHead>
                                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                            Scans & Activity
                                        </TableHead>
                                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase">
                                            Status
                                        </TableHead>
                                        <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kiosks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-44 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <QrCode className="size-8 opacity-40" />
                                                    <p className="text-sm font-medium text-foreground">
                                                        No classroom browsers registered yet
                                                    </p>
                                                    <p className="text-xs max-w-md">
                                                        Open this page on the classroom tablet or computer browser and click &ldquo;Register This Browser&rdquo; to bind it to a classroom.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kiosks.map((kiosk) => (
                                            <TableRow key={kiosk.id}>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground text-sm">
                                                            {kiosk.kiosk_name}
                                                        </span>
                                                        {kiosk.is_this_browser && (
                                                            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] h-4.5">
                                                                This Browser
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {kiosk.browser_name || 'Web Browser'}
                                                        {kiosk.ip_address ? ` • IP: ${kiosk.ip_address}` : ''}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-4 py-3">
                                                    {kiosk.classroom ? (
                                                        <Badge variant="outline" className="gap-1.5 font-medium">
                                                            <DoorOpen className="size-3.5 text-primary" />
                                                            {kiosk.classroom.building} — Room {kiosk.classroom.room_number}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Unassigned</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-xs">
                                                    <div className="font-medium text-foreground">
                                                        {kiosk.registered_by_name}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {kiosk.registered_at || '—'}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-xs">
                                                    <div className="font-semibold text-foreground">
                                                        {kiosk.scans_count} clock-in{kiosk.scans_count === 1 ? '' : 's'}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Last used: {kiosk.last_used_at || 'Never'}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-4 py-3">
                                                    {kiosk.is_active ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1">
                                                            <ShieldCheck className="size-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Disabled</Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() => handleToggleKiosk(kiosk)}
                                                        >
                                                            <Power className="size-3.5 mr-1" />
                                                            {kiosk.is_active ? 'Disable' : 'Enable'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => setDeleteTarget(kiosk)}
                                                            title="Revoke & Delete Kiosk"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    /* Faculty QR Passes Tab */
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-sm w-full">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={teacherSearch}
                                    onChange={(e) => setTeacherSearch(e.target.value)}
                                    placeholder="Search faculty by name, ID, or department..."
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Click any instructor to view, copy, download, or print their official Classroom QR Clock-In Pass.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition-all"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm text-foreground">
                                                {teacher.full_name}
                                            </h3>
                                            <Badge variant="outline" className="font-mono text-[10px]">
                                                {teacher.employee_id}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {teacher.department || 'Faculty'}
                                            {teacher.rank ? ` • ${teacher.rank}` : ''}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                                        <code className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                                            {teacher.qr_payload}
                                        </code>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                            onClick={() => setSelectedTeacherPass(teacher)}
                                        >
                                            <QrCode className="size-3.5" />
                                            QR Pass
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Register This Browser Modal */}
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
                    <form onSubmit={handleRegisterSubmit}>
                        <DialogHeader className="p-6 pb-4 border-b border-border/80">
                            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Cookie className="size-5 text-primary" />
                                Register This Browser as Classroom Kiosk
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-1">
                                Binds this specific browser ({detectedBrowser}) via an encrypted cookie session to the selected classroom.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="kiosk_classroom_id" className="text-xs font-semibold">
                                    Assigned Classroom <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.classroom_id}
                                    onValueChange={handleClassroomSelect}
                                >
                                    <SelectTrigger id="kiosk_classroom_id" className="w-full text-xs h-9">
                                        <SelectValue placeholder="Select classroom for this kiosk browser" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {classrooms.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.classroom_id && (
                                    <p className="text-xs text-destructive">{errors.classroom_id}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="kiosk_name" className="text-xs font-semibold">
                                    Kiosk Terminal Label <span className="text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Input
                                    id="kiosk_name"
                                    value={data.kiosk_name}
                                    onChange={(e) => setData('kiosk_name', e.target.value)}
                                    placeholder="e.g. Education Building 102 — Front Desk Tablet"
                                    className="h-9 text-xs"
                                />
                                {errors.kiosk_name && (
                                    <p className="text-xs text-destructive">{errors.kiosk_name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="kiosk_notes" className="text-xs font-semibold">
                                    Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="kiosk_notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional deployment remarks for this classroom browser..."
                                    rows={2}
                                    className="text-xs resize-none"
                                />
                            </div>

                            <label className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/30 p-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.launch_scanner}
                                    onChange={(e) => setData('launch_scanner', e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-xs font-medium text-foreground">
                                    Launch the public Kiosk Scanner (<code className="font-mono">/kiosk/scanner</code>) immediately after registration
                                </span>
                            </label>
                        </div>

                        <DialogFooter className="p-4 sm:p-6 sm:pt-4 border-t border-border/80 bg-muted/20 gap-2 flex-row justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs"
                                onClick={() => setRegisterDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 text-xs gap-1.5"
                                disabled={processing || !data.classroom_id}
                            >
                                <Cookie className="size-3.5" />
                                Register Browser & Save Cookie
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Revoke Dialog */}
            <ConfirmDeleteDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Revoke Classroom QR Kiosk"
                description={`Are you sure you want to revoke "${deleteTarget?.kiosk_name}"? That browser will no longer be authorized to scan QR attendance until re-registered by an Admin.`}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/qr-kiosks/${deleteTarget.id}`, {
                            onSuccess: () => setDeleteTarget(null),
                        });
                    }
                }}
            />

            {/* Teacher QR Pass Modal */}
            <QrPassModal
                open={Boolean(selectedTeacherPass)}
                onOpenChange={(open) => !open && setSelectedTeacherPass(null)}
                teacher={selectedTeacherPass}
            />
        </>
    );
}

QrKiosksIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
