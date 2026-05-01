import { Head, router } from '@inertiajs/react';
import { Eye, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/table-pagination';
import {
    index as teacherSchedules,
    show as teacherSchedulesShow,
} from '@/routes/teacher-schedules';
import {
    teacherScheduleStatusOptions,
    getTeacherScheduleStatusVariant,
    getTeacherScheduleStatusLabel,
    dayLabels,
} from '@/types/teacherSchedules';
import type { TeacherSchedulesIndexProps, TeacherSchedule } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ schedules, filters }: TeacherSchedulesIndexProps) {
    const [status, setStatus] = useState(filters.status || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            teacherSchedules(),
            { status: status === '_all' ? '' : status, per_page: perPage, ...params },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ status: value === '_all' ? '' : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <>
            <Head title="My Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold">My Schedule</h1>
                            <span className="text-sm text-muted-foreground">
                                {schedules.total} total
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 w-[160px]">
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
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Subject</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Date</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Time</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Room</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-11 py-0 pl-4 pr-6 text-right text-sm font-medium text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No scheduled sessions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules?.data?.map((item: TeacherSchedule) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-border transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.subject.code} - {item.subject.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.semester.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {formatDate(item.scheduled_date)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground ml-6">
                                                {dayLabels[item.day_of_week]}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm">{item.room}</span>
                                            {item.section && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({item.section})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={getTeacherScheduleStatusVariant(item.status)} className="text-xs">
                                                {getTeacherScheduleStatusLabel(item.status)}
                                            </Badge>
                                            {item.is_holiday && (
                                                <Badge variant="outline" className="text-xs ml-2">
                                                    Holiday
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3.5 pl-4 pr-6 text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <a href={teacherSchedulesShow(item.id).url}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        meta={schedules}
                        perPage={perPage}
                        onPageChange={(page) => navigate({ page })}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'My Schedule', href: teacherSchedules() },
        ]}
    >
        {page}
    </AppLayout>
);
