import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Clock,
    ExternalLink,
    Eye,
    Filter,
    Layers,
    Lock,
    Pencil,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { destroy as rolesDestroy, edit as rolesEdit, index as roles } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';
import type { RolesShowProps } from '@/types';

const ACTION_COLORS: Record<string, { badge: string; icon: typeof Eye }> = {
    view: {
        badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
        icon: Eye,
    },
    create: {
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        icon: Plus,
    },
    edit: {
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        icon: Pencil,
    },
    delete: {
        badge: 'border-destructive/30 bg-destructive/10 text-destructive',
        icon: Trash2,
    },
};

export default function Show({ role }: RolesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<'all' | 'view' | 'create' | 'edit' | 'delete'>('all');

    const isProtectedRole = role.name === 'super-admin' || role.name === 'admin';

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(rolesDestroy(role.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const perms = role.permissions || [];
        return perms.reduce((acc, permission) => {
            const moduleName = permission.name.split('.')[0] || 'other';
            if (!acc[moduleName]) {
                acc[moduleName] = [];
            }
            acc[moduleName].push(permission);
            return acc;
        }, {} as Record<string, typeof perms>);
    }, [role.permissions]);

    // Filter modules and permissions based on search and action filter
    const filteredGroupedPermissions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const result: Record<string, typeof role.permissions> = {};

        for (const [moduleName, perms] of Object.entries(groupedPermissions)) {
            if (!perms) continue;

            const matchingPerms = perms.filter((perm) => {
                const action = perm.name.split('.')[1] || perm.name;
                const matchesSearch =
                    !query ||
                    moduleName.toLowerCase().includes(query) ||
                    perm.name.toLowerCase().includes(query);
                const matchesAction = actionFilter === 'all' || action.toLowerCase() === actionFilter;

                return matchesSearch && matchesAction;
            });

            if (matchingPerms.length > 0) {
                result[moduleName] = matchingPerms;
            }
        }

        return result;
    }, [groupedPermissions, searchQuery, actionFilter]);

    const totalPermissions = role.permissions?.length || 0;
    const totalModules = Object.keys(groupedPermissions).length;

    return (
        <>
            <Head title={`Role Details - ${role.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Header & Breadcrumbs */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={roles()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {role.name}
                            </h1>
                            {isProtectedRole ? (
                                <Badge variant="secondary" className="gap-1 border-primary/20 bg-primary/10 text-primary">
                                    <Lock className="h-3 w-3" />
                                    System Protected
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="gap-1">
                                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                    Custom Role
                                </Badge>
                            )}
                            <Badge variant="outline" className="font-mono text-xs">
                                guard: {role.guard_name}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{role.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            System authorization role governing access policies and granular model permissions
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={rolesEdit(role.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Permissions</span>
                            </Link>
                        </Button>
                        {!isProtectedRole && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                                className="gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Role</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Main Permissions Section (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Role Overview Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Role Specifications
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Authorization scope and system authority
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Total Permissions
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1 font-mono">
                                            {totalPermissions}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Domains Covered
                                        </p>
                                        <p className="text-xl font-bold text-foreground mt-1 font-mono">
                                            {totalModules}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Auth Guard
                                        </p>
                                        <p className="text-base font-semibold text-foreground mt-1 font-mono">
                                            {role.guard_name}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Classification
                                        </p>
                                        <p className="text-sm font-semibold text-foreground mt-1">
                                            {isProtectedRole ? 'Built-in Admin' : 'Academic Role'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Granular Permissions Directory Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-primary" />
                                            <CardTitle className="text-base font-semibold">
                                                Assigned Permissions ({totalPermissions})
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-xs mt-0.5">
                                            Explicit capabilities granted to accounts assigned this role
                                        </CardDescription>
                                    </div>

                                    {/* Action Filter Pills */}
                                    <div className="flex flex-wrap items-center gap-1">
                                        {(['all', 'view', 'create', 'edit', 'delete'] as const).map((act) => (
                                            <Button
                                                key={act}
                                                type="button"
                                                variant={actionFilter === act ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setActionFilter(act)}
                                                className="h-7 text-xs px-2.5 capitalize"
                                            >
                                                {act}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search Filter */}
                                <div className="relative mt-3">
                                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search granted permissions or modules..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9 pl-8 text-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                {Object.keys(filteredGroupedPermissions).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(filteredGroupedPermissions).map(([moduleName, perms]) => {
                                            const formattedModule = moduleName
                                                .replace(/_/g, ' ')
                                                .replace(/\b\w/g, (c) => c.toUpperCase());

                                            return (
                                                <div
                                                    key={moduleName}
                                                    className="rounded-lg border bg-card p-3.5 shadow-2xs hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2.5 border-b pb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {formattedModule}
                                                            </span>
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                ({perms?.length || 0})
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] font-mono text-muted-foreground">
                                                            {moduleName}.*
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {perms?.map((permission) => {
                                                            const action =
                                                                permission.name.split('.')[1] || permission.name;
                                                            const colorConfig =
                                                                ACTION_COLORS[action] || {
                                                                    badge: 'border-border bg-muted text-muted-foreground',
                                                                    icon: Check,
                                                                };
                                                            const IconComp = colorConfig.icon;

                                                            return (
                                                                <span
                                                                    key={permission.id}
                                                                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium font-mono ${colorConfig.badge}`}
                                                                >
                                                                    <IconComp className="h-3 w-3" />
                                                                    {action}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg border-dashed bg-muted/20">
                                        <ShieldAlert className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            {searchQuery || actionFilter !== 'all'
                                                ? 'No permissions match your filter'
                                                : 'No permissions assigned to this role'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {searchQuery || actionFilter !== 'all'
                                                ? 'Try adjusting your search query or action filter.'
                                                : 'Click "Edit Permissions" above to assign modules and capabilities.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Domain Access Overview Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Domain Access Summary
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Overview of functional modules accessible by this role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.keys(groupedPermissions).length > 0 ? (
                                    <div className="space-y-1.5">
                                        {Object.entries(groupedPermissions).map(([mod, perms]) => {
                                            const formatted = mod
                                                .replace(/_/g, ' ')
                                                .replace(/\b\w/g, (c) => c.toUpperCase());
                                            const actions = perms?.map(p => p.name.split('.')[1] || p.name).join(', ');

                                            return (
                                                <div
                                                    key={mod}
                                                    className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2 text-xs"
                                                >
                                                    <span className="font-semibold text-foreground">
                                                        {formatted}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[150px]">
                                                        {actions}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        No domain access recorded.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* RBAC Governance & User Assignments Card */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            User Accounts
                                        </CardTitle>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                        <Link href={usersIndex()}>
                                            <span>Users</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    Users assigned to the <strong className="text-foreground">{role.name}</strong> role inherit all {totalPermissions} permissions immediately upon assignment.
                                </p>
                                <div className="rounded-lg border bg-background/80 p-3 space-y-1">
                                    <p className="font-semibold text-foreground text-[11px]">
                                        Granular Policy Sync
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                        Permissions are verified via Spatie RBAC gates at both HTTP controller and Blade/Inertia UI levels.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lifecycle & Timestamps Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Lifecycle & Auditing
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Role ID</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        #{role.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(role.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(role.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            {!isProtectedRole && (
                <ConfirmDeleteDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Delete Authorization Role"
                    itemName={role.name}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'View Role', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
