export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    department_id?: number | null;
    department?: {
        id: number;
        code: string;
        name: string;
        [key: string]: unknown;
    } | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type UnlinkedTeacher = {
    id: number;
    full_name: string;
    employee_id: string | null;
    department: string | null;
};

export type Auth = {
    user: User;
    roles: string[];
    permissions: string[];
    unlinked_teachers: UnlinkedTeacher[] | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
