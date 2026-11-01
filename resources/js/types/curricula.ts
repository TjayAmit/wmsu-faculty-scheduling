export interface Program {
    id: number;
    code: string;
    name: string;
    degree_level: string;
    full_name?: string;
    department_id?: number;
    department?: {
        id: number;
        code: string;
        name: string;
    };
}

export interface CurriculumSubject {
    id: number;
    code: string;
    title: string;
    units: number;
}

export interface Curriculum {
    id: number;
    program_id: number;
    subject_id: number;
    year_level: number;
    semester_type: 'first' | 'second' | 'summer';
    semester_type_label?: string;
    is_required: boolean;
    prerequisite_subjects: number[];
    units_override: number | null;
    effective_units?: number;
    created_at: string;
    updated_at: string;
    program?: Program;
    subject?: CurriculumSubject;
}

export interface CurriculaStats {
    total: number;
    required: number;
    elective: number;
    programs_count: number;
    subjects_count: number;
    has_prerequisites: number;
}

export interface CurriculaIndexProps {
    data: {
        data: Curriculum[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        department_id?: string | number;
        per_page?: number;
    };
    departments?: Array<{ id: number; code: string; name: string }>;
    programs: Program[];
    subjects: CurriculumSubject[];
    stats?: CurriculaStats;
}

export interface CurriculaFormProps {
    curriculum?: Curriculum;
    departments?: Array<{ id: number; code: string; name: string }>;
    programs: Program[];
    subjects: CurriculumSubject[];
    semesterTypes: SemesterType[];
}

export interface CurriculaShowProps {
    curriculum: Curriculum;
}

export interface SemesterType {
    value: 'first' | 'second' | 'summer';
    label: string;
}
