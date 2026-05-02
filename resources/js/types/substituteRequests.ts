import type { Teacher } from './teachers';

export interface SubstituteRequestSchedule {
    id: number;
    room: string;
    section: string;
}

export interface SubstituteRequestApprover {
    id: number;
    name: string;
}

export interface SubstituteRequest {
    id: number;
    requesting_teacher_id: number;
    substitute_teacher_id: number | null;
    schedule_id: number | null;
    date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by: number | null;
    approved_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    requesting_teacher?: Teacher;
    substitute_teacher?: Teacher | null;
    schedule?: SubstituteRequestSchedule | null;
    approver?: SubstituteRequestApprover | null;
}

export interface SubstituteRequestTeacherOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface SubstituteRequestsIndexProps {
    data: {
        data: SubstituteRequest[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        requesting_teacher_id?: number;
        substitute_teacher_id?: number;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    teachers: SubstituteRequestTeacherOption[];
}

export interface SubstituteRequestsFormProps {
    substituteRequest?: SubstituteRequest;
    teachers: SubstituteRequestTeacherOption[];
}

export interface SubstituteRequestsShowProps {
    substituteRequest: SubstituteRequest;
}

export interface SubstituteRequestsMyRequestsProps {
    data: {
        data: SubstituteRequest[];
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
