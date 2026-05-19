import type { Teacher } from './teachers';

export interface TeacherScheduleStatus {
    value: string;
    label: string;
}

export interface TeacherScheduleSubject {
    id: number;
    code: string;
    title: string;
}

export interface TeacherScheduleSemester {
    id: number;
    name: string;
    academic_year: string;
}

export interface TeacherScheduleTeacherAssignment {
    id: number;
    is_active: boolean;
}

export interface TeacherScheduleDraftSchedule {
    id: number;
    status: string;
}

export interface TeacherScheduleAttendanceRecord {
    id: number;
    status: string;
    timestamp_in: string | null;
    timestamp_out: string | null;
}

export interface TeacherSchedule {
    id: number;
    teacher_assignment_id: number;
    draft_schedule_id: number | null;
    subject_id: number;
    semester_id: number;
    teacher_id: number;
    scheduled_date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room: string;
    section: string;
    status: 'scheduled' | 'cancelled' | 'completed' | 'postponed';
    attendance_record_id: number | null;
    notes: string | null;
    is_holiday: boolean;
    holiday_name: string | null;
    created_at: string;
    updated_at: string;
    teacher: Teacher;
    subject: TeacherScheduleSubject;
    semester: TeacherScheduleSemester;
    teacher_assignment: TeacherScheduleTeacherAssignment | null;
    draft_schedule: TeacherScheduleDraftSchedule | null;
    attendance_record: TeacherScheduleAttendanceRecord | null;
}

export interface SubjectSummary {
    subject_id: number;
    semester_id: number;
    subject_code: string;
    subject_title: string;
    semester_name: string;
    academic_year: string;
    section: string | null;
    room: string | null;
    start_time: string;
    end_time: string;
    days: string[];
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    postponed: number;
    next_session: string | null;
}

export interface SessionSummary {
    id: number;
    scheduled_date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room: string | null;
    section: string | null;
    status: 'scheduled' | 'cancelled' | 'completed' | 'postponed';
    notes: string | null;
    is_holiday: boolean;
    holiday_name: string | null;
}

export interface SubjectDetail {
    id: number | null;
    code: string;
    title: string;
    semester_name: string;
    academic_year: string;
    section: string | null;
    room: string | null;
    start_time: string | null;
    end_time: string | null;
}

export interface SessionsPaginated {
    data: SessionSummary[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

export interface TeacherSchedulesIndexProps {
    mode: 'subjects' | 'sessions';
    subjects?: SubjectSummary[];
    sessions?: SessionsPaginated;
    subject?: SubjectDetail;
    // Admin fallback props
    schedules?: {
        data: TeacherSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        subject_id?: number;
        semester_id?: number;
        status?: string;
        teacher_id?: number;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
}

export interface TeacherSchedulesShowProps {
    schedule: TeacherSchedule;
}

export interface TeacherSchedulesTeacherSemesterProps {
    schedules: {
        data: TeacherSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    teacherId: number;
    semesterId: number;
}

export const teacherScheduleStatusOptions: TeacherScheduleStatus[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'postponed', label: 'Postponed' },
];

export const getTeacherScheduleStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'completed':
            return 'default';
        case 'scheduled':
            return 'secondary';
        case 'cancelled':
            return 'destructive';
        case 'postponed':
        default:
            return 'outline';
    }
};

export const getTeacherScheduleStatusLabel = (status: string): string => {
    const option = teacherScheduleStatusOptions.find(opt => opt.value === status);

    return option?.label || status;
};

export const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};
