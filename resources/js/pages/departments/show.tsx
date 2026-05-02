import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as departments, edit as departmentsEdit, destroy as departmentsDestroy } from '@/routes/departments';
import type { DepartmentsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ department }: DepartmentsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(departmentsDestroy(department.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Departments - ${department.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={departments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>
                                {department.full_name || `${department.code} - ${department.name}`}
                            </CardTitle>
                            <Badge variant={department.is_active ? 'default' : 'secondary'}>
                                {department.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={departmentsEdit(department.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
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
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Code</p>
                            <p>{department.code}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p>{department.name}</p>
                        </div>

                        {department.description && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p>{department.description}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Department Head</p>
                            <p>
                                {department.head
                                    ? `${department.head.first_name} ${department.head.last_name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        {department.office_location && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Office Location</p>
                                <p>{department.office_location}</p>
                            </div>
                        )}

                        {department.contact_phone && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                                <p>{department.contact_phone}</p>
                            </div>
                        )}

                        {department.contact_email && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                                <p>{department.contact_email}</p>
                            </div>
                        )}

                        {department.teachers && department.teachers.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Faculty Count</p>
                                <Badge variant="outline">{department.teachers.length} teachers</Badge>
                            </div>
                        )}

                        {department.programs && department.programs.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Programs</p>
                                <Badge variant="outline">{department.programs.length} programs</Badge>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{department.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{department.updated_at}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Department</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">
                                        {department.full_name || department.name}
                                    </span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Department'}
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
            { title: 'Departments', href: departments() },
            { title: 'View Department', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
