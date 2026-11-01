import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Copy,
    Cpu,
    Database,
    FileCode,
    FileJson,
    Fingerprint,
    Layers,
    Lock,
    Pencil,
    Plus,
    RefreshCw,
    Shield,
    Sparkles,
    Trash2,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { destroy as activityLogsDestroy, index as activityLogs } from '@/routes/activityLogs';
import type { ActivityLogsShowProps } from '@/types';

// Helper to strip PHP namespace (e.g., App\Models\DraftSchedule -> DraftSchedule)
function cleanModelName(type: string | null | undefined): string {
    if (!type) return 'System';
    const parts = type.split('\\');
    return parts[parts.length - 1] || type;
}

// Format property key for display (e.g., "schedules_count" -> "Schedules Count")
function formatKeyName(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Show({ activityLog }: ActivityLogsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [viewMode, setViewMode] = useState<'structured' | 'json'>('structured');

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(activityLogsDestroy(activityLog.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleCopyJson = () => {
        const payload = JSON.stringify(activityLog, null, 2);
        navigator.clipboard.writeText(payload);
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    // Detect action badge variant and styling
    const eventInfo = useMemo(() => {
        const desc = (activityLog.description || '').toLowerCase();
        const ev = (activityLog.event || '').toLowerCase();

        if (ev.includes('create') || desc.includes('created') || desc.includes('add')) {
            return {
                label: activityLog.event || 'Created',
                variant: 'default' as const,
                icon: Plus,
                badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                bgGlow: 'from-emerald-500/10 to-transparent',
            };
        }
        if (ev.includes('update') || desc.includes('updated') || desc.includes('edit')) {
            return {
                label: activityLog.event || 'Updated',
                variant: 'secondary' as const,
                icon: Pencil,
                badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                iconColor: 'text-amber-600 dark:text-amber-400',
                bgGlow: 'from-amber-500/10 to-transparent',
            };
        }
        if (ev.includes('delete') || desc.includes('deleted') || desc.includes('remove')) {
            return {
                label: activityLog.event || 'Deleted',
                variant: 'destructive' as const,
                icon: Trash2,
                badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
                iconColor: 'text-destructive',
                bgGlow: 'from-destructive/10 to-transparent',
            };
        }
        if (desc.includes('generate') || desc.includes('schedule')) {
            return {
                label: activityLog.event || 'Generated',
                variant: 'default' as const,
                icon: Sparkles,
                badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
                iconColor: 'text-purple-600 dark:text-purple-400',
                bgGlow: 'from-purple-500/10 to-transparent',
            };
        }

        return {
            label: activityLog.event || 'System Event',
            variant: 'outline' as const,
            icon: Activity,
            badgeClass: 'border-border bg-muted/60 text-muted-foreground',
            iconColor: 'text-primary',
            bgGlow: 'from-primary/10 to-transparent',
        };
    }, [activityLog.event, activityLog.description]);

    const EventIcon = eventInfo.icon;

    // Extract attribute changes (diff) if available
    const attributeDiff = useMemo(() => {
        const changes = activityLog.attribute_changes;
        const props = activityLog.properties;

        // Case 1: Spatie standard { attributes: {...}, old: {...} } inside properties
        if (props && typeof props === 'object' && ('attributes' in props || 'old' in props)) {
            const newVals = (props.attributes as Record<string, unknown>) || {};
            const oldVals = (props.old as Record<string, unknown>) || {};
            const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));

            if (allKeys.length > 0) {
                return allKeys.map((key) => ({
                    key,
                    oldVal: oldVals[key] !== undefined ? oldVals[key] : null,
                    newVal: newVals[key] !== undefined ? newVals[key] : null,
                }));
            }
        }

        // Case 2: attribute_changes direct format
        if (changes && typeof changes === 'object' && !Array.isArray(changes)) {
            const keys = Object.keys(changes);
            if (keys.length > 0) {
                return keys.map((key) => {
                    const val = changes[key];
                    if (val && typeof val === 'object' && ('old' in val || 'new' in val)) {
                        return {
                            key,
                            oldVal: (val as Record<string, unknown>).old,
                            newVal: (val as Record<string, unknown>).new,
                        };
                    }
                    return {
                        key,
                        oldVal: null,
                        newVal: val,
                    };
                });
            }
        }

        return [];
    }, [activityLog.attribute_changes, activityLog.properties]);

    // Contextual properties (excluding raw attributes/old)
    const contextualProperties = useMemo(() => {
        const props = activityLog.properties;
        if (!props || typeof props !== 'object' || Array.isArray(props)) return [];

        return Object.entries(props).filter(
            ([key]) => key !== 'attributes' && key !== 'old'
        );
    }, [activityLog.properties]);

    const causerInitials = useMemo(() => {
        const name = activityLog.causer?.name || activityLog.causer?.email || 'System';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, [activityLog.causer]);

    const cleanSubject = cleanModelName(activityLog.subject_type);
    const cleanCauser = cleanModelName(activityLog.causer_type);

    return (
        <>
            <Head title={`Activity Log #${activityLog.id} - ${activityLog.description.substring(0, 40)}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={activityLogs()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Activity Logs
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Activity Log #{activityLog.id}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${eventInfo.badgeClass}`}>
                                <EventIcon className="h-3 w-3" />
                                {eventInfo.label}
                            </span>
                            {activityLog.log_name && (
                                <Badge variant="outline" className="text-xs font-mono">
                                    channel: {activityLog.log_name}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Recorded audit trail event captured on {fmtDate(activityLog.created_at)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyJson}
                            className="gap-1.5"
                        >
                            {copiedJson ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Copied JSON</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy JSON</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Log</span>
                        </Button>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Main Log Details (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Event Overview Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className={`absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl ${eventInfo.bgGlow} rounded-bl-full pointer-events-none`} />
                            
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                            <EventIcon className={`h-6 w-6 ${eventInfo.iconColor}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                Event Description
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                High-level summary of the registered action
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className="font-mono text-xs">
                                        ID: {activityLog.id}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <p className="text-base font-semibold text-foreground tracking-tight">
                                        {activityLog.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" />
                                        Timestamp: <span className="font-mono text-foreground">{activityLog.created_at}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                    <div className="rounded-md border p-3 bg-card">
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                            Target Domain
                                        </p>
                                        <p className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                                            <Layers className="h-3.5 w-3.5 text-primary" />
                                            {cleanSubject}
                                        </p>
                                    </div>
                                    <div className="rounded-md border p-3 bg-card">
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                            Subject Record
                                        </p>
                                        <p className="text-sm font-semibold mt-1 font-mono">
                                            {activityLog.subject_id ? `#${activityLog.subject_id}` : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="rounded-md border p-3 bg-card col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                            Logged By
                                        </p>
                                        <p className="text-sm font-semibold mt-1 truncate">
                                            {activityLog.causer?.name || activityLog.causer?.email || 'System'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attribute Changes / Diff Table (if model values were updated) */}
                        {attributeDiff.length > 0 && (
                            <Card className="border-border/80 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base">Attribute Changes</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Comparison between prior and updated values
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="w-[30%]">Attribute Field</TableHead>
                                                <TableHead className="w-[35%]">Previous State</TableHead>
                                                <TableHead className="w-[35%]">Updated State</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attributeDiff.map((diff) => (
                                                <TableRow key={diff.key}>
                                                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                                                        {diff.key}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                                        {diff.oldVal === null || diff.oldVal === undefined ? (
                                                            <span className="italic text-muted-foreground/60">null</span>
                                                        ) : typeof diff.oldVal === 'object' ? (
                                                            <pre className="max-w-[200px] truncate text-[11px]">
                                                                {JSON.stringify(diff.oldVal)}
                                                            </pre>
                                                        ) : (
                                                            <span className="line-through decoration-destructive/50 text-destructive/80">
                                                                {String(diff.oldVal)}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
                                                        {diff.newVal === null || diff.newVal === undefined ? (
                                                            <span className="italic text-muted-foreground/60">null</span>
                                                        ) : typeof diff.newVal === 'object' ? (
                                                            <pre className="max-w-[200px] truncate text-[11px]">
                                                                {JSON.stringify(diff.newVal)}
                                                            </pre>
                                                        ) : (
                                                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                                                                {String(diff.newVal)}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Event Properties / Execution Payload */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base">Event Properties & Payload</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Contextual execution data attached to this activity
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={viewMode === 'structured' ? 'default' : 'ghost'}
                                        onClick={() => setViewMode('structured')}
                                        className="h-7 text-xs px-2.5"
                                    >
                                        <Layers className="mr-1.5 h-3 w-3" />
                                        Structured
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={viewMode === 'json' ? 'default' : 'ghost'}
                                        onClick={() => setViewMode('json')}
                                        className="h-7 text-xs px-2.5"
                                    >
                                        <FileCode className="mr-1.5 h-3 w-3" />
                                        Raw JSON
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {viewMode === 'structured' ? (
                                    contextualProperties.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {contextualProperties.map(([key, val]) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-col justify-between rounded-lg border bg-card p-3 shadow-xs hover:border-primary/30 transition-colors"
                                                >
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                        {formatKeyName(key)}
                                                    </span>
                                                    <div className="mt-1">
                                                        {val === null || val === undefined ? (
                                                            <span className="inline-block text-xs italic text-muted-foreground/60">
                                                                null / not set
                                                            </span>
                                                        ) : typeof val === 'number' ? (
                                                            <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                                                                {val}
                                                            </span>
                                                        ) : typeof val === 'boolean' ? (
                                                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${val ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'}`}>
                                                                {val ? 'TRUE' : 'FALSE'}
                                                            </span>
                                                        ) : typeof val === 'object' ? (
                                                            <pre className="text-xs font-mono bg-muted/60 p-2 rounded max-h-32 overflow-auto">
                                                                {JSON.stringify(val, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <span className="text-sm font-medium text-foreground break-words">
                                                                {String(val)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                            <FileJson className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                            <p className="text-sm font-medium text-muted-foreground">
                                                No additional contextual properties
                                            </p>
                                            <p className="text-xs text-muted-foreground/70">
                                                This log event does not carry extra payload metadata.
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <div className="relative">
                                        <pre className="rounded-lg border bg-zinc-950 p-4 font-mono text-xs text-zinc-100 dark:bg-zinc-900 overflow-x-auto max-h-80 leading-relaxed">
                                            {JSON.stringify(activityLog.properties || {}, null, 2)}
                                        </pre>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={handleCopyJson}
                                            className="absolute top-3 right-3 h-7 text-xs bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                        >
                                            {copiedJson ? <Check className="h-3 w-3 mr-1 text-emerald-400" /> : <Copy className="h-3 w-3 mr-1" />}
                                            {copiedJson ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Causer / Actor Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Originating Actor</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Entity that initiated this transaction
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                                    <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary font-bold">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {causerInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {activityLog.causer?.name || activityLog.causer?.email || 'Automated System'}
                                        </p>
                                        {activityLog.causer?.email && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {activityLog.causer.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between border-b pb-1.5">
                                        <span className="text-muted-foreground">Actor Type</span>
                                        <Badge variant="outline" className="font-mono text-[11px]">
                                            {cleanCauser}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-1.5">
                                        <span className="text-muted-foreground">Actor ID</span>
                                        <span className="font-mono font-medium text-foreground">
                                            {activityLog.causer_id ? `#${activityLog.causer_id}` : 'None'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Execution Context</span>
                                        <span className="font-medium text-foreground">
                                            {activityLog.causer ? 'Authenticated Session' : 'Scheduled / CLI'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subject / Target Entity Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Target Subject</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Model instance impacted by this event
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="rounded-lg border bg-muted/20 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-foreground text-sm">
                                            {cleanSubject}
                                        </span>
                                        {activityLog.subject_id && (
                                            <Badge variant="secondary" className="font-mono">
                                                ID #{activityLog.subject_id}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground font-mono text-[11px] truncate">
                                        {activityLog.subject_type || 'General System Subject'}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between border-b pb-1.5">
                                        <span className="text-muted-foreground">Subject Status</span>
                                        <span className="font-medium text-foreground">
                                            {activityLog.subject ? 'Active in DB' : 'Detached / Historic'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-1.5">
                                        <span className="text-muted-foreground">Channel</span>
                                        <span className="font-mono text-foreground">
                                            {activityLog.log_name || 'default'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Governance & Immutability */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/30 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Audit Trail Governance</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    This activity log record is captured automatically for security auditing, compliance, and timetable rollback tracking.
                                </p>
                                <div className="rounded-md border border-border/80 bg-background/80 p-2.5 flex items-start gap-2">
                                    <Fingerprint className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground text-[11px]">Audit Stamp</p>
                                        <p className="font-mono text-[10px] text-muted-foreground">
                                            REC-{activityLog.id}-{new Date(activityLog.created_at).getTime()}
                                        </p>
                                    </div>
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
                title="Delete Activity Log Entry"
                itemName={`Activity Log #${activityLog.id}`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Activity Logs', href: activityLogs() },
            { title: 'View Activity Log', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
