import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Flag,
    History,
    Pencil,
    Power,
    PowerOff,
    RefreshCw,
    Shield,
    Sparkles,
    Trash2,
    User,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { index as activityLogs } from '@/routes/activityLogs';
import {
    destroy as featureFlagsDestroy,
    edit as featureFlagsEdit,
    index as featureFlags,
    toggle as featureFlagsToggle,
} from '@/routes/feature-flags';
import type { FeatureFlagsShowProps } from '@/types';

export default function Show({ featureFlag }: FeatureFlagsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(featureFlagsDestroy(featureFlag.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleToggle = () => {
        setIsToggling(true);
        router.post(
            featureFlagsToggle.url(featureFlag.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsToggling(false),
            }
        );
    };

    const copyKey = () => {
        navigator.clipboard.writeText(featureFlag.key);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const enabledByInitials = featureFlag.enabledBy?.name
        ? featureFlag.enabledBy.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)
        : 'SYS';

    return (
        <>
            <Head title={`Feature Flag - ${featureFlag.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={featureFlags()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Feature Flags
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {featureFlag.name}
                            </h1>
                            <Badge
                                className={
                                    featureFlag.is_enabled
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }
                            >
                                {featureFlag.is_enabled ? (
                                    <>
                                        <Power className="mr-1 h-3 w-3" />
                                        Active / Enabled
                                    </>
                                ) : (
                                    <>
                                        <PowerOff className="mr-1 h-3 w-3" />
                                        Disabled
                                    </>
                                )}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{featureFlag.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Runtime feature toggle and deployment rollout configuration
                        </p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={featureFlag.is_enabled ? 'outline' : 'default'}
                            size="sm"
                            onClick={handleToggle}
                            disabled={isToggling}
                            className="gap-1.5"
                        >
                            {featureFlag.is_enabled ? (
                                <>
                                    <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Disable Flag</span>
                                </>
                            ) : (
                                <>
                                    <Power className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Enable Flag</span>
                                </>
                            )}
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={featureFlagsEdit(featureFlag.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Flag</span>
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Main Overview & Integration (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Status Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div
                                className={`absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl ${
                                    featureFlag.is_enabled
                                        ? 'from-emerald-500/15 to-transparent'
                                        : 'from-muted-foreground/10 to-transparent'
                                }`}
                            />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                                            featureFlag.is_enabled
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border-border bg-muted/60 text-muted-foreground'
                                        }`}
                                    >
                                        {featureFlag.is_enabled ? (
                                            <Zap className="h-6 w-6" />
                                        ) : (
                                            <PowerOff className="h-6 w-6" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            {featureFlag.is_enabled
                                                ? 'Feature is Active in Production'
                                                : 'Feature is Deactivated'}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {featureFlag.is_enabled
                                                ? 'The associated capabilities and route rules are currently executing across the system.'
                                                : 'This toggle is turned off; users will experience standard fallback flows.'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Key Identifier Pill */}
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Programmatic Key Identifier
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyKey}
                                            className="h-7 text-xs px-2"
                                        >
                                            {copiedKey ? (
                                                <>
                                                    <Check className="h-3 w-3 mr-1 text-emerald-600" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    Copy Key
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="rounded bg-background px-3 py-1.5 font-mono text-sm font-semibold text-foreground border shadow-2xs">
                                            {featureFlag.key}
                                        </code>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Scope & Purpose
                                    </span>
                                    <div className="rounded-lg border bg-card p-4 text-sm text-foreground leading-relaxed">
                                        {featureFlag.description || (
                                            <span className="italic text-muted-foreground">
                                                No detailed description was recorded for this feature flag.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational Rollout Policy & Impact */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Operational Impact & Governance
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Administrative policies and runtime behavior when this feature is toggled
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3.5 text-xs">
                                <div className="rounded-lg border bg-card p-3.5 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <span>Instant Live Synchronization</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-6">
                                        Changes to this feature toggle propagate across active sessions immediately without requiring server restarts or scheduled maintenance windows.
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-card p-3.5 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span>Safe Fallback Protection</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-6">
                                        When deactivated, all associated user interfaces and scheduling modules fall back seamlessly to standard operational defaults.
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-card p-3.5 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <History className="h-4 w-4 text-amber-600" />
                                        <span>Full Audit Compliance</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-6">
                                        Every activation, deactivation, and metadata update is permanently recorded in the system audit logs with the administrator’s identity and timestamp.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Instant State Control Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Power className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Runtime State Control
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Toggle flag live across production instances
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">
                                            Status: {featureFlag.is_enabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {featureFlag.is_enabled
                                                ? 'Active for all requests'
                                                : 'Inactive in runtime'}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={featureFlag.is_enabled ? 'outline' : 'default'}
                                        onClick={handleToggle}
                                        disabled={isToggling}
                                        className="h-8 text-xs font-semibold"
                                    >
                                        {featureFlag.is_enabled ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>

                                <div className="space-y-2 text-xs pt-1">
                                    {featureFlag.enabledBy && (
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <span className="text-muted-foreground">Enabled By</span>
                                            <span className="font-semibold text-foreground">
                                                {featureFlag.enabledBy.name}
                                            </span>
                                        </div>
                                    )}

                                    {featureFlag.enabled_at && (
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <span className="text-muted-foreground">Enabled Timestamp</span>
                                            <span className="font-medium text-foreground">
                                                {fmtDate(featureFlag.enabled_at)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Registered</span>
                                        <span className="font-medium text-foreground">
                                            {fmtDate(featureFlag.created_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Last Modified</span>
                                        <span className="font-medium text-foreground">
                                            {fmtDate(featureFlag.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Governance & Activity Logs Card */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Audit Trail
                                        </CardTitle>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                        <Link href={activityLogs()}>
                                            <span>Logs</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    All state toggles and modifications to this feature flag are permanently logged in the system Activity Log.
                                </p>
                                <div className="rounded-lg border bg-background/80 p-3 space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-[11px]">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        <span>Zero-Downtime Guarantee</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                        Toggling takes effect immediately without application restarts or cache clears required.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Feature Flag"
                itemName={featureFlag.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Feature Flags', href: featureFlags() },
            { title: 'View Feature Flag', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
