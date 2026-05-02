import type { Teacher } from './teachers';

export interface TeachingHistorySemester {
    id: number;
    name: string;
    year: string;
}

export interface TeachingHistorySubject {
    id: number;
    name: string;
    code: string;
}

export interface TeachingHistorySchedule {
    id: number;
    room: string;
    section: string;
}

export interface TeachingHistory {
    id: number;
    teacher_id: number;
    semester_id: number;
    subject_id: number;
    schedule_id: number | null;
    hours_assigned: number;
    hours_completed: number;
    status: 'completed' | 'incomplete' | 'dropped';
    notes: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    completion_percentage?: number;
    teacher?: Teacher;
    semester?: TeachingHistorySemester;
    subject?: TeachingHistorySubject;
    schedule?: TeachingHistorySchedule | null;
}

export interface TeachingHistoryTeacherOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface TeachingHistorySemesterOption {
    id: number;
    name: string;
    year: string;
}

export interface TeachingHistorySubjectOption {
    id: number;
    name: string;
    code: string;
}

export interface TeachingHistoriesIndexProps {
    data: {
        data: TeachingHistory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        teacher_id?: number;
        semester_id?: number;
        status?: string;
        per_page?: number;
    };
    teachers: TeachingHistoryTeacherOption[];
    semesters: TeachingHistorySemesterOption[];
}

export interface TeachingHistoriesFormProps {
    teachingHistory?: TeachingHistory;
    teachers: TeachingHistoryTeacherOption[];
    semesters: TeachingHistorySemesterOption[];
    subjects: TeachingHistorySubjectOption[];
}

export interface TeachingHistoriesShowProps {
    teachingHistory: TeachingHistory;
}

export interface TeachingHistoriesTeacherHistoryProps {
    data: {
        data: TeachingHistory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    teacher: Teacher;
    filters: {
        semester_id?: number;
        per_page?: number;
    };
    semesters: TeachingHistorySemesterOption[];
}
