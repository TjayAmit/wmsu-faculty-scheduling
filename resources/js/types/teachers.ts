import type { User } from './auth';
import type { Role } from './roles';

export interface Teacher {
    id: number;
    user_id?: number | null;
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    department?: string | null;
    rank?: string | null;
    employment_type: 'full_time' | 'part_time' | 'casual';
    employment_type_label?: string;
    date_hired?: string | null;
    phone?: string | null;
    address?: string | null;
    is_active: boolean;
    has_user_account: boolean;
    full_name: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    user?: User | null;
    assignments_count?: number;
    active_assignments_count?: number;
}

export interface CreateTeacherRequest {
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    department?: string;
    rank?: string;
    employment_type: 'full_time' | 'part_time' | 'casual';
    date_hired?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
    user_id?: number | null;
}

export interface CreateUserAccountRequest {
    name: string;
    password: string;
    password_confirmation: string;
    roles?: string[];
}

export interface LinkUserAccountRequest {
    user_id: number;
    roles?: string[];
}

export interface TeacherActiveAssignment {
    id: number;
    draft_schedule_id?: number;
    schedule_id: number;
    subject_code: string;
    subject_title: string;
    units: number;
    section: string;
    room: string;
    semester: string;
    time_slots: Array<{ day: string; start?: string; end?: string; start_time?: string; end_time?: string }>;
    assigned_at?: string;
}

export interface TeacherWeeklySession {
    assignment_id: number;
    draft_schedule_id?: number;
    schedule_id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    room: string;
    start_time: string;
    end_time: string;
    semester: string;
}

export interface TeacherAvailableSchedule {
    id: number;
    name: string;
    subject_code: string;
    subject_title: string;
    units: number;
    section: string;
    room?: string;
    time_slots: Array<{ day: string; start?: string; end?: string }>;
    semester: string;
}

export interface TeacherFilters {
    search?: string;
    without_user?: boolean;
    is_active?: boolean;
    department?: string;
    employment_type?: string;
    workload?: string;
}

export interface TeachersIndexProps {
    data: {
        data: Teacher[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: TeacherFilters;
    employmentTypes: Array<{ value: string; label: string }>;
    stats?: {
        total_teachers: number;
        assigned_teachers: number;
        unassigned_teachers: number;
        total_course_offerings: number;
    };
}

export interface TeachersFormProps {
    teacher?: Teacher;
    users?: {
        id: number;
        name: string;
        email: string;
    }[];
    employmentTypes: Array<{ value: string; label: string }>;
    departments?: Array<{ id: number; code: string; name: string }>;
    userDepartment?: { id: number; code: string; name: string } | null;
    availableRoles?: Role[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
}

export interface TeachersShowProps {
    teacher: Teacher;
    activeAssignments?: TeacherActiveAssignment[];
    weeklySchedule?: Record<string, TeacherWeeklySession[]>;
    workload?: {
        total_courses: number;
        total_units: number;
        total_weekly_hours: number;
    };
    availableSchedules?: TeacherAvailableSchedule[];
    availableRoles?: Role[] | string[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
}
