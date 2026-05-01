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
}

export interface ClassroomsFormProps {
    classroom?: Classroom;
    roomTypes?: RoomType[];
}

export interface ClassroomsShowProps {
    classroom: Classroom;
}
