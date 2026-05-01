import type { User } from './auth';

export interface StaffIndexProps {
    data: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
}

export interface StaffFormProps {
    user?: User;
}

export interface StaffShowProps {
    user: User;
}
