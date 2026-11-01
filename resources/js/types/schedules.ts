import type { FacultyDraftSchedule } from './facultyDraftSchedules';
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

export interface ScheduleTimeSlot {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    time_slot_id: number;
}

export interface Schedule {
    id: number;
    subject_id: number;
    semester_id: number;
    time_slots: ScheduleTimeSlot[];
    room: string;
    section: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    subject: Subject;
    semester: Semester;
    teacher_assignment: TeacherAssignment | null;
}

export interface SchedulesIndexProps {
    activeTab?: 'schedules' | 'drafts';
    data: {
        data: Schedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    drafts?: {
        data: FacultyDraftSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    counts?: {
        schedules: number;
        drafts: number;
        pending_drafts: number;
    };
    stats?: {
        total_schedules: number;
        assigned_schedules: number;
        unassigned_schedules: number;
        total_drafts: number;
        pending_drafts: number;
        approved_drafts: number;
        rejected_drafts: number;
    };
    filters: {
        tab?: string;
        search?: string;
        draft_status?: string;
        draft_search?: string;
        per_page?: number;
    };
}

export interface ScheduleSectionOption {
    id: number;
    section_code: string;
    program_id: number;
    semester_id: number;
    year_level: number;
    max_students?: number;
    current_students?: number;
    program?: {
        id: number;
        code: string;
        name: string;
    } | null;
}

export interface SchedulesFormProps {
    schedule?: Schedule;
    subjects: {
        id: number;
        code: string;
        title: string;
        units?: number;
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
        value: string;
        label: string;
    }[];
    sections?: ScheduleSectionOption[];
}

export interface SchedulesShowProps {
    schedule: Schedule;
}
