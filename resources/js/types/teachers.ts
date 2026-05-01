import type { User } from './auth';
import type { Role } from './roles';

export interface Teacher {
    id: number;
    user_id?: number | null;
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    department?: string | null;
    rank?: string | null;
    employment_type: 'full_time' | 'part_time' | 'casual';
    employment_type_label?: string;
    date_hired?: string | null;
    phone?: string | null;
    address?: string | null;
    is_active: boolean;
    has_user_account: boolean;
    full_name: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    user?: User | null;
    assignments_count?: number;
    active_assignments_count?: number;
}

export interface CreateTeacherRequest {
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    department?: string;
    rank?: string;
    employment_type: 'full_time' | 'part_time' | 'casual';
    date_hired?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
    user_id?: number | null;
}

export interface CreateUserAccountRequest {
    name: string;
    password: string;
    password_confirmation: string;
    roles?: string[];
}

export interface LinkUserAccountRequest {
    user_id: number;
    roles?: string[];
}

export interface TeacherFilters {
    search?: string;
    without_user?: boolean;
    is_active?: boolean;
    department?: string;
    employment_type?: string;
}

export interface TeachersIndexProps {
    data: {
        data: Teacher[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: TeacherFilters;
    employmentTypes: Array<{ value: string; label: string }>;
}

export interface TeachersFormProps {
    teacher?: Teacher;
    users?: {
        id: number;
        name: string;
        email: string;
    }[];
    employmentTypes: Array<{ value: string; label: string }>;
    availableRoles?: Role[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
}

export interface TeachersShowProps {
    teacher: Teacher;
    availableRoles?: Role[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
}
