import type { Subject } from './subjects';

export interface TimeSlot {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

export interface Semester {
    id: number;
    name: string;
    academic_year: string;
    semester_type: 'first' | 'second' | 'summer';
    start_date: string;
    end_date: string;
    is_current: boolean;
}

export interface ScheduleTeacher {
    id: number;
    user_id: number;
    employee_id: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface TeacherAssignment {
    id: number;
    teacher_id: number;
    schedule_id: number;
    assigned_at: string;
    assigned_by: number;
    is_active: boolean;
    teacher: ScheduleTeacher;
}

export interface Schedule {
    id: number;
    subject_id: number;
    semester_id: number;
    time_slot_id: number;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    room: string;
    section: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    subject: Subject;
    semester: Semester;
    time_slot: TimeSlot;
    teacher_assignment: TeacherAssignment | null;
}

export interface SchedulesIndexProps {
    data: {
        data: Schedule[];
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

export interface SchedulesFormProps {
    schedule?: Schedule;
    subjects: {
        id: number;
        code: string;
        title: string;
    }[];
    semesters: {
        id: number;
        name: string;
        academic_year: string;
        is_current: boolean;
    }[];
    timeSlots: {
        id: number;
        name: string;
        start_time: string;
        end_time: string;
    }[];
    daysOfWeek: {
        name: string;
        value: string;
        label: string;
    }[];
}

export interface SchedulesShowProps {
    schedule: Schedule;
}
