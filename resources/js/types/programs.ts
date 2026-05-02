import type { Department } from './departments';

export interface Section {
    id: number;
    name: string;
}

export interface CurriculumItem {
    id: number;
    subject_id: number;
    year_level: number;
    semester_type: string;
}

export interface ProgramModel {
    id: number;
    code: string;
    name: string;
    degree_level: 'bachelor' | 'master' | 'doctoral';
    department_id: number;
    description: string | null;
    duration_years: number;
    total_units: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    full_name?: string;
    degree_level_label?: string;
    department?: Department;
    sections?: Section[];
    curriculum?: CurriculumItem[];
}

export interface DegreeLevel {
    value: 'bachelor' | 'master' | 'doctoral';
    label: string;
}

export interface DepartmentOption {
    id: number;
    code: string;
    name: string;
}

export interface ProgramsIndexProps {
    data: {
        data: ProgramModel[];
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

export interface ProgramsFormProps {
    program?: ProgramModel;
    departments: DepartmentOption[];
    degreeLevels: DegreeLevel[];
}

export interface ProgramsShowProps {
    program: ProgramModel;
}
