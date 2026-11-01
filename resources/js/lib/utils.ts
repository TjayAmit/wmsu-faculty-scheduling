import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function fmtDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const d = new Date(value);

    if (isNaN(d.getTime())) {
        return value;
    }

    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtTime(value: string | null | undefined): string {
    if (!value) return '';

    // If ISO datetime string like "2026-11-01T08:30:00.000000Z"
    if (value.includes('T')) {
        const timePart = value.split('T')[1].slice(0, 5);
        const [hStr, mStr] = timePart.split(':');
        const h = parseInt(hStr, 10);
        if (!isNaN(h)) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${mStr} ${ampm}`;
        }
    }

    // If standard "HH:mm" or "HH:mm:ss" like "08:30" or "13:00:00"
    if (value.includes(':')) {
        const parts = value.split(':');
        const h = parseInt(parts[0], 10);
        const m = parts[1] || '00';
        if (!isNaN(h)) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m} ${ampm}`;
        }
    }

    return value;
}

export function fmtTimeRange(start?: string | null, end?: string | null): string {
    if (!start && !end) return 'TBA';
    if (start && !end) return fmtTime(start);
    if (!start && end) return fmtTime(end);
    return `${fmtTime(start)} – ${fmtTime(end)}`;
}
