import type { Teacher } from './teachers';

export interface SectionProgram {
    id: number;
    name: string;
    code?: string;
}

export interface SectionSemester {
    id: number;
    name: string;
    academic_year?: string;
    semester_type?: string;
    year?: string;
}

export interface SectionTeacherSchedule {
    id: number;
    teacher_id: number;
    subject_id?: number;
    scheduled_date?: string;
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    room?: string;
    status?: string;
    subject?: {
        id: number;
        code: string;
        name: string;
        units: number;
    };
    teacher?: {
        id: number;
        first_name: string;
        last_name: string;
        employee_id: string;
    };
}

export interface SectionModel {
    id: number;
    section_code: string;
    program_id: number;
    semester_id: number;
    year_level: number;
    max_students: number;
    current_students: number;
    adviser_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    program?: SectionProgram;
    semester?: SectionSemester;
    adviser?: Teacher | null;
    teacher_schedules?: SectionTeacherSchedule[];
    available_slots?: number;
    enrollment_percentage?: number;
    full_identifier?: string;
}

export interface SectionProgramOption {
    id: number;
    name: string;
    code?: string;
}

export interface SectionSemesterOption {
    id: number;
    name: string;
    year?: string;
    academic_year?: string;
    is_current?: boolean;
}

export interface SectionTeacherOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface SectionsStats {
    total: number;
    active: number;
    inactive: number;
    total_enrolled: number;
    total_capacity: number;
    utilization_rate: number;
}

export interface SectionsIndexProps {
    data: {
        data: SectionModel[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        program_id?: number;
        semester_id?: number;
        year_level?: number;
        is_active?: boolean;
        per_page?: number;
    };
    programs: SectionProgramOption[];
    semesters: SectionSemesterOption[];
    stats?: SectionsStats;
}

export interface SectionsFormProps {
    section?: SectionModel;
    programs: SectionProgramOption[];
    semesters: SectionSemesterOption[];
    teachers: SectionTeacherOption[];
}

export interface SectionsShowProps {
    section: SectionModel;
}
