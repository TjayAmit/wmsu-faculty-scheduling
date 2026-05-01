import type { Teacher } from './teachers';
import type { User } from './auth';

export interface DraftScheduleStatus {
    value: string;
    label: string;
}

export interface DraftScheduleSchedule {
    id: number;
    subject: {
        id: number;
        code: string;
        title: string;
    };
    semester: {
        id: number;
        name: string;
        academic_year: string;
    };
}

export interface DraftScheduleTeacherAssignment {
    id: number;
    is_active: boolean;
}

export interface DraftSchedule {
    id: number;
    teacher_id: number;
    schedule_id: number;
    status: 'draft' | 'pending_review' | 'approved' | 'rejected';
    notes: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    review_comments: string | null;
    submitted_at: string | null;
    teacher_assignment_id: number | null;
    created_at: string;
    updated_at: string;
    teacher: Teacher;
    schedule: DraftScheduleSchedule;
    reviewer: User | null;
    teacher_assignment: DraftScheduleTeacherAssignment | null;
}

export interface DraftSchedulesIndexProps {
    data: {
        data: DraftSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        teacher_id?: number;
        per_page?: number;
    };
}

export interface DraftSchedulesFormProps {
    draftSchedule?: DraftSchedule;
    teachers: {
        id: number;
        user: {
            id: number;
            name: string;
        };
    }[];
    schedules: {
        id: number;
        subject: {
            id: number;
            code: string;
            title: string;
        };
        semester: {
            id: number;
            name: string;
            academic_year: string;
        };
    }[];
}

export interface DraftSchedulesShowProps {
    draftSchedule: DraftSchedule;
}

export interface DraftSchedulesMyDraftsProps {
    data: {
        data: DraftSchedule[];
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

export const draftScheduleStatusOptions: DraftScheduleStatus[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export const getDraftScheduleStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
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

export const getDraftScheduleStatusLabel = (status: string): string => {
    const option = draftScheduleStatusOptions.find(opt => opt.value === status);
    return option?.label || status;
};
