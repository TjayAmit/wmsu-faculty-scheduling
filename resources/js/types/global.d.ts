import type { Auth } from '@/types/auth';

export type DevUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            devUsers?: DevUser[] | null;
            [key: string]: unknown;
        };
    }
}
