import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, UserPlus, UserX, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { index as teachers, edit as teachersEdit, destroy as teachersDestroy } from '@/routes/teachers';
import type { TeachersShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CreateUserAccountForm from '@/components/teachers/CreateUserAccountForm';

export default function Show({ teacher, availableRoles, availableUsers }: TeachersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [showLinkUserDialog, setShowLinkUserDialog] = useState(false);

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

    const linkUserAccount = (data: any) => {
        router.post(`/teachers/${teacher.id}/link-user-account`, data, {
            onSuccess: () => setShowLinkUserDialog(false),
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

    return (
        <>
            <Head title={`${teacher.full_name} - Teacher Details`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={teachers()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>{teacher.full_name}</CardTitle>
                            <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                                {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={teachersEdit(teacher.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            {!teacher.has_user_account ? (
                                <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Create User Account
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create User Account</DialogTitle>
                                            <DialogDescription>
                                                Create a login account for {teacher.full_name}
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
                                <Button variant="destructive" onClick={unlinkUserAccount}>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Unlink Account
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Account Status */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">User Account Status</h3>
                            {teacher.has_user_account && teacher.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="default">
                                            <UserPlus className="w-3 h-3 mr-1" />
                                            Account Linked
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            User: {teacher.user.name} ({teacher.user.email})
                                        </span>
                                    </div>
                                    {teacher.user?.roles && Array.isArray(teacher.user.roles) && teacher.user.roles.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">Roles:</span>
                                            <div className="flex space-x-1">
                                                {teacher.user.roles.map((role: any) => (
                                                    <Badge key={role.id} variant="outline">
                                                        {role.display_name || role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            <UserX className="w-3 h-3 mr-1" />
                                            No User Account
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Teacher profile exists but no login account
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                            <DialogTrigger asChild>
                                                <Button size="sm">
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Create Account
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create User Account</DialogTitle>
                                                    <DialogDescription>
                                                        Create a login account for {teacher.full_name}
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
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p>{teacher.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                                        <p>{teacher.employee_id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Employment Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Employment Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                                        <div>{getEmploymentTypeBadge(teacher.employment_type)}</div>
                                    </div>
                                </div>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                    {teacher.department && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Department</p>
                                            <p>{teacher.department}</p>
                                        </div>
                                    )}
                                    
                                    {teacher.rank && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Academic Rank</p>
                                            <p>{teacher.rank}</p>
                                        </div>
                                    )}
                                    
                                    {teacher.date_hired && (
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Date Hired</p>
                                                <p>{teacher.date_hired}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                {teacher.phone && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                            <p>{teacher.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {teacher.address && (
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                                            <p>{teacher.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* System Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">System Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                    <p>{teacher.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                    <p>{teacher.updated_at}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Teacher</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{teacher.full_name}</span>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
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
            { title: 'View Teacher', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
