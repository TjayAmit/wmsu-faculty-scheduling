import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2, Mail, Shield, CheckCircle2, Clock, UserCheck, XCircle, Building2 } from 'lucide-react';
import { useState } from 'react';
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
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import { index as staff, edit as staffEdit, destroy as staffDestroy } from '@/routes/staff';
import type { StaffShowProps } from '@/types';

export default function Show({ user }: StaffShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(staffDestroy(user.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'S';

    return (
        <>
            <Head title={`Faculty Staff - ${user.name}`} />

            {/* Canvas strictly spans full left-to-right viewport width */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Header (Outside Cards, No redundant back button) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {user.name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.email_verified_at
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                            >
                                <span
                                    className={`size-1.5 rounded-full ${
                                        user.email_verified_at ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                />
                                {user.email_verified_at ? 'Verified' : 'Unverified'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Faculty Staff Member • <span className="text-foreground">{user.email}</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                            <Link href={staffEdit(user.id)}>
                                <Pencil className="h-4 w-4" />
                                Edit Staff Member
                            </Link>
                        </Button>
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

                {/* 2. Overview Profile Hero Banner (Full width) */}
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
                                    {user.name}
                                </h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="size-3.5 text-muted-foreground" />
                                    {user.email}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Badge variant="outline" className="text-xs">
                                        Faculty Staff
                                    </Badge>
                                    {user.email_verified_at ? (
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1 text-xs"
                                        >
                                            <UserCheck className="size-3" />
                                            Email Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                                            Pending Verification
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Highlights Summary with Formatted Dates */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-sm">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</p>
                                <p className="font-semibold text-foreground mt-1 truncate">
                                    {user.department ? `${user.department.code}` : 'Unassigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Role</p>
                                <p className="font-semibold text-foreground mt-1">Faculty Staff</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Verified</p>
                                <p className="font-semibold text-foreground mt-1">
                                    {user.email_verified_at ? fmtDate(user.email_verified_at) : 'Not Verified'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Registered</p>
                                <p className="font-semibold text-foreground mt-1">{fmtDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. Detailed Two-Column Content Grid (Full width) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    {/* Left Column (2 Cols): Account Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">Staff Account Details</CardTitle>
                                <CardDescription className="text-sm">
                                    Institutional profile identification and login credentials.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border pt-0">
                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground">Full Name</span>
                                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground">Email Address</span>
                                    <a
                                        href={`mailto:${user.email}`}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        {user.email}
                                    </a>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground">Verification Status</span>
                                    <span className="text-sm font-medium text-foreground">
                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium">
                                                <CheckCircle2 className="size-4" />
                                                Verified on {fmtDate(user.email_verified_at)}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-amber-600 dark:text-amber-400 gap-1.5 font-medium">
                                                <XCircle className="size-4" />
                                                Not Yet Verified
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground">Assigned Role</span>
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <Shield className="size-3 text-muted-foreground" />
                                        Faculty Staff
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between py-3.5">
                                    <span className="text-sm text-muted-foreground">Assigned Department</span>
                                    {user.department ? (
                                        <Badge
                                            variant="outline"
                                            className="border-primary/20 bg-primary/5 text-primary text-xs gap-1"
                                        >
                                            <Building2 className="size-3" />
                                            {user.department.code} - {user.department.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">
                                            No department assigned
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col): Record Metadata */}
                    <div className="space-y-6">
                        <Card className="shadow-xs">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-base font-semibold">Record Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y divide-border pt-0 text-sm">
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3.5" /> Created At
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{fmtDate(user.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3.5" /> Last Modified
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{fmtDate(user.updated_at)}</span>
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
                                <DialogTitle className="text-base font-semibold">Delete Staff Member</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to permanently delete{' '}
                                    <span className="font-semibold text-foreground">{user.name}</span>?
                                    This action cannot be undone.
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
                            {isDeleting ? 'Deleting…' : 'Delete Staff Member'}
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
            { title: 'Faculty Staff', href: staff() },
            { title: 'Staff Profile', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
