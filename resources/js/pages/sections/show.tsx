import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
import { index as sections, edit as sectionsEdit, destroy as sectionsDestroy, toggleStatus as sectionsToggleStatus } from '@/routes/sections';
import type { SectionsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ section }: SectionsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(sectionsDestroy(section.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleToggleStatus = () => {
        router.post(sectionsToggleStatus.url(section.id));
    };

    const enrollmentPercentage = section.max_students > 0
        ? (section.current_students / section.max_students) * 100
        : 0;

    const isFull = section.current_students >= section.max_students;

    return (
        <>
            <Head title={`Section - ${section.section_code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={sections()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>{section.section_code}</CardTitle>
                            <Badge variant={section.is_active ? 'default' : 'secondary'}>
                                {section.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {isFull && <Badge variant="destructive">Full</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                                {section.is_active ? (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={sectionsEdit(section.id)}>
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
                            <p className="text-sm font-medium text-muted-foreground">Full Identifier</p>
                            <p>{section.full_identifier || `${section.section_code} - ${section.program?.name || ''} Year ${section.year_level}`}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Program</p>
                            <p>{section.program?.name || 'Not assigned'}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Semester</p>
                            <p>
                                {section.semester
                                    ? `${section.semester.name} ${section.semester.year}`
                                    : 'Not assigned'}
                            </p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Year Level</p>
                            <p>Year {section.year_level}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Student Capacity</p>
                            <div className="flex items-center gap-2">
                                <p>{section.current_students} / {section.max_students} students</p>
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${enrollmentPercentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    ({Math.round(enrollmentPercentage)}%)
                                </span>
                            </div>
                            {!isFull && (
                                <p className="text-sm text-muted-foreground">
                                    {section.max_students - section.current_students} slots available
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Adviser</p>
                            <p>
                                {section.adviser
                                    ? `${section.adviser.first_name} ${section.adviser.last_name}`
                                    : 'No adviser assigned'}
                            </p>
                        </div>

                        {section.teacher_schedules && section.teacher_schedules.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Teacher Schedules</p>
                                <Badge variant="outline">{section.teacher_schedules.length} schedules</Badge>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{section.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{section.updated_at}</p>
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
                                <DialogTitle className="text-base font-semibold">Delete Section</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete section{' '}
                                    <span className="font-medium text-foreground">
                                        {section.section_code}
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
                            {isDeleting ? 'Deleting…' : 'Delete Section'}
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
            { title: 'Sections', href: sections() },
            { title: 'View Section', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
