import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCheck,
    Lock,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as roles, store as rolesStore } from '@/routes/roles';
import type { RolesFormProps } from '@/types';

const ACTION_COLORS: Record<string, string> = {
    view: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    create: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    edit: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    delete: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const SUGGESTED_ROLES = [
    'Curriculum Coordinator',
    'Department Chairperson',
    'Timetable Officer',
    'Academic Auditor',
];

export default function Create({ permissions = [] }: RolesFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const [searchFilter, setSearchFilter] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(rolesStore());
    };

    const togglePermission = (permissionId: number) => {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const toggleAllPermissions = () => {
        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', permissions.map((p) => p.id));
        }
    };

    const selectViewOnlyPermissions = () => {
        const viewPerms = permissions
            .filter((p) => p.name.endsWith('.view') || p.name.includes('view'))
            .map((p) => p.id);
        setData('permissions', viewPerms);
    };

    // Group permissions by module ("module.action")
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            const moduleName = permission.name.split('.')[0] || 'general';
            if (!acc[moduleName]) {
                acc[moduleName] = [];
            }
            acc[moduleName].push(permission);
            return acc;
        }, {} as Record<string, typeof permissions>);
    }, [permissions]);

    // Filter modules based on search
    const filteredGroupedPermissions = useMemo(() => {
        if (!searchFilter.trim()) return groupedPermissions;
        const q = searchFilter.toLowerCase();
        const filtered: Record<string, typeof permissions> = {};

        for (const [mod, perms] of Object.entries(groupedPermissions)) {
            const matchesMod = mod.toLowerCase().includes(q);
            const matchingPerms = perms.filter(
                (p) => matchesMod || p.name.toLowerCase().includes(q)
            );
            if (matchingPerms.length > 0) {
                filtered[mod] = matchingPerms;
            }
        }
        return filtered;
    }, [groupedPermissions, searchFilter]);

    const toggleModulePermissions = (perms: typeof permissions) => {
        const moduleIds = perms.map((p) => p.id);
        const allSelected = moduleIds.every((id) => data.permissions.includes(id));

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((id) => !moduleIds.includes(id))
            );
        } else {
            const combined = Array.from(new Set([...data.permissions, ...moduleIds]));
            setData('permissions', combined);
        }
    };

    const formatModuleName = (name: string) => {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const totalSelected = data.permissions.length;
    const isAllSelected = permissions.length > 0 && totalSelected === permissions.length;

    return (
        <>
            <Head title="Create Role" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={roles()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Create Authorization Role
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Define a new administrative or academic access role, designate permission boundaries, and assign system capabilities.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Identification Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Role Designation
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="name" className="text-xs font-semibold">
                                                Role Name <span className="text-destructive">*</span>
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Unique system role title
                                            </span>
                                        </div>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Curriculum Coordinator, Academic Auditor"
                                            required
                                            className="text-sm"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Suggested Templates */}
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[11px] text-muted-foreground">
                                            Role Name Suggestions:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {SUGGESTED_ROLES.map((title) => (
                                                <button
                                                    key={title}
                                                    type="button"
                                                    onClick={() => setData('name', title)}
                                                    className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                                                        data.name === title
                                                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    {title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions Matrix Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-primary" />
                                            <CardTitle className="text-base font-semibold">
                                                Granular Permission Matrix
                                            </CardTitle>
                                            <Badge variant="outline" className="text-xs ml-1 font-mono">
                                                {totalSelected} / {permissions.length} Granted
                                            </Badge>
                                        </div>

                                        {/* Quick Selection Buttons */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleAllPermissions}
                                                className="text-xs h-7 px-2"
                                            >
                                                {isAllSelected ? 'Deselect All' : 'Select All'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={selectViewOnlyPermissions}
                                                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                View Only
                                            </Button>
                                            {totalSelected > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setData('permissions', [])}
                                                    className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Search input inside header */}
                                    <div className="pt-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                            <Input
                                                value={searchFilter}
                                                onChange={(e) => setSearchFilter(e.target.value)}
                                                placeholder="Filter modules or specific permissions..."
                                                className="pl-8 text-xs h-8"
                                            />
                                            {searchFilter && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchFilter('')}
                                                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4 space-y-3">
                                    {Object.entries(filteredGroupedPermissions).length === 0 ? (
                                        <div className="text-center py-8 text-xs text-muted-foreground">
                                            No permissions match "{searchFilter}".
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {Object.entries(filteredGroupedPermissions).map(([moduleName, perms]) => {
                                                const moduleIds = perms.map((p) => p.id);
                                                const allModuleSelected = moduleIds.every((id) =>
                                                    data.permissions.includes(id)
                                                );
                                                const someModuleSelected =
                                                    !allModuleSelected &&
                                                    moduleIds.some((id) => data.permissions.includes(id));

                                                return (
                                                    <div
                                                        key={moduleName}
                                                        className="rounded-lg border border-border/80 bg-card p-3 transition-colors hover:border-primary/40 space-y-2.5"
                                                    >
                                                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`module-${moduleName}`}
                                                                    checked={allModuleSelected}
                                                                    onCheckedChange={() => toggleModulePermissions(perms)}
                                                                />
                                                                <Label
                                                                    htmlFor={`module-${moduleName}`}
                                                                    className="text-xs font-semibold cursor-pointer"
                                                                >
                                                                    {formatModuleName(moduleName)}
                                                                </Label>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {perms.filter((p) => data.permissions.includes(p.id)).length} of {perms.length} selected
                                                            </span>
                                                        </div>

                                                        {/* Action Checkboxes */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                                                            {perms.map((permission) => {
                                                                const actionName =
                                                                    permission.name.split('.')[1] || permission.name;
                                                                const isChecked = data.permissions.includes(permission.id);

                                                                return (
                                                                    <label
                                                                        key={permission.id}
                                                                        htmlFor={`perm-${permission.id}`}
                                                                        className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-all ${
                                                                            isChecked
                                                                                ? `${ACTION_COLORS[actionName] || 'border-primary/30 bg-primary/10 text-primary'} font-medium shadow-2xs`
                                                                                : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                                        }`}
                                                                    >
                                                                        <Checkbox
                                                                            id={`perm-${permission.id}`}
                                                                            checked={isChecked}
                                                                            onCheckedChange={() => togglePermission(permission.id)}
                                                                        />
                                                                        <span className="text-xs capitalize select-none truncate">
                                                                            {actionName}
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action Submission Buttons */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium"
                                        >
                                            <Plus className="mr-1.5 h-4 w-4" />
                                            {processing ? 'Creating Role…' : 'Create Role'}
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={roles()}>Cancel</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Right Sidebar: Live Role Preview & Security Best Practices */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Live Role Preview Card */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Role Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">
                                            {data.name.trim() || 'Role Name'}
                                        </Badge>
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5 px-1.5 gap-1 shadow-none">
                                            <Check className="h-3 w-3" />
                                            Active Role
                                        </Badge>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-base text-foreground leading-snug">
                                            {data.name.trim() || 'Custom Authorization Role'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {totalSelected} permission{totalSelected === 1 ? '' : 's'} assigned across {Object.keys(groupedPermissions).length} modules.
                                        </p>
                                    </div>

                                    {/* Capabilities Breakdown */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Active Module Access:
                                        </p>
                                        {Object.entries(groupedPermissions)
                                            .filter(([_, perms]) =>
                                                perms.some((p) => data.permissions.includes(p.id))
                                            )
                                            .slice(0, 5)
                                            .map(([mod, perms]) => {
                                                const activeCount = perms.filter((p) =>
                                                    data.permissions.includes(p.id)
                                                ).length;
                                                return (
                                                    <div
                                                        key={mod}
                                                        className="flex items-center justify-between text-xs py-0.5"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {formatModuleName(mod)}
                                                        </span>
                                                        <span className="font-mono text-[11px] font-medium text-foreground">
                                                            {activeCount === perms.length
                                                                ? 'Full Access'
                                                                : `${activeCount}/${perms.length}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        {totalSelected === 0 && (
                                            <p className="text-[11px] text-muted-foreground italic">
                                                No permissions selected yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Simulation of how this authorization role appears in user management and access audits.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Security Best Practices Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Access Control Guidance
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Least Privilege:</strong> Grant only the specific capabilities required for the staff member's administrative duties.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Destructive Actions:</strong> Exercise caution when enabling <code className="text-destructive font-mono text-[11px]">delete</code> permissions for timetables and user records.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Role Assignment:</strong> Assign this role to staff members in the <Link href="/users" className="text-primary hover:underline font-medium">Users</Link> module.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
