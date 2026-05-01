import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    index as teacherSchedules,
} from '@/routes/teacher-schedules';
import {
    getTeacherScheduleStatusVariant,
    getTeacherScheduleStatusLabel,
    dayLabels,
} from '@/types/teacherSchedules';
import type { TeacherSchedulesShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Show({ schedule }: TeacherSchedulesShowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
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
            <Head title={`Schedule - ${schedule.subject.code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={teacherSchedules()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Schedule
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>{schedule.subject.code} - {schedule.subject.title}</CardTitle>
                            <Badge variant={getTeacherScheduleStatusVariant(schedule.status)}>
                                {getTeacherScheduleStatusLabel(schedule.status)}
                            </Badge>
                            {schedule.is_holiday && (
                                <Badge variant="outline">Holiday</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                                    <p className="font-medium">{formatDate(schedule.scheduled_date)}</p>
                                    <p className="text-sm text-muted-foreground">{dayLabels[schedule.day_of_week]}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                                    <p className="font-medium">
                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    <p className="font-medium">Room {schedule.room}</p>
                                    {schedule.section && (
                                        <p className="text-sm text-muted-foreground">Section {schedule.section}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Semester</p>
                                    <p className="font-medium">{schedule.semester.name}</p>
                                    <p className="text-sm text-muted-foreground">{schedule.semester.academic_year}</p>
                                </div>
                            </div>
                        </div>

                        {schedule.notes && (
                            <div className="grid gap-2 border-t pt-4">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="text-sm whitespace-pre-wrap">{schedule.notes}</p>
                            </div>
                        )}

                        {schedule.is_holiday && schedule.holiday_name && (
                            <div className="grid gap-2 border-t pt-4">
                                <p className="text-sm font-medium text-muted-foreground">Holiday</p>
                                <p className="text-sm">{schedule.holiday_name}</p>
                            </div>
                        )}

                        {schedule.attendance_record && (
                            <div className="grid gap-2 border-t pt-4">
                                <p className="text-sm font-medium text-muted-foreground">Attendance Record</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant={schedule.attendance_record.status === 'present' ? 'default' : 'outline'}>
                                        {schedule.attendance_record.status}
                                    </Badge>
                                    {schedule.attendance_record.timestamp_in && (
                                        <span className="text-sm text-muted-foreground">
                                            Time in: {new Date(schedule.attendance_record.timestamp_in).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p className="text-sm">{new Date(schedule.created_at).toLocaleString()}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p className="text-sm">{new Date(schedule.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'My Schedule', href: teacherSchedules() },
            { title: 'View Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
