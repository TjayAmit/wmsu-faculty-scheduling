import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
    value?: string; // Format: 'YYYY-MM-DD'
    onChange: (value: string) => void;
    minDate?: string; // Format: 'YYYY-MM-DD'
    maxDate?: string; // Format: 'YYYY-MM-DD'
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    required?: boolean;
    hasError?: boolean;
    presets?: { label: string; getDate: () => string }[];
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Parses 'YYYY-MM-DD' safely without UTC timezone shift.
 */
function parseYMD(str?: string): Date | null {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Formats a Date to 'YYYY-MM-DD'.
 */
function toYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function DatePicker({
    value = '',
    onChange,
    minDate,
    maxDate,
    placeholder = 'Select date',
    disabled = false,
    className,
    id,
    hasError = false,
    presets,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    // Initial view month based on value or today
    const selectedDate = useMemo(() => parseYMD(value), [value]);
    const today = useMemo(() => new Date(), []);
    const todayYMD = useMemo(() => toYMD(today), [today]);

    const [viewYear, setViewYear] = useState<number>(() => {
        return selectedDate ? selectedDate.getFullYear() : today.getFullYear();
    });

    const [viewMonth, setViewMonth] = useState<number>(() => {
        return selectedDate ? selectedDate.getMonth() : today.getMonth();
    });

    // When popover opens or value changes, sync the calendar view to the selected date
    useEffect(() => {
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
        }
    }, [value]);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const handleSelectDay = (ymd: string) => {
        onChange(ymd);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    // Calendar grid calculations
    const calendarDays = useMemo(() => {
        const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells: {
            ymd: string;
            dayNumber: number;
            isCurrentMonth: boolean;
            isDisabled: boolean;
            isSelected: boolean;
            isToday: boolean;
        }[] = [];

        // Leading days from previous month
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
            const ymd = toYMD(prevMonthDate);
            const isDisabled = Boolean((minDate && ymd < minDate) || (maxDate && ymd > maxDate));
            cells.push({
                ymd,
                dayNumber: dayNum,
                isCurrentMonth: false,
                isDisabled,
                isSelected: ymd === value,
                isToday: ymd === todayYMD,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const curDate = new Date(viewYear, viewMonth, d);
            const ymd = toYMD(curDate);
            const isDisabled = Boolean((minDate && ymd < minDate) || (maxDate && ymd > maxDate));
            cells.push({
                ymd,
                dayNumber: d,
                isCurrentMonth: true,
                isDisabled,
                isSelected: ymd === value,
                isToday: ymd === todayYMD,
            });
        }

        // Trailing days to round to complete weeks (multiple of 7)
        const remaining = (7 - (cells.length % 7)) % 7;
        for (let nextD = 1; nextD <= remaining; nextD++) {
            const nextMonthDate = new Date(viewYear, viewMonth + 1, nextD);
            const ymd = toYMD(nextMonthDate);
            const isDisabled = Boolean((minDate && ymd < minDate) || (maxDate && ymd > maxDate));
            cells.push({
                ymd,
                dayNumber: nextD,
                isCurrentMonth: false,
                isDisabled,
                isSelected: ymd === value,
                isToday: ymd === todayYMD,
            });
        }

        return cells;
    }, [viewYear, viewMonth, minDate, maxDate, value, todayYMD]);

    // Format display string for trigger button
    const formattedDisplay = useMemo(() => {
        if (!selectedDate) return null;
        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, [selectedDate]);

    // Default quick presets if not provided
    const defaultPresets = useMemo(() => {
        if (presets) return presets;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        return [
            { label: 'Today', getDate: () => todayYMD },
            { label: 'Tomorrow', getDate: () => toYMD(tomorrow) },
            { label: '+1 Week', getDate: () => toYMD(nextWeek) },
        ];
    }, [presets, todayYMD]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id={id}
                    disabled={disabled}
                    className={cn(
                        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left',
                        hasError && 'border-destructive ring-destructive',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="flex items-center gap-2 truncate">
                        <CalendarIcon className="size-4 text-[#800000] shrink-0" />
                        <span className={cn('truncate', value ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                            {formattedDisplay || placeholder}
                        </span>
                    </span>

                    <span className="flex items-center gap-1 shrink-0 ml-1">
                        {value && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                title="Clear date"
                            >
                                <X className="size-3.5" />
                            </span>
                        )}
                        <ChevronDown className="size-3.5 text-muted-foreground opacity-60" />
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-3 shadow-xl rounded-xl border border-border bg-popover" align="start">
                {/* Month & Year Navigation Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                    <div className="font-semibold text-xs text-foreground">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={handlePrevMonth}
                            title="Previous month"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={handleNextMonth}
                            title="Next month"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pb-2.5 mb-2 border-b border-border/60 overflow-x-auto">
                    {defaultPresets.map((preset) => {
                        const presetYMD = preset.getDate();
                        const isPresetDisabled = Boolean(
                            (minDate && presetYMD < minDate) || (maxDate && presetYMD > maxDate)
                        );
                        const isPresetSelected = value === presetYMD;

                        return (
                            <button
                                key={preset.label}
                                type="button"
                                disabled={isPresetDisabled}
                                onClick={() => handleSelectDay(presetYMD)}
                                className={cn(
                                    'px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors',
                                    isPresetSelected
                                        ? 'bg-[#800000] text-white border-[#800000]'
                                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground',
                                    isPresetDisabled && 'opacity-40 cursor-not-allowed'
                                )}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>

                {/* Weekday Column Headers */}
                <div className="grid grid-cols-7 mb-1 text-center">
                    {WEEKDAY_NAMES.map((name) => (
                        <div key={name} className="text-[10px] font-semibold text-muted-foreground py-1">
                            {name}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((cell) => {
                        return (
                            <button
                                key={cell.ymd}
                                type="button"
                                disabled={cell.isDisabled}
                                onClick={() => handleSelectDay(cell.ymd)}
                                className={cn(
                                    'flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-all relative',
                                    // Current month vs other months
                                    cell.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40',
                                    // Hover state
                                    !cell.isDisabled && !cell.isSelected && 'hover:bg-muted hover:text-foreground',
                                    // Today highlight
                                    cell.isToday && !cell.isSelected && 'ring-1 ring-[#800000]/40 font-bold text-[#800000]',
                                    // Selected state
                                    cell.isSelected && 'bg-[#800000] text-white font-bold shadow-xs hover:bg-[#660000]',
                                    // Disabled state
                                    cell.isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                                )}
                            >
                                {cell.dayNumber}
                                {cell.isToday && !cell.isSelected && (
                                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#800000]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/60 text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            if (!minDate || todayYMD >= minDate) {
                                handleSelectDay(todayYMD);
                            } else {
                                setViewYear(today.getFullYear());
                                setViewMonth(today.getMonth());
                            }
                        }}
                        className="text-[11px] font-medium text-primary hover:underline"
                    >
                        Jump to Today
                    </button>

                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Clear Selection
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
