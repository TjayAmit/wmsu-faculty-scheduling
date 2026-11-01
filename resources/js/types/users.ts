import type { User } from './auth';
import type { Teacher } from './teachers';

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

export interface RoleOption {
    id: number;
    name: string;
}

export interface UsersFormProps {
    user?: User & {
        roles?: RoleOption[];
    };
    roles?: RoleOption[];
}

export interface UsersShowProps {
    user: User & {
        roles?: RoleOption[];
        teacher?: Teacher | null;
    };
}
