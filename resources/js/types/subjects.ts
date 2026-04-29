export interface Subject {
    id: number;
    code: string;
    title: string;
    units: number;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SubjectsIndexProps {
    data: {
        data: Subject[];
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

export interface SubjectsFormProps {
    subject?: Subject;
}

export interface SubjectsShowProps {
    subject: Subject;
}
