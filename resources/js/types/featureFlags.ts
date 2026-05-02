export interface FeatureFlagEnabledBy {
    id: number;
    name: string;
}

export interface FeatureFlag {
    id: number;
    name: string;
    key: string;
    description: string | null;
    is_enabled: boolean;
    enabled_by: number | null;
    enabled_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    enabledBy?: FeatureFlagEnabledBy | null;
}

export interface FeatureFlagsIndexProps {
    data: {
        data: FeatureFlag[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        is_enabled?: boolean;
        per_page?: number;
    };
}

export interface FeatureFlagsFormProps {
    featureFlag?: FeatureFlag;
}

export interface FeatureFlagsShowProps {
    featureFlag: FeatureFlag;
}
