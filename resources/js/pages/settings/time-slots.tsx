import { Head, useForm } from '@inertiajs/react';
import { Clock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { store as timeSlotsStore } from '@/routes/time-slots';
import type { TimeSlot } from '@/types';

interface TimeSlotsProps {
    timeSlots?: TimeSlot[];
}

const DURATION_PRESETS = [
    { label: '1.0 hr', hours: 1.0, minutes: 60 },
    { label: '1.5 hrs', hours: 1.5, minutes: 90 },
    { label: '2.0 hrs', hours: 2.0, minutes: 120 },
    { label: '2.5 hrs', hours: 2.5, minutes: 150 },
    { label: '3.0 hrs', hours: 3.0, minutes: 180 },
    { label: '4.0 hrs', hours: 4.0, minutes: 240 },
];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

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

function parse24Hour(value: string) {
    if (!value) return { hour: '07', minute: '00', period: 'AM' as 'AM' | 'PM' };
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return { hour: '07', minute: '00', period: 'AM' as 'AM' | 'PM' };
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const hour = h12.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    return { hour, minute, period };
}

function to24Hour(hour12: string, minute: string, period: 'AM' | 'PM'): string {
    let h = parseInt(hour12, 10);
    if (isNaN(h)) h = 7;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const m = parseInt(minute, 10) || 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

interface TimeSectionPickerProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

function TimeSectionPicker({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
}: TimeSectionPickerProps) {
    const { hour, minute, period } = parse24Hour(value);

    const handleHourChange = (newHour: string) => {
        onChange(to24Hour(newHour, minute, period));
    };

    const handleMinuteChange = (newMinute: string) => {
        onChange(to24Hour(hour, newMinute, period));
    };

    const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
        onChange(to24Hour(hour, minute, newPeriod));
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-xs font-medium">
                    {label} {required && <span className="text-destructive">*</span>}
                </Label>
                {value ? (
                    <Badge variant="outline" className="text-xs font-semibold bg-background">
                        {formatTo12Hour(value)}
                    </Badge>
                ) : (
                    <span className="text-[11px] text-muted-foreground italic">Not set</span>
                )}
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                    {/* Hour Select with existing Select component */}
                    <div className="flex-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                            Hour
                        </span>
                        <Select value={hour} onValueChange={handleHourChange}>
                            <SelectTrigger id={id} className="h-9 text-xs justify-center font-medium">
                                <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {HOURS.map((h) => (
                                    <SelectItem key={h} value={h}>
                                        {h}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="text-base font-bold text-muted-foreground mt-4">:</span>

                    {/* Minute Select with existing Select component */}
                    <div className="flex-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                            Minute
                        </span>
                        <Select value={minute} onValueChange={handleMinuteChange}>
                            <SelectTrigger className="h-9 text-xs justify-center font-medium">
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {MINUTES.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* AM / PM Segmented Control */}
                    <div className="w-24">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                            Period
                        </span>
                        <div className="flex h-9 rounded-md border border-input bg-muted/40 p-0.5">
                            <button
                                type="button"
                                onClick={() => handlePeriodChange('AM')}
                                className={`flex-1 rounded text-xs font-semibold transition-colors ${
                                    period === 'AM'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePeriodChange('PM')}
                                className={`flex-1 rounded text-xs font-semibold transition-colors ${
                                    period === 'PM'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Minute Selection Bar: :00 is the very first button */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">Minute:</span>
                    {['00', '15', '30', '45'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handleMinuteChange(m)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                                minute === m
                                    ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                                    : 'bg-muted/30 hover:bg-muted text-foreground border-border/80'
                            }`}
                        >
                            :{m}
                        </button>
                    ))}
                </div>
            </div>

            {error && <InputError message={error} />}
        </div>
    );
}

export default function TimeSlots({ timeSlots = [] }: TimeSlotsProps) {
    const [activeDuration, setActiveDuration] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        start_time: '07:30',
        end_time: '09:00',
        is_active: true,
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
        const suggestedName = generateSuggestedName(startTime, calculatedEndTime, minutes);

        setData((prev) => ({
            ...prev,
            start_time: startTime,
            end_time: calculatedEndTime,
            name: !prev.name || prev.name.includes('–') ? suggestedName : prev.name,
        }));
    };

    const handleStartTimeChange = (newStartTime: string) => {
        if (activeDuration) {
            const calculatedEndTime = addMinutesToTime(newStartTime, activeDuration);
            const suggestedName = generateSuggestedName(newStartTime, calculatedEndTime, activeDuration);
            setData((prev) => ({
                ...prev,
                start_time: newStartTime,
                end_time: calculatedEndTime,
                name: !prev.name || prev.name.includes('–') ? suggestedName : prev.name,
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
        post(timeSlotsStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setActiveDuration(null);
            },
        });
    };

    return (
        <>
            <Head title="Time slot settings" />

            <h1 className="sr-only">Time slot settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Time slot configuration"
                    description="Configure scheduling intervals, session periods, and active teaching blocks"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fast Register Duration Presets Bar */}
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-primary" />
                                <span className="text-xs font-semibold text-foreground">
                                    Fast Register (Duration Presets)
                                </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Pick a duration to auto-calculate end time
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

                    {/* Start Time & Flexible End Time using the existing Select component */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TimeSectionPicker
                            id="start_time"
                            label="Start Time"
                            value={data.start_time}
                            onChange={handleStartTimeChange}
                            error={errors.start_time}
                            required
                        />

                        <div className="space-y-2">
                            <TimeSectionPicker
                                id="end_time"
                                label="End Time (Flexible)"
                                value={data.end_time}
                                onChange={handleEndTimeChange}
                                error={errors.end_time}
                                required
                            />

                            {/* Duration Feedback Badge */}
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
                            placeholder="e.g. 07:30 AM – 10:30 AM (3.0h) or Morning Session"
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
                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                            className="mt-0.5"
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className="text-xs font-medium cursor-pointer">
                                Active time slot for class scheduling
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                                When enabled, this period will appear in timetable pickers and conflict verifications.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing} className="min-w-32 text-xs font-semibold">
                            {processing ? (
                                <>
                                    <Spinner className="size-3.5 mr-2" />
                                    Saving Time Slot...
                                </>
                            ) : (
                                'Save Time Slot'
                            )}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="size-3.5" />
                                Saved successfully.
                            </p>
                        )}
                    </div>
                </form>

                {timeSlots && timeSlots.length > 0 && (
                    <>
                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Configured Time Slots
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Overview of all scheduling blocks configured in the system ({timeSlots.length} registered)
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Slot Name
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Hours (12-Hour)
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Duration
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {timeSlots.map((slot) => {
                                            const mins = calculateMinutes(slot.start_time, slot.end_time);
                                            const hrsLabel = mins && mins > 0
                                                ? (mins / 60).toFixed(1).replace('.0', '') + ' hrs'
                                                : '—';

                                            return (
                                                <TableRow key={slot.id} className="hover:bg-muted/30">
                                                    <TableCell className="py-2.5 text-xs font-medium text-foreground">
                                                        {slot.name}
                                                    </TableCell>
                                                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                                                        {formatTo12Hour(slot.start_time)} – {formatTo12Hour(slot.end_time)}
                                                    </TableCell>
                                                    <TableCell className="py-2.5 text-xs">
                                                        <Badge variant="outline" className="text-[10px] font-normal">
                                                            {hrsLabel}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        {slot.is_active ? (
                                                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[11px]">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-[11px]">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

TimeSlots.layout = {
    breadcrumbs: [
        {
            title: 'Time slot settings',
            href: '/settings/time-slots',
        },
    ],
};
