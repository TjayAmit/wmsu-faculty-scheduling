import type { User } from './auth';
import type { Teacher } from './teachers';

export interface AssignScheduleSubject {
    id: number;
    code: string;
    title: string;
}

export interface AssignScheduleSemester {
    id: number;
    name: string;
    academic_year: string;
}

export interface AssignScheduleSchedule {
    id: number;
    subject: AssignScheduleSubject;
    semester: AssignScheduleSemester;
    time_slots: Array<{
        day: string;
        start_time: string;
        end_time: string;
    }>;
}

export interface AssignSchedule {
    id: number;
    teacher_id: number;
    schedule_id: number;
    status: 'approved';
    notes: string | null;
    reviewed_by: number;
    reviewed_at: string;
    review_comments: string;
    created_at: string;
    updated_at: string;
    teacher: Teacher;
    schedule: AssignScheduleSchedule;
    reviewer: User;
}

export interface AssignSchedulesIndexProps {
    data: {
        data: AssignSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        teacher_id?: number;
        schedule_id?: number;
        per_page?: number;
    };
    teachers: Array<{
        id: number;
        name: string;
    }>;
    availableSchedules: Array<{
        id: number;
        name: string;
    }>;
}

export interface AssignSchedulesCreateProps {
    teachers: Array<{
        id: number;
        name: string;
        rank?: string | null;
        department?: string | null;
        employment_type?: string;
        active_assignments_count?: number;
    }>;
    schedules: Array<{
        id: number;
        name: string;
        subject_code?: string;
        subject_title?: string;
        units?: number;
        section?: string;
        room?: string;
        semester: string;
        timeSlots: Array<{
            day: string;
            start?: string;
            end?: string;
            start_time?: string;
            end_time?: string;
        }>;
        is_assigned?: boolean;
        assigned_teacher?: string | null;
    }>;
    selectedTeacherId?: string | number | null;
    selectedScheduleId?: string | number | null;
}

export interface AssignSchedulesShowProps {
    assignment: AssignSchedule;
}
