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
import { index as programs, edit as programsEdit, destroy as programsDestroy } from '@/routes/programs';
import type { ProgramsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ program }: ProgramsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(programsDestroy(program.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Programs - ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={programs()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>
                                {program.full_name || `${program.code} - ${program.name}`}
                            </CardTitle>
                            <Badge variant={program.is_active ? 'default' : 'secondary'}>
                                {program.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={programsEdit(program.id)}>
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
                            <p>{program.code}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p>{program.name}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Department</p>
                            <p>
                                {program.department
                                    ? `${program.department.code} - ${program.department.name}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Degree Level</p>
                            <Badge variant="secondary">
                                {program.degree_level_label || program.degree_level}
                            </Badge>
                        </div>

                        {program.description && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p>{program.description}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p>{program.duration_years} years</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                            <p>{program.total_units} units</p>
                        </div>

                        {program.sections && program.sections.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Sections</p>
                                <Badge variant="outline">{program.sections.length} sections</Badge>
                            </div>
                        )}

                        {program.curriculum && program.curriculum.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Curriculum Items</p>
                                <Badge variant="outline">{program.curriculum.length} subjects</Badge>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{program.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{program.updated_at}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Program</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">
                                        {program.full_name || program.name}
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
                            {isDeleting ? 'Deleting…' : 'Delete Program'}
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
            { title: 'Programs', href: programs() },
            { title: 'View Program', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
