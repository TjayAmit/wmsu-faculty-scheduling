import { Head, Link, router } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    UserPlus,
    UserX,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    Shield,
    CheckCircle2,
    Clock,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import CreateUserAccountForm from '@/components/teachers/CreateUserAccountForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { index as teachers, edit as teachersEdit, destroy as teachersDestroy } from '@/routes/teachers';
import type { TeachersShowProps } from '@/types';

export default function Show({ teacher, availableRoles }: TeachersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);

    const fullName =
        teacher.full_name ||
        `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() ||
        'Teacher';

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(teachersDestroy(teacher.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const createUserAccount = (data: any) => {
        router.post(`/teachers/${teacher.id}/create-user-account`, data, {
            onSuccess: () => setShowCreateUserDialog(false),
        });
    };

    const unlinkUserAccount = () => {
        if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
            router.delete(`/teachers/${teacher.id}/unlink-user-account`);
        }
    };

    const getEmploymentTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            full_time: 'default',
            part_time: 'secondary',
            casual: 'outline',
        };
        const labels: Record<string, string> = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            casual: 'Casual',
        };

        return <Badge variant={variants[type] || 'default'}>{labels[type] || type}</Badge>;
    };

    const initials =
        (teacher.first_name?.[0] || '') + (teacher.last_name?.[0] || '') ||
        fullName.slice(0, 2).toUpperCase() ||
        'T';

    return (
        <>
            <Head title={`${fullName} - Teacher Details`} />

            {/* Canvas strictly spans full left-to-right viewport width */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (Outside of Cards, No redundant back button) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {fullName}
                            </h1>
                            <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    teacher.is_active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }`}
                            >
                                <span
                                    className={`size-1.5 rounded-full ${
                                        teacher.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'
                                    }`}
                                />
                                {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Employee ID: <span className="font-mono font-medium text-foreground">{teacher.employee_id}</span>
                            {teacher.department && ` • ${teacher.department}`}
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                            <Link href={teachersEdit(teacher.id)}>
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>

                        {!teacher.has_user_account ? (
                            <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9 gap-1.5">
                                        <UserPlus className="h-4 w-4" />
                                        Create Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Create User Account</DialogTitle>
                                        <DialogDescription>
                                            Generate login credentials and assign roles for {fullName}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CreateUserAccountForm
                                        teacherEmail={teacher.email}
                                        availableRoles={availableRoles || []}
                                        onSubmit={createUserAccount}
                                    />
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                                onClick={unlinkUserAccount}
                            >
                                <UserX className="h-4 w-4" />
                                Unlink User
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* 2. Overview Profile Hero Banner (Full width card) */}
                <Card className="overflow-hidden border-border bg-card shadow-xs w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 sm:size-20 border-2 border-border shadow-xs">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl sm:text-2xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    {fullName}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                    <span>{teacher.department || 'Unassigned Department'}</span>
                                    {teacher.rank && (
                                        <>
                                            <span>•</span>
                                            <span className="font-medium text-foreground">{teacher.rank}</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    {getEmploymentTypeBadge(teacher.employment_type)}
                                    {teacher.has_user_account ? (
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1"
                                        >
                                            <UserCheck className="size-3" />
                                            Portal Account Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            No Portal Account
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Highlights Summary with Formatted Dates */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-sm">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee ID</p>
                                <p className="font-mono font-semibold text-foreground mt-1">{teacher.employee_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employment</p>
                                <p className="font-semibold text-foreground mt-1">
                                    {teacher.employment_type === 'full_time' ? 'Full Time' : teacher.employment_type === 'part_time' ? 'Part Time' : 'Casual'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Hired</p>
                                <p className="font-semibold text-foreground mt-1">{fmtDate(teacher.date_hired)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. Detailed Two-Column Content Grid (Full width) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    {/* Left Column (2 Cols): Academic & Contact Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card: Academic & Institutional Details */}
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">Academic & Departmental Details</CardTitle>
                                <CardDescription className="text-sm">
                                    Faculty status, collegiate assignments, and academic rank.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border pt-0">
                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Building2 className="size-4 text-muted-foreground" />
                                        Department
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {teacher.department || 'Not Assigned'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Briefcase className="size-4 text-muted-foreground" />
                                        Academic Rank
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {teacher.rank || 'Instructor'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        Date Hired
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {fmtDate(teacher.date_hired)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-muted-foreground" />
                                        Faculty Status
                                    </span>
                                    <Badge variant={teacher.is_active ? 'default' : 'secondary'} className="text-xs">
                                        {teacher.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card: Contact Details */}
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">Contact & Personal Details</CardTitle>
                                <CardDescription className="text-sm">
                                    Institutional and personal communication channels.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border pt-0">
                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Mail className="size-4 text-muted-foreground" />
                                        Email Address
                                    </span>
                                    <a
                                        href={`mailto:${teacher.email}`}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        {teacher.email}
                                    </a>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Phone className="size-4 text-muted-foreground" />
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {teacher.phone || '—'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        Residential Address
                                    </span>
                                    <span className="text-sm font-medium text-foreground max-w-sm text-right">
                                        {teacher.address || '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col): Portal Access & Audit Metadata */}
                    <div className="space-y-6">
                        {/* Card: System Account Status */}
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">System Account</CardTitle>
                                <CardDescription className="text-sm">
                                    Portal access credentials and role security.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                {teacher.has_user_account && teacher.user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                <UserCheck className="size-4" />
                                            </div>
                                            <div className="space-y-0.5 text-xs">
                                                <p className="font-semibold text-foreground text-sm">{teacher.user.name}</p>
                                                <p className="text-muted-foreground">{teacher.user.email}</p>
                                            </div>
                                        </div>

                                        {teacher.user?.roles && Array.isArray(teacher.user.roles) && teacher.user.roles.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Assigned Security Roles
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {teacher.user.roles.map((role: any) => (
                                                        <Badge key={role.id} variant="outline" className="text-xs gap-1">
                                                            <Shield className="size-3 text-muted-foreground" />
                                                            {role.display_name || role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={unlinkUserAccount}
                                            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 mt-2"
                                        >
                                            <UserX className="size-4 mr-2" />
                                            Unlink User Account
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-center py-2">
                                        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                                            <UserX className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">No Account Linked</p>
                                            <p className="text-xs text-muted-foreground">
                                                This teacher has no active login credentials for the portal.
                                            </p>
                                        </div>
                                        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="w-full mt-2 gap-1.5">
                                                    <UserPlus className="size-4" />
                                                    Create User Account
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Create User Account</DialogTitle>
                                                    <DialogDescription>
                                                        Create a login account for {fullName}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <CreateUserAccountForm
                                                    teacherEmail={teacher.email}
                                                    availableRoles={availableRoles || []}
                                                    onSubmit={createUserAccount}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Card: Audit Trail & Record Metadata */}
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">Record Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y divide-border pt-0 text-sm">
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3.5" /> Created At
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{fmtDate(teacher.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3.5" /> Last Modified
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{fmtDate(teacher.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5 space-y-1">
                            <DialogHeader>
                                <DialogTitle className="text-base font-semibold">Delete Teacher Profile</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to permanently delete{' '}
                                    <span className="font-semibold text-foreground">{fullName}</span>?
                                    All associated schedule slots will need to be reassigned.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Teacher'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Teachers', href: teachers() },
            { title: 'Teacher Profile', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
