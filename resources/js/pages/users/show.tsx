import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    GraduationCap,
    KeyRound,
    Lock,
    Mail,
    Pencil,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    User as UserIcon,
    UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { index as activityLogs } from '@/routes/activityLogs';
import { index as rolesIndex } from '@/routes/roles';
import { show as teachersShow } from '@/routes/teachers';
import { destroy as usersDestroy, edit as usersEdit, index as users } from '@/routes/users';
import type { UsersShowProps } from '@/types';

export default function Show({ user }: UsersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(usersDestroy(user.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(user.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const initials = useMemo(() => {
        return (user.name || 'User')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, [user.name]);

    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'Standard User';
    const isVerified = Boolean(user.email_verified_at);
    const teacher = user.teacher;

    return (
        <>
            <Head title={`User Profile - ${user.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={users()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {user.name}
                            </h1>
                            <Badge
                                className={
                                    isVerified
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                }
                            >
                                {isVerified ? (
                                    <>
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Unverified
                                    </>
                                )}
                            </Badge>
                            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                                <Shield className="mr-1 h-3 w-3" />
                                {primaryRole}
                            </Badge>
                            {teacher && (
                                <Badge variant="secondary" className="gap-1">
                                    <GraduationCap className="h-3 w-3 text-primary" />
                                    Faculty Profile
                                </Badge>
                            )}
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{user.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            User account credentials, authorization permissions, and linked faculty affiliations
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={usersEdit(user.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit User</span>
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
                    {/* Main Information (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Profile Hero Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />

                            <CardHeader className="pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-primary/20 bg-primary/10 text-primary font-bold text-xl shadow-xs">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight">
                                            {user.name}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                {user.email}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCopyEmail}
                                                className="h-6 text-xs px-1.5 text-muted-foreground hover:text-foreground"
                                            >
                                                {copiedEmail ? (
                                                    <Check className="h-3 w-3 text-emerald-600 mr-1" />
                                                ) : (
                                                    <Copy className="h-3 w-3 mr-1" />
                                                )}
                                                {copiedEmail ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-lg border bg-muted/20 p-3.5">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Full Name
                                        </p>
                                        <p className="text-sm font-semibold text-foreground mt-1">
                                            {user.name}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3.5">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Email Address
                                        </p>
                                        <p className="text-sm font-semibold text-foreground mt-1 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3.5">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Verification Status
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isVerified ? (
                                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Verified on {fmtDate(user.email_verified_at)}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Pending Verification
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3.5">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Assigned Security Roles
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((r) => (
                                                    <Badge
                                                        key={r.id}
                                                        variant="outline"
                                                        className="font-medium text-xs bg-card"
                                                    >
                                                        {r.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    No special roles assigned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Linked Faculty Member Profile Card */}
                        {teacher ? (
                            <Card className="border-border/80 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            <CardTitle className="text-base font-semibold">
                                                Linked Faculty Profile
                                            </CardTitle>
                                        </div>
                                        <Badge
                                            className={
                                                teacher.is_active
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-border bg-muted text-muted-foreground'
                                            }
                                        >
                                            {teacher.is_active ? 'Active Instructor' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Academic record associated with this login account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Employee ID
                                            </p>
                                            <p className="text-sm font-bold text-foreground mt-1 font-mono">
                                                {teacher.employee_id || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-3 shadow-2xs">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Department
                                            </p>
                                            <p className="text-sm font-semibold text-foreground mt-1 truncate">
                                                {teacher.department || 'Not Assigned'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-3 shadow-2xs col-span-2 sm:col-span-1">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Academic Rank
                                            </p>
                                            <p className="text-sm font-semibold text-foreground mt-1">
                                                {teacher.rank || 'Faculty Staff'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 pt-3">
                                        <div className="text-xs text-muted-foreground">
                                            <span>Employment Type: </span>
                                            <strong className="text-foreground capitalize">
                                                {teacher.employment_type ? teacher.employment_type.replace('_', ' ') : 'Full Time'}
                                            </strong>
                                        </div>
                                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1">
                                            <Link href={teachersShow(teacher.id)}>
                                                <span>View Faculty Profile</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-border/80 bg-muted/10 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold text-muted-foreground">
                                            No Linked Faculty Profile
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    <p>
                                        This user account is not currently linked to an academic instructor profile. To attach this user to a faculty teaching load, link them through the Faculty Staff directory.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Security & Access Guard Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <KeyRound className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Account Security
                                        </CardTitle>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                        <Link href={rolesIndex()}>
                                            <span>Roles</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <CardDescription className="text-xs">
                                    Credentials & authentication policies
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Password Status</span>
                                    <span className="font-semibold text-foreground flex items-center gap-1">
                                        <Lock className="h-3 w-3 text-emerald-600" />
                                        Encrypted (Bcrypt)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Session Guard</span>
                                    <Badge variant="outline" className="font-mono text-[11px]">
                                        web
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Primary Authority</span>
                                    <span className="font-semibold text-foreground">
                                        {primaryRole}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Access Scope</span>
                                    <span className="font-medium text-foreground">
                                        {primaryRole === 'admin' || primaryRole === 'super-admin'
                                            ? 'Full Administrative Access'
                                            : 'Role Restricted'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lifecycle & Audit Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Lifecycle & Auditing
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
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">User ID</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        #{user.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Registered At</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(user.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Modified</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(user.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Institutional Governance Note */}
                        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-semibold">
                                        Governance & Compliance
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    User accounts are subject to WMSU University IT Security Policies. Activity is traced through the system audit trail.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete User Account"
                itemName={user.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Users', href: users() },
            { title: 'View User', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
