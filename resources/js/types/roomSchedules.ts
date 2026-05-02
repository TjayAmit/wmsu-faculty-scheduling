import type { Classroom } from './classrooms';

export interface LinkedSchedule {
    id: number;
    subject_id: number;
    semester_id: number;
    time_slots: string[];
    room: string;
    section: string;
    is_active: boolean;
    subject?: {
        id: number;
        code: string;
        name: string;
    };
    semester?: {
        id: number;
        name: string;
        academic_year: string;
    };
}

export interface RoomSchedule {
    id: number;
    classroom_id: number;
    schedule_id: number | null;
    date: string;
    start_time: string;
    end_time: string;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    classroom?: Classroom;
    schedule?: LinkedSchedule | null;
}

export interface ClassroomOption {
    id: number;
    building: string;
    room_number: string;
    room_name: string | null;
}

export interface RoomSchedulesIndexProps {
    data: {
        data: RoomSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        classroom_id?: number;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    classrooms: ClassroomOption[];
}

export interface RoomSchedulesFormProps {
    roomSchedule?: RoomSchedule;
    classrooms: ClassroomOption[];
}

export interface RoomSchedulesShowProps {
    roomSchedule: RoomSchedule;
}

export interface RoomSchedulesCalendarProps {
    schedules: Array<RoomSchedule & { schedule?: LinkedSchedule }>;
    filters: {
        classroom_id?: number;
        start_date: string;
        end_date: string;
    };
    classrooms: ClassroomOption[];
}
