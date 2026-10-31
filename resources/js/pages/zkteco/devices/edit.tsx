import { Head, Link, useForm } from '@inertiajs/react';
import { DoorOpen, Network, Save, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ClassroomOption {
    id: number;
    building: string;
    room_number: string;
    room_name?: string | null;
    room_type: string;
    is_assigned: boolean;
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
    is_active: boolean;
    notes?: string | null;
}

interface Props {
    device: DeviceData;
    classrooms: ClassroomOption[];
}

export default function ZktecoDeviceEdit({ device, classrooms }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Biometric Devices', href: '/zkteco-devices' },
        { title: device.device_name, href: `/zkteco-devices/${device.id}` },
        { title: 'Edit Configuration', href: `/zkteco-devices/${device.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        classroom_id: String(device.classroom_id),
        device_name: device.device_name || '',
        ip_address: device.ip_address || '',
        port: device.port || 4370,
        comm_key: device.comm_key || '',
        serial_number: device.serial_number || '',
        model_name: device.model_name || '',
        connection_type: device.connection_type || 'tcp',
        is_active: Boolean(device.is_active),
        notes: device.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/zkteco-devices/${device.id}`);
    };

    return (
        <>
            <Head title={`Edit ${device.device_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit ZKTeco Device Configuration
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update classroom binding or network endpoint settings for {device.device_name}.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                            <div className="flex items-start gap-3 border-b border-border pb-4">
                                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                    <DoorOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        1-to-1 Classroom Assignment
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Each ZKTeco device can only apply to one classroom.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="classroom_id">
                                        Assigned Classroom <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={String(data.classroom_id)}
                                        onValueChange={(val) => setData('classroom_id', val)}
                                    >
                                        <SelectTrigger id="classroom_id">
                                            <SelectValue placeholder="Select a classroom..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={String(c.id)}
                                                    disabled={c.is_assigned}
                                                >
                                                    {c.building} {c.room_number}
                                                    {c.room_name ? ` — ${c.room_name}` : ''}
                                                    {c.is_assigned ? ' (Already has a bound device)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.classroom_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="device_name">
                                        Device Terminal Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="device_name"
                                        value={data.device_name}
                                        onChange={(e) => setData('device_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.device_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model_name">ZKTeco Model</Label>
                                    <Input
                                        id="model_name"
                                        value={data.model_name}
                                        onChange={(e) => setData('model_name', e.target.value)}
                                    />
                                    <InputError message={errors.model_name} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                            <div className="flex items-start gap-3 border-b border-border pb-4">
                                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                    <Network className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Network & Communication Protocol
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Configure LAN socket parameters (port 4370) or ADMS Push serial number.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="ip_address">
                                        IP Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="ip_address"
                                        value={data.ip_address}
                                        onChange={(e) => setData('ip_address', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.ip_address} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="port">
                                        TCP/UDP Port <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="port"
                                        type="number"
                                        value={data.port}
                                        onChange={(e) => setData('port', Number(e.target.value))}
                                        required
                                    />
                                    <InputError message={errors.port} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="connection_type">Protocol Mode</Label>
                                    <Select
                                        value={data.connection_type}
                                        onValueChange={(val) =>
                                            setData('connection_type', val as 'tcp' | 'udp' | 'push')
                                        }
                                    >
                                        <SelectTrigger id="connection_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tcp">TCP Socket (Standard)</SelectItem>
                                            <SelectItem value="udp">UDP Socket</SelectItem>
                                            <SelectItem value="push">ADMS Cloud Push (/iclock/cdata)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.connection_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serial_number">Device Serial Number (SN)</Label>
                                    <Input
                                        id="serial_number"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                    />
                                    <InputError message={errors.serial_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comm_key">Comm Key / Password</Label>
                                    <Input
                                        id="comm_key"
                                        value={data.comm_key}
                                        onChange={(e) => setData('comm_key', e.target.value)}
                                    />
                                    <InputError message={errors.comm_key} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Installation Notes / Door Location</Label>
                                <Textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">
                                    Terminal Status
                                </h3>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                    Device is active for room attendance
                                </Label>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-border pt-4">
                                <Button type="submit" disabled={processing} className="w-full">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/zkteco-devices/${device.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

ZktecoDeviceEdit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Biometric Devices', href: '/zkteco-devices' },
            { title: 'Edit Configuration', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
