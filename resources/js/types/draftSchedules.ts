import type { User } from './auth';
import type { Teacher } from './teachers';

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
        units?: string | number;
        description?: string | null;
    };
    semester: {
        id: number;
        name: string;
        academic_year: string;
        semester_type?: string;
        start_date?: string;
        end_date?: string;
        is_current?: boolean;
    };
    classroom?: {
        id: number;
        building: string;
        room_number: string;
        room_name?: string | null;
        capacity?: number;
        room_type?: string;
        equipment?: string[];
        is_active?: boolean;
    } | null;
    room?: string | null;
    section?: string | null;
    time_slots?: Array<{
        day: string;
        time_slot_id: string | number;
    }>;
}

export interface DraftScheduleTeacherAssignment {
    id: number;
    is_active: boolean;
    teacher_id?: number;
    schedule_id?: number;
    assigned_at?: string | null;
    assigned_by?: number | null;
    assigned_by_user?: User | null;
}

export interface ResolvedTimeSlot {
    day?: string | null;
    time_slot_id?: string | number | null;
    name?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}

export interface GeneratedSession {
    id: number;
    scheduled_date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room?: string | null;
    section?: string | null;
    status: string;
    is_holiday?: boolean;
    holiday_name?: string | null;
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
    teachers?: {
        id: number;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        user?: {
            id: number;
            name: string;
        };
    }[];
    schedules?: {
        id: number;
        section?: string | null;
        subject?: {
            id: number;
            code: string;
            title: string;
        };
        semester?: {
            id: number;
            name: string;
            academic_year: string;
        };
    }[];
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
    resolvedTimeSlots?: ResolvedTimeSlot[];
    generatedSessions?: GeneratedSession[];
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
