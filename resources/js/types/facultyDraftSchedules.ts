import type { Teacher } from './teachers';
import type { User } from './auth';

export interface FacultyDraftScheduleSubject {
    id: number;
    code: string;
    title: string;
}

export interface FacultyDraftScheduleSemester {
    id: number;
    name: string;
    academic_year: string;
}

export interface FacultyDraftScheduleSchedule {
    id: number;
    subject: FacultyDraftScheduleSubject;
    semester: FacultyDraftScheduleSemester;
}

export interface FacultyDraftSchedule {
    id: number;
    teacher_id: number;
    schedule_id: number;
    status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    notes: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    review_comments: string | null;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    teacher: Teacher;
    schedule: FacultyDraftScheduleSchedule;
    reviewer: User | null;
}

export interface FacultyDraftSchedulesIndexProps {
    data: {
        data: FacultyDraftSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        per_page?: number;
    };
}

export interface FacultyDraftSchedulesShowProps {
    draftSchedule: FacultyDraftSchedule;
}

export const facultyDraftScheduleStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export const getFacultyDraftScheduleStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'approved':
            return 'default';
        case 'pending_review':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        case 'draft':
        default:
            return 'outline';
    }
};

export const getFacultyDraftScheduleStatusLabel = (status: string): string => {
    const option = facultyDraftScheduleStatusOptions.find(opt => opt.value === status);
    return option?.label || status;
};
