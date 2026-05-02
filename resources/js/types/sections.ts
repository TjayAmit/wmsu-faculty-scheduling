import type { Teacher } from './teachers';

export interface SectionProgram {
    id: number;
    name: string;
}

export interface SectionSemester {
    id: number;
    name: string;
    year: string;
}

export interface SectionTeacherSchedule {
    id: number;
    teacher_id: number;
    schedule_id: number;
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
}

export interface SectionSemesterOption {
    id: number;
    name: string;
    year: string;
}

export interface SectionTeacherOption {
    id: number;
    first_name: string;
    last_name: string;
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
