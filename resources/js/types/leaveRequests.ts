import type { Teacher } from './teachers';

export interface LeaveRequestTeacher {
    id: number;
    first_name: string;
    last_name: string;
}

export interface LeaveRequestApprover {
    id: number;
    name: string;
}

export interface LeaveRequest {
    id: number;
    teacher_id: number;
    leave_type: 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity' | 'other';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by: number | null;
    approved_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    leave_days?: number;
    teacher?: LeaveRequestTeacher;
    approver?: LeaveRequestApprover | null;
}

export interface LeaveRequestsIndexProps {
    data: {
        data: LeaveRequest[];
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
        leave_type?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    teachers: LeaveRequestTeacher[];
}

export interface LeaveRequestsFormProps {
    leaveRequest?: LeaveRequest;
    teachers: LeaveRequestTeacher[];
}

export interface LeaveRequestsShowProps {
    leaveRequest: LeaveRequest;
}

export interface LeaveRequestsMyRequestsProps {
    data: {
        data: LeaveRequest[];
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
