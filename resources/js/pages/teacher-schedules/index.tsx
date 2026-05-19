import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    ChevronRight,
    Clock,
    FileText,
    MapPin,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    index as teacherSchedules,
    show as teacherSchedulesShow,
} from '@/routes/teacher-schedules';
import type {
    TeacherSchedulesIndexProps,
    SubjectSummary,
    SessionSummary,
    SessionsPaginated,
} from '@/types';
import {
    teacherScheduleStatusOptions,
    getTeacherScheduleStatusVariant,
    getTeacherScheduleStatusLabel,
    dayLabels,
} from '@/types/teacherSchedules';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Parses a bare H:i:s time string into a display string like "8:00 AM". */
function formatTime(timeStr: string): string {
    // timeStr arrives as "08:00:00" from the backend
    const date = new Date(`1970-01-01T${timeStr}`);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/** Short date like "May 22". */
function formatShortDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/** Comma-separated day abbreviations like "Mon, Wed". */
function formatDays(days: string[]): string {
    const abbr: Record<string, string> = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun',
    };

    return days.map((d) => abbr[d] ?? d).join(', ');
}

// ─── subject card ────────────────────────────────────────────────────────────

interface SubjectCardProps {
    subject: SubjectSummary;
}

function SubjectCard({ subject }: SubjectCardProps) {
    const handleClick = () => {
        router.get(
            teacherSchedules().url,
            { subject_id: subject.subject_id, semester_id: subject.semester_id },
            { preserveState: false },
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        >
            <Card className="border-l-4 border-l-primary h-full transition-shadow hover:shadow-md gap-0 py-0">
                {/* header */}
                <div className="flex items-start gap-3 px-5 pt-5 pb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{subject.subject_code}</span>
                            <span className="text-muted-foreground text-xs">·</span>
                            {subject.scheduled > 0 ? (
                                <Badge variant="secondary" className="text-xs h-4 px-1.5">Scheduled</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs h-4 px-1.5">Done</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{subject.subject_title}</p>
                    </div>
                </div>

                {/* divider row: days + time */}
                <div className="px-5 pb-3 border-t border-border/50 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {formatDays(subject.days)} · {formatTime(subject.start_time)} – {formatTime(subject.end_time)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {subject.room ?? 'No room'} · {subject.section ?? 'No section'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span>{subject.semester_name} {subject.academic_year}</span>
                    </div>
                </div>

                {/* counters + next session */}
                <div className="px-5 pb-4 pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{subject.total} sessions</span>
                        {subject.completed > 0 && (
                            <Badge variant="default" className="text-xs h-4 px-1.5">{subject.completed} done</Badge>
                        )}
                        {subject.cancelled > 0 && (
                            <Badge variant="destructive" className="text-xs h-4 px-1.5">{subject.cancelled} cancelled</Badge>
                        )}
                        {subject.postponed > 0 && (
                            <Badge variant="outline" className="text-xs h-4 px-1.5">{subject.postponed} postponed</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium shrink-0 group-hover:gap-2 transition-all">
                        {subject.next_session && (
                            <span className="text-muted-foreground font-normal">
                                Next {formatShortDate(subject.next_session)} ·{' '}
                            </span>
                        )}
                        View sessions
                        <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </Card>
        </button>
    );
}

// ─── subjects view ───────────────────────────────────────────────────────────

interface SubjectsViewProps {
    subjects: SubjectSummary[];
}

function SubjectsView({ subjects }: SubjectsViewProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* page header */}
            <div>
                <h1 className="text-xl font-semibold">My Schedule</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                </p>
            </div>

            {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                    <div className="rounded-full bg-muted p-4">
                        <Calendar className="h-6 w-6 opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">No subjects scheduled yet</p>
                        <p className="text-xs mt-1">Sessions will appear here once a schedule is generated for you.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((s) => (
                        <SubjectCard key={`${s.subject_id}-${s.semester_id}`} subject={s} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── sessions view ───────────────────────────────────────────────────────────

interface SessionRowProps {
    session: SessionSummary;
}

function SessionRow({ session }: SessionRowProps) {
    return (
        <button
            type="button"
            onClick={() => router.get(teacherSchedulesShow(session.id).url)}
            className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg"
        >
            <div className="flex items-center gap-4 bg-card px-4 py-3 transition-colors hover:bg-muted/30">
                {/* date block */}
                <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-semibold leading-none text-foreground">
                        {formatShortDate(session.scheduled_date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {dayLabels[session.day_of_week]?.slice(0, 3)}
                    </p>
                </div>

                {/* time */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[120px]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">
                        {formatTime(session.start_time)} – {formatTime(session.end_time)}
                    </span>
                </div>

                {/* notes indicator */}
                {session.notes && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[120px]">{session.notes}</span>
                    </div>
                )}

                {/* spacer */}
                <div className="flex-1" />

                {/* badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {session.is_holiday && (
                        <Badge
                            variant="outline"
                            className="text-xs h-5 px-1.5 border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                        >
                            Holiday
                        </Badge>
                    )}
                    <Badge variant={getTeacherScheduleStatusVariant(session.status)} className="text-xs h-5 px-1.5">
                        {getTeacherScheduleStatusLabel(session.status)}
                    </Badge>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
            </div>
        </button>
    );
}

interface SessionsViewProps {
    sessions: SessionsPaginated;
    subject: {
        id: number | null;
        code: string;
        title: string;
        semester_name: string;
        academic_year: string;
        section: string | null;
        room: string | null;
        start_time: string | null;
        end_time: string | null;
    };
    filters: {
        subject_id?: number;
        semester_id?: number;
        status?: string;
        per_page?: number;
    };
}

function SessionsView({ sessions, subject, filters }: SessionsViewProps) {
    const [status, setStatus] = useState(filters.status ?? '_all');
    const [perPage, setPerPage] = useState(filters.per_page ?? 15);

    const navigate = (params: Record<string, unknown>) => {
        router.get(
            teacherSchedules().url,
            {
                subject_id: filters.subject_id,
                semester_id: filters.semester_id,
                status: status === '_all' ? undefined : status,
                per_page: perPage,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ status: value === '_all' ? undefined : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    // Group visible sessions by month for visual separators
    const grouped = sessions.data.reduce<{ month: string; items: SessionSummary[] }[]>((acc, s) => {
        const month = new Date(s.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
        const last = acc[acc.length - 1];

        if (last && last.month === month) {
            last.items.push(s);
        } else {
            acc.push({ month, items: [s] });
        }

        return acc;
    }, []);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
            {/* back button */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.get(teacherSchedules().url)}
                    className="gap-1.5 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to subjects
                </Button>
            </div>

            {/* subject header card */}
            <Card className="border-l-4 border-l-primary gap-0 py-0">
                <CardContent className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg font-bold text-foreground">{subject.code}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-base text-foreground">{subject.title}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {subject.semester_name} {subject.academic_year}
                                </span>
                                {subject.section && (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {subject.section}
                                    </span>
                                )}
                                {subject.room && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Room {subject.room}
                                    </span>
                                )}
                                {subject.start_time && subject.end_time && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(subject.start_time)} – {formatTime(subject.end_time)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* list header: summary + filter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{sessions.total}</span> sessions total
                    {sessions.from != null && sessions.to != null && (
                        <> · showing <span className="font-medium text-foreground">{sessions.from}–{sessions.to}</span></>
                    )}
                </p>

                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All statuses</SelectItem>
                        {teacherScheduleStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* session list */}
            {sessions.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <div className="rounded-full bg-muted p-3">
                        <Calendar className="h-5 w-5 opacity-50" />
                    </div>
                    <p className="text-sm">No sessions match the current filter.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {grouped.map(({ month, items }) => (
                        <div key={month}>
                            <div className="border-b border-border bg-muted/40 px-4 py-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {month}
                                </span>
                            </div>
                            <div className="divide-y divide-border/60">
                                {items.map((session) => (
                                    <SessionRow key={session.id} session={session} />
                                ))}
                            </div>
                        </div>
                    ))}

                    <TablePagination
                        meta={{
                            total: sessions.total,
                            from: sessions.from,
                            to: sessions.to,
                            current_page: sessions.current_page,
                            last_page: sessions.last_page,
                        }}
                        perPage={perPage}
                        perPageOptions={[10, 15, 25, 50]}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            )}
        </div>
    );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function Index(props: TeacherSchedulesIndexProps) {
    const { mode } = props;

    return (
        <>
            <Head title="My Schedule" />

            {mode === 'sessions' ? (
                <SessionsView
                    sessions={props.sessions ?? { data: [], total: 0, current_page: 1, last_page: 1, per_page: 15, from: null, to: null }}
                    subject={props.subject ?? {
                        id: null,
                        code: '',
                        title: '',
                        semester_name: '',
                        academic_year: '',
                        section: null,
                        room: null,
                        start_time: null,
                        end_time: null,
                    }}
                    filters={props.filters}
                />
            ) : mode === 'subjects' ? (
                <SubjectsView subjects={props.subjects ?? []} />
            ) : (
                // Admin fallback — the old flat table experience is preserved by the
                // backend returning mode-less props; render a minimal notice so the
                // page doesn't crash if somehow reached without schedules.
                <div className="p-6 text-sm text-muted-foreground">
                    Admin schedule view — use the admin panel.
                </div>
            )}
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'My Schedule', href: teacherSchedules().url },
        ]}
    >
        {page}
    </AppLayout>
);
