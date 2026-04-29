import type { User } from './auth';

export interface UsersIndexProps {
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

export interface UsersFormProps {
    user?: User;
}

export interface UsersShowProps {
    user: User;
}
