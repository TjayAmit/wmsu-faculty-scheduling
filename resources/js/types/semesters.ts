export interface Semester {
    id: number;
    name: string;
    academic_year: string;
    semester_type: 'first' | 'second' | 'summer';
    start_date: string;
    end_date: string;
    is_current: boolean;
    created_at: string;
    updated_at: string;
}

export interface SemestersIndexProps {
    data: {
        data: Semester[];
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

export interface SemestersFormProps {
    semester?: Semester;
    semesterTypes: {
        name: string;
        value: string;
        label: string;
    }[];
}

export interface SemestersShowProps {
    semester: Semester;
}
