import type { Teacher } from './teachers';
import type { Program } from './curricula';

export interface Department {
    id: number;
    code: string;
    name: string;
    description: string | null;
    head_id: number | null;
    office_location: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    full_name?: string;
    head?: Teacher | null;
    teachers?: Teacher[];
    programs?: Program[];
}

export interface TeacherOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface DepartmentsIndexProps {
    data: {
        data: Department[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        per_page?: number;
    };
}

export interface DepartmentsFormProps {
    department?: Department;
    teachers?: TeacherOption[];
}

export interface DepartmentsShowProps {
    department: Department;
}
