export interface TimeSlotModel {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TimeSlotsIndexProps {
    data: {
        data: TimeSlotModel[];
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

export interface TimeSlotsFormProps {
    timeSlot?: TimeSlotModel;
}

export interface TimeSlotsShowProps {
    timeSlot: TimeSlotModel;
}
