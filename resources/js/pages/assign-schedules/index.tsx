import { Head, router } from '@inertiajs/react';
import { Eye, Plus, Trash2, User, BookOpen, CheckCircle } from 'lucide-react';
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
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
    index as assignSchedules,
    create as assignSchedulesCreate,
    show as assignSchedulesShow,
    destroy as assignSchedulesDestroy,
} from '@/routes/assign-schedules';
import type { AssignSchedulesIndexProps, AssignSchedule } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters, teachers, availableSchedules }: AssignSchedulesIndexProps) {
    const [teacherId, setTeacherId] = useState(filters.teacher_id?.toString() || '_all');
    const [scheduleId, setScheduleId] = useState(filters.schedule_id?.toString() || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            assignSchedules(),
            {
                teacher_id: teacherId === '_all' ? '' : teacherId,
                schedule_id: scheduleId === '_all' ? '' : scheduleId,
                per_page: perPage,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleTeacherChange = (value: string) => {
        setTeacherId(value);
        navigate({ teacher_id: value === '_all' ? '' : value, page: 1 });
    };

    const handleScheduleChange = (value: string) => {
        setScheduleId(value);
        navigate({ schedule_id: value === '_all' ? '' : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(assignSchedulesDestroy(deleteId).url, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Assign Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold">Assign Schedules</h1>
                            <Badge variant="default" className="text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Auto-approved
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {data.total} total
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={teacherId} onValueChange={handleTeacherChange}>
                                <SelectTrigger className="h-9 w-[180px]">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filter by teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all">All teachers</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={scheduleId} onValueChange={handleScheduleChange}>
                                <SelectTrigger className="h-9 w-[220px]">
                                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filter by schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all">All schedules</SelectItem>
                                    {availableSchedules.map((schedule) => (
                                        <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                            {schedule.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button asChild size="sm">
                                <a href={assignSchedulesCreate().url}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Assign Schedule
                                </a>
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Teacher</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Schedule</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Semester</TableHead>
                                <TableHead className="h-11 py-0 px-4 text-sm font-medium text-muted-foreground">Assigned</TableHead>
                                <TableHead className="h-11 py-0 pl-4 pr-6 text-right text-sm font-medium text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No assigned schedules found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((item: AssignSchedule) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-border transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.teacher.user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.schedule.subject.code} - {item.schedule.subject.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {item.schedule.semester.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(item.created_at)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3.5 pl-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button asChild variant="ghost" size="sm">
                                                    <a href={assignSchedulesShow(item.id).url}>
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(item.id)}
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        meta={data}
                        perPage={perPage}
                        onPageChange={(page) => navigate({ page })}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                itemName="this schedule assignment"
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Assign Schedules', href: assignSchedules() },
        ]}
    >
        {page}
    </AppLayout>
);
