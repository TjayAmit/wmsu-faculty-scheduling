import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { index as timeSlots, show as timeSlotsShow, update as timeSlotsUpdate } from '@/routes/time-slots';
import type { TimeSlotsFormProps } from '@/types';

const DURATION_PRESETS = [
    { label: '1.0 hr', hours: 1.0, minutes: 60 },
    { label: '1.5 hrs', hours: 1.5, minutes: 90 },
    { label: '2.0 hrs', hours: 2.0, minutes: 120 },
    { label: '2.5 hrs', hours: 2.5, minutes: 150 },
    { label: '3.0 hrs', hours: 3.0, minutes: 180 },
    { label: '4.0 hrs', hours: 4.0, minutes: 240 },
];

function formatTo12Hour(time24: string): string {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function addMinutesToTime(time24: string, minutesToAdd: number): string {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return '';
    const totalMinutes = h * 60 + m + minutesToAdd;
    const endMinutes = totalMinutes % (24 * 60);
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

function calculateMinutes(start: string, end: string): number | null {
    if (!start || !end) return null;
    const [shStr, smStr] = start.split(':');
    const [ehStr, emStr] = end.split(':');
    const sh = parseInt(shStr, 10);
    const sm = parseInt(smStr, 10);
    const eh = parseInt(ehStr, 10);
    const em = parseInt(emStr, 10);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return endMins - startMins;
}

const BASE_TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
        const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        BASE_TIME_OPTIONS.push({
            value: time24,
            label: formatTo12Hour(time24),
        });
    }
}
BASE_TIME_OPTIONS.push({ value: '22:00', label: '10:00 PM' });

export default function Edit({ timeSlot }: TimeSlotsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: timeSlot?.name || '',
        start_time: timeSlot?.start_time || '07:30',
        end_time: timeSlot?.end_time || '09:00',
        is_active: timeSlot?.is_active ?? true,
    });

    const [activeDuration, setActiveDuration] = useState<number | null>(() => {
        return calculateMinutes(timeSlot?.start_time || '', timeSlot?.end_time || '');
    });

    const durationMinutes = calculateMinutes(data.start_time, data.end_time);
    const isValidDuration = durationMinutes !== null && durationMinutes > 0;
    const formattedDuration = isValidDuration
        ? durationMinutes % 60 === 0
            ? `${durationMinutes / 60} hr${durationMinutes / 60 > 1 ? 's' : ''}`
            : `${(durationMinutes / 60).toFixed(1)} hrs (${durationMinutes} mins)`
        : null;

    const generateSuggestedName = (start: string, end: string, mins: number | null) => {
        if (!start || !end || !mins || mins <= 0) return '';
        const start12 = formatTo12Hour(start);
        const end12 = formatTo12Hour(end);
        const hrs = (mins / 60).toFixed(1).replace('.0', '');
        return `${start12} – ${end12} (${hrs}h)`;
    };

    const handleSelectDuration = (minutes: number) => {
        setActiveDuration(minutes);
        const startTime = data.start_time || '07:30';
        const calculatedEndTime = addMinutesToTime(startTime, minutes);
        setData((prev) => ({
            ...prev,
            start_time: startTime,
            end_time: calculatedEndTime,
        }));
    };

    const handleStartTimeChange = (newStartTime: string) => {
        if (activeDuration) {
            const calculatedEndTime = addMinutesToTime(newStartTime, activeDuration);
            setData((prev) => ({
                ...prev,
                start_time: newStartTime,
                end_time: calculatedEndTime,
            }));
        } else {
            setData('start_time', newStartTime);
        }
    };

    const handleEndTimeChange = (newEndTime: string) => {
        const mins = calculateMinutes(data.start_time, newEndTime);
        const matchingPreset = DURATION_PRESETS.find((p) => p.minutes === mins);
        setActiveDuration(matchingPreset ? matchingPreset.minutes : null);
        setData('end_time', newEndTime);
    };

    const handleAutoName = () => {
        if (data.start_time && data.end_time && isValidDuration) {
            const suggested = generateSuggestedName(data.start_time, data.end_time, durationMinutes);
            setData('name', suggested);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (timeSlot) {
            put(timeSlotsUpdate.url(timeSlot.id));
        }
    };

    const startOptions = [...BASE_TIME_OPTIONS];
    if (data.start_time && !startOptions.some((o) => o.value === data.start_time)) {
        startOptions.push({ value: data.start_time, label: formatTo12Hour(data.start_time) });
        startOptions.sort((a, b) => a.value.localeCompare(b.value));
    }

    const endOptions = [...BASE_TIME_OPTIONS];
    if (data.end_time && !endOptions.some((o) => o.value === data.end_time)) {
        endOptions.push({ value: data.end_time, label: formatTo12Hour(data.end_time) });
        endOptions.sort((a, b) => a.value.localeCompare(b.value));
    }

    return (
        <>
            <Head title={`Edit Time Slot - ${timeSlot?.name || 'Time Slot'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={timeSlot ? timeSlotsShow(timeSlot.id) : timeSlots()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl border border-border shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Edit Time Slot</CardTitle>
                        <CardDescription className="text-xs">
                            Update teaching period boundaries, duration, and operational status.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Fast Duration Presets */}
                            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="size-3.5 text-primary" />
                                        <span className="text-xs font-semibold text-foreground">
                                            Quick Duration Adjust
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        Click preset to auto-set end time
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {DURATION_PRESETS.map((preset) => {
                                        const isSelected =
                                            activeDuration === preset.minutes ||
                                            (isValidDuration && durationMinutes === preset.minutes);

                                        return (
                                            <button
                                                key={preset.minutes}
                                                type="button"
                                                onClick={() => handleSelectDuration(preset.minutes)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                        : 'bg-background hover:bg-muted text-foreground border-border'
                                                }`}
                                            >
                                                {isSelected && <Check className="size-3" />}
                                                {preset.label}
                                                <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                    ({preset.minutes}m)
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Start and Flexible End Time using existing Select component */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="start_time" className="text-xs font-medium">
                                        Start Time <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.start_time}
                                        onValueChange={handleStartTimeChange}
                                    >
                                        <SelectTrigger id="start_time" className="h-9 text-xs">
                                            <SelectValue placeholder="Select start time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {startOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.start_time} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="end_time" className="text-xs font-medium">
                                        End Time (Flexible) <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.end_time}
                                        onValueChange={handleEndTimeChange}
                                    >
                                        <SelectTrigger id="end_time" className="h-9 text-xs">
                                            <SelectValue placeholder="Select end time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {endOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.end_time} />

                                    {/* Duration Indicator */}
                                    <div className="pt-1">
                                        {isValidDuration ? (
                                            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                                                <Clock className="size-3.5" />
                                                <span>Calculated Duration: <strong>{formattedDuration}</strong></span>
                                            </div>
                                        ) : data.start_time && data.end_time ? (
                                            <div className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-xs text-destructive">
                                                <AlertCircle className="size-3.5" />
                                                <span>End time must be after start time</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Name */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="name" className="text-xs font-medium">
                                        Time Slot Name <span className="text-destructive">*</span>
                                    </Label>
                                    {isValidDuration && (
                                        <button
                                            type="button"
                                            onClick={handleAutoName}
                                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                                        >
                                            <Sparkles className="size-3" />
                                            Auto-fill with times
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Morning Session 7:30 - 10:30"
                                    required
                                    className="h-9 text-xs"
                                    aria-invalid={!!errors.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/20 p-3">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    className="mt-0.5"
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="text-xs font-medium cursor-pointer">
                                        Active time slot for class scheduling
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">
                                        Available in timetable selectors and faculty schedule matrices.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing} className="text-xs font-semibold min-w-32">
                                    {processing ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild className="text-xs">
                                    <Link href={timeSlot ? timeSlotsShow(timeSlot.id) : timeSlots()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Time Slots', href: timeSlots() },
            { title: 'Edit Time Slot', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
