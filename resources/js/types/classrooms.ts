export interface ClassroomAvailabilitySummary {
    weekly_booked_hours: number;
    weekly_available_hours: number;
    weekly_utilization_rate: number;
    status: 'full' | 'busy' | 'moderate' | 'available';
    is_full: boolean;
    operating_hours: string;
}

export interface FreeTimeWindow {
    start: string;
    end: string;
    duration_minutes: number;
    duration_hours: number;
    formatted: string;
}

export interface DailyAvailability {
    day: string;
    booked_hours: number;
    available_hours: number;
    utilization_rate: number;
    booked_intervals: Array<{
        start: number;
        end: number;
        start_time: string;
        end_time: string;
        subject_code?: string;
        subject_title?: string;
        section?: string;
        schedule_id?: number;
    }>;
    free_windows: FreeTimeWindow[];
    is_full: boolean;
}

export interface ClassroomDetailedAvailability {
    operating_hours: string;
    daily_capacity_hours: number;
    weekly_capacity_hours: number;
    weekly_booked_hours: number;
    weekly_available_hours: number;
    weekly_utilization_rate: number;
    status: 'full' | 'busy' | 'moderate' | 'available';
    is_full: boolean;
    daily: Record<string, DailyAvailability>;
}

export interface Classroom {
    id: number;
    building: string;
    room_number: string;
    room_name: string | null;
    capacity: number;
    room_type: string;
    equipment: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    full_identifier?: string;
    room_type_label?: string;
    availability?: ClassroomAvailabilitySummary;
    zkteco_device?: {
        id: number;
        device_name: string;
        device_ip?: string;
        status?: string;
    } | null;
}

export interface RoomType {
    value: string;
    label: string;
}

export interface ClassroomsIndexProps {
    data: {
        data: Classroom[];
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
        total_capacity: number;
        avg_capacity: number;
        with_device: number;
        without_device: number;
        total_buildings: number;
        full_rooms?: number;
        available_rooms?: number;
        avg_utilization?: number;
        operating_hours?: string;
    };
}

export interface ClassroomsFormProps {
    classroom?: Classroom;
    roomTypes?: RoomType[];
}

export interface ClassroomsShowProps {
    classroom: Classroom;
    weeklySchedule?: Record<string, any[]>;
    roomSchedules?: any;
    availability?: ClassroomDetailedAvailability;
    totalWeeklyClasses?: number;
    totalReservations?: number;
}
