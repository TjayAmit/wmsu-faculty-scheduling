import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    DoorOpen,
    Fingerprint,
    Plus,
    Sparkles,
    Users,
    XCircle,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { index as classrooms, store as classroomsStore } from '@/routes/classrooms';
import type { RoomType } from '@/types';

interface CreateProps {
    roomTypes: (RoomType | string)[];
}

const CAPACITY_PRESETS = ['30', '40', '45', '50', '60', '100'];

const ROOM_TYPE_LABELS: Record<string, string> = {
    classroom: 'Classroom / Lecture',
    lab: 'Laboratory / Studio',
    lecture_hall: 'Lecture Hall / Auditorium',
    office: 'Faculty / Admin Office',
};

export default function Create({ roomTypes = [] }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        building: '',
        room_number: '',
        room_name: '',
        capacity: '40',
        room_type: 'classroom',
        equipment: [] as string[],
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(classroomsStore.url());
    };

    const getRoomTypeValue = (type: RoomType | string): string => {
        return typeof type === 'string' ? type : type.value;
    };

    const getRoomTypeLabel = (type: RoomType | string): string => {
        const val = getRoomTypeValue(type);
        return ROOM_TYPE_LABELS[val] || (typeof type === 'object' && 'label' in type ? type.label : val);
    };

    return (
        <>
            <Head title="Create Classroom" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={classrooms()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Classrooms
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Register New Classroom
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure physical room location, designated title, room classification, and student seating capacity.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <DoorOpen className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Facility & Room Specifications</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Building & Room Number */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="building" className="text-xs font-semibold">
                                                Building / Campus Hall <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="building"
                                                value={data.building}
                                                onChange={(e) => setData('building', e.target.value)}
                                                placeholder="e.g., Education Building"
                                                required
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Facility name or academic building location.
                                            </p>
                                            <InputError message={errors.building} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="room_number" className="text-xs font-semibold">
                                                Room Number <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="room_number"
                                                value={data.room_number}
                                                onChange={(e) => setData('room_number', e.target.value)}
                                                placeholder="e.g., 101, 203, Lab 1"
                                                required
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Unique number/code within the building.
                                            </p>
                                            <InputError message={errors.room_number} />
                                        </div>
                                    </div>

                                    {/* Room Name & Room Type */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="room_name" className="text-xs font-semibold">
                                                Designated Room Name (Optional)
                                            </Label>
                                            <Input
                                                id="room_name"
                                                value={data.room_name}
                                                onChange={(e) => setData('room_name', e.target.value)}
                                                placeholder="e.g., Educational Technology & Media Lab"
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Custom title for specialized laboratories or lecture halls.
                                            </p>
                                            <InputError message={errors.room_name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="room_type" className="text-xs font-semibold">
                                                Room Classification <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.room_type}
                                                onValueChange={(value) => setData('room_type', value)}
                                            >
                                                <SelectTrigger id="room_type" className="text-sm">
                                                    <SelectValue placeholder="Select classification" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((type) => {
                                                        const val = getRoomTypeValue(type);
                                                        return (
                                                            <SelectItem key={val} value={val} className="cursor-pointer">
                                                                {getRoomTypeLabel(type)}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Classroom, laboratory, lecture hall, or department office.
                                            </p>
                                            <InputError message={errors.room_type} />
                                        </div>
                                    </div>

                                    {/* Capacity with Quick Presets */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="capacity" className="text-xs font-semibold">
                                                Student Seating Capacity <span className="text-destructive">*</span>
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Range: 1 – 500 seats
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <div className="w-full sm:w-44">
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    min="1"
                                                    max="500"
                                                    value={data.capacity}
                                                    onChange={(e) => setData('capacity', e.target.value)}
                                                    placeholder="40"
                                                    required
                                                    className="text-sm"
                                                />
                                            </div>
                                            {/* Capacity Quick Presets */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                                                {CAPACITY_PRESETS.map((cap) => (
                                                    <button
                                                        key={cap}
                                                        type="button"
                                                        onClick={() => setData('capacity', cap)}
                                                        className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                                                            data.capacity === cap
                                                                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        {cap}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <InputError message={errors.capacity} />
                                    </div>

                                    {/* Active Checkbox Banner */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                                Active Classroom Facility
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                When enabled, this classroom is available for timetable scheduling, room conflict detection, and biometric device assignment.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium"
                                        >
                                            <Plus className="mr-1.5 h-4 w-4" />
                                            {processing ? 'Creating Classroom…' : 'Create Classroom'}
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={classrooms()}>Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Live Facility Preview & Device Integration */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live Classroom Preview Card */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Facility Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="outline" className="text-xs capitalize font-medium border-primary/20 bg-primary/5 text-primary">
                                            {ROOM_TYPE_LABELS[data.room_type] || data.room_type}
                                        </Badge>
                                        {data.is_active ? (
                                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5 px-1.5 gap-1 shadow-none">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-base text-foreground leading-snug">
                                            {data.building.trim() || 'Building Name'}
                                            {data.room_number.trim() ? ` - Rm ${data.room_number}` : ' - Room TBA'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {data.room_name.trim() || 'Standard Academic Lecture Space'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>Capacity: <strong className="text-foreground">{data.capacity || '40'} seats</strong></span>
                                        </span>
                                        <span className="text-[11px] text-muted-foreground font-mono">
                                            WMSU Campus
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Simulation of how this room card appears in timetable scheduling and campus directory views.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Attendance & Biometric Integration Guidelines */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Campus Hardware Integration
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Biometric Tracking:</strong> After creation, pair this room with a physical ZKTeco attendance device in the <Link href="/zkteco/devices" className="text-primary hover:underline font-medium">ZKTeco Devices</Link> module.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Conflict Prevention:</strong> System automatically monitors time slot overlaps to prevent double-booking room venues.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Seating Allocation:</strong> Course sections assigned to this room should not exceed the registered student seating capacity.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Classrooms', href: classrooms() },
            { title: 'Register Classroom', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
