import { useFeatureFlags } from '@/hooks/use-feature-flags';

interface FeatureFlagCheckProps {
    featureFlag: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureFlagCheck({ featureFlag, children, fallback }: FeatureFlagCheckProps) {
    const { isEnabled } = useFeatureFlags();

    if (isEnabled(featureFlag)) {
        return <>{children}</>;
    }

    return <>{fallback || null}</>;
}
