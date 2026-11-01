export interface SubjectSchedule {
    id: number;
    subject_id: number;
    semester_id: number;
    classroom_id?: number | null;
    room?: string | null;
    section?: string | null;
    is_active: boolean;
    time_slots?: Array<{
        day: string;
        time_slot_id: string | number;
    }>;
    semester?: {
        id: number;
        name: string;
        academic_year: string;
        is_current?: boolean;
    } | null;
    classroom?: {
        id: number;
        building: string;
        room_number: string;
        room_name?: string | null;
        capacity?: number;
    } | null;
    teacher_assignment?: {
        id: number;
        teacher?: {
            id: number;
            full_name?: string;
            user?: {
                id: number;
                name: string;
                email?: string;
            } | null;
        } | null;
    } | null;
}

export interface SubjectCurriculum {
    id: number;
    program_id: number;
    subject_id: number;
    year_level: number;
    semester_type: string;
    is_required: boolean;
    units_override?: number | string | null;
    program?: {
        id: number;
        code: string;
        name: string;
        degree_level?: string;
    } | null;
}

export interface Subject {
    id: number;
    code: string;
    title: string;
    units: number | string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    schedules?: SubjectSchedule[];
    curricula?: SubjectCurriculum[];
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
    stats?: {
        total: number;
        active: number;
        inactive: number;
        total_units: number;
        avg_units: number;
        scheduled_count: number;
        unscheduled_count: number;
    };
}

export interface SubjectsFormProps {
    subject?: Subject;
}

export interface SubjectsShowProps {
    subject: Subject;
}
