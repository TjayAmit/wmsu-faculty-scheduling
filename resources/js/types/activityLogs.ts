export interface ActivityLog {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    event: string | null;
    causer_type: string | null;
    causer_id: number | null;
    attribute_changes: Record<string, unknown> | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    subject?: {
        id: number;
        [key: string]: unknown;
    } | null;
    causer?: {
        id: number;
        name?: string;
        email?: string;
        [key: string]: unknown;
    } | null;
}

export interface ActivityLogsIndexProps {
    data: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        log_name?: string;
        event?: string;
        per_page?: number;
    };
    logNames: string[];
    events: string[];
}

export interface ActivityLogsShowProps {
    activityLog: ActivityLog;
}
