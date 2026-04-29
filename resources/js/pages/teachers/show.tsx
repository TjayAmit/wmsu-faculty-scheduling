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
import { index as teachers, edit as teachersEdit, destroy as teachersDestroy } from '@/routes/teachers';
import type { TeachersShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ teacher }: TeachersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(teachersDestroy(teacher.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
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
            <Head title={`Teachers - ${teacher.user.name}`} />

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
                            <CardTitle>{teacher.user.name}</CardTitle>
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
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{teacher.user.email}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                            <p>{teacher.employee_id}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                            <div>{getEmploymentTypeBadge(teacher.employment_type)}</div>
                        </div>

                        {teacher.department && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Department</p>
                                <p>{teacher.department}</p>
                            </div>
                        )}

                        {teacher.rank && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Rank</p>
                                <p>{teacher.rank}</p>
                            </div>
                        )}

                        {teacher.date_hired && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Date Hired</p>
                                <p>{teacher.date_hired}</p>
                            </div>
                        )}

                        {teacher.phone && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p>{teacher.phone}</p>
                            </div>
                        )}

                        {teacher.address && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Address</p>
                                <p>{teacher.address}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{teacher.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{teacher.updated_at}</p>
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
                                    <span className="font-medium text-foreground">{teacher.user.name}</span>?
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
