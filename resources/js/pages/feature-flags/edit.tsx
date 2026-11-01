import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Eye,
    Flag,
    Power,
    PowerOff,
    Save,
    Shield,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as featureFlags,
    show as featureFlagsShow,
    update as featureFlagsUpdate,
} from '@/routes/feature-flags';
import type { FeatureFlagsFormProps } from '@/types';

export default function Edit({ featureFlag }: FeatureFlagsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: featureFlag?.name || '',
        key: featureFlag?.key || '',
        description: featureFlag?.description || '',
        is_enabled: featureFlag?.is_enabled ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (featureFlag) {
            put(featureFlagsUpdate.url(featureFlag.id));
        }
    };

    return (
        <>
            <Head title={`Edit Feature Flag - ${featureFlag?.name || ''}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Header & Breadcrumb Navigation */}
                <div>
                    <Link
                        href={featureFlag ? featureFlagsShow(featureFlag.id) : featureFlags()}
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to {featureFlag ? featureFlag.name : 'Feature Flags'}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <Flag className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Edit Feature Flag
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Modify flag activation state, key identifier, and rollout description.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Form Section (7 cols) */}
                    <div className="space-y-6 lg:col-span-7">
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-semibold">Flag Specifications</CardTitle>
                                <CardDescription className="text-xs">
                                    Update operational details for flag #{featureFlag?.id}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Flag Name */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Feature Flag Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Collapsible Sidebar Navigation"
                                            required
                                            className="h-10 text-sm"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Flag Key */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="key" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Unique Key Identifier *
                                            </Label>
                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                [a-z0-9_]
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="key"
                                                value={data.key}
                                                onChange={(e) =>
                                                    setData('key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                                                }
                                                placeholder="e.g., nav_group_collapsible"
                                                required
                                                className="h-10 font-mono text-sm pr-10"
                                            />
                                            {data.key && (
                                                <div className="absolute right-3 top-2.5">
                                                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                                                        valid
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            System settings reference for this toggle.
                                        </p>
                                        <InputError message={errors.key} />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Functional Scope & Description (Optional)
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Explain what capabilities this flag unlocks and who has access..."
                                            rows={3}
                                            className="text-sm resize-none"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Activation State Toggle Card */}
                                    <div className="space-y-2 pt-1">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Current Activation State
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div
                                                onClick={() => setData('is_enabled', false)}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                                                    !data.is_enabled
                                                        ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/40'
                                                        : 'border-border/70 bg-card hover:border-border'
                                                }`}
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-muted-foreground">
                                                    <PowerOff className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        Disabled (Inactive)
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                                        Feature code path is deactivated across all routes.
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                onClick={() => setData('is_enabled', true)}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                                                    data.is_enabled
                                                        ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/40'
                                                        : 'border-border/70 bg-card hover:border-border'
                                                }`}
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                    <Power className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        Active / Enabled
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                                        Immediately active and usable in production.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-4 border-t">
                                        <Button type="submit" disabled={processing} className="min-w-[140px] gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={featureFlag ? featureFlagsShow(featureFlag.id) : featureFlags()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview & Rollout Policy (5 cols) */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Live Directory Preview Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Live Preview</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Simulated appearance in feature governance dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {data.name || 'Feature Flag Title'}
                                            </p>
                                            <code className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                                                {data.key || 'feature_flag_key'}
                                            </code>
                                        </div>
                                        <Badge
                                            className={
                                                data.is_enabled
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-border bg-muted text-muted-foreground'
                                            }
                                        >
                                            {data.is_enabled ? (
                                                <>
                                                    <Power className="mr-1 h-3 w-3" />
                                                    Enabled
                                                </>
                                            ) : (
                                                <>
                                                    <PowerOff className="mr-1 h-3 w-3" />
                                                    Disabled
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {data.description || 'No description specified yet.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational Rollout Policy Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Rollout Guidelines</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Operational best practices for deploying new functionality
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="rounded-lg border bg-card p-3 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Instant Safe Toggling</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-5">
                                        Enabling or disabling a flag updates live across the system immediately without service interruptions or cache clears.
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-card p-3 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <span>Gradual Feature Release</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-5">
                                        Keep experimental features disabled during timetable review, then turn them on once the semester schedule is finalized.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Governance Tip */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-semibold">Audit Logging</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Any state change to this feature flag is logged automatically in the system Activity Log, capturing the causer and timestamp.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Feature Flags', href: featureFlags() },
            { title: 'Edit Feature Flag', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
