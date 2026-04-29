import type { User } from './auth';

export interface Teacher {
    id: number;
    user_id: number;
    employee_id: string;
    department: string | null;
    rank: string | null;
    employment_type: 'full_time' | 'part_time' | 'casual';
    date_hired: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: User;
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
    };
    filters: {
        search?: string;
        per_page?: number;
    };
}

export interface TeachersFormProps {
    teacher?: Teacher;
    users: {
        id: number;
        name: string;
        email: string;
    }[];
    employmentTypes: {
        value: string;
        name: string;
        label: string;
    }[];
}

export interface TeachersShowProps {
    teacher: Teacher;
}
