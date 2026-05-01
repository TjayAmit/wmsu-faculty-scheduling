import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, BookOpen } from 'lucide-react';
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
import { index as curricula, edit as curriculaEdit, destroy as curriculaDestroy } from '@/routes/curricula';
import type { CurriculaShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ curriculum }: CurriculaShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(curriculaDestroy(curriculum.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const getYearLevelLabel = (yearLevel: number): string => {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = yearLevel <= 3 ? suffixes[yearLevel] : suffixes[0];
        return `${yearLevel}${suffix} Year`;
    };

    return (
        <>
            <Head title={`Curriculum - ${curriculum.subject?.title || 'Details'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={curricula()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {curriculum.subject?.title || 'N/A'}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {curriculum.subject?.code}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Program</span>
                                    <p className="font-medium">
                                        {curriculum.program?.full_name || curriculum.program?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Year Level</span>
                                    <p className="font-medium">{getYearLevelLabel(curriculum.year_level)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Semester</span>
                                    <p className="font-medium">
                                        <Badge variant="secondary">
                                            {curriculum.semester_type_label || curriculum.semester_type}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Units</span>
                                    <p className="font-medium">
                                        {curriculum.effective_units ?? curriculum.units_override ?? curriculum.subject?.units ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Required</span>
                                    <p className="font-medium">
                                        <Badge variant={curriculum.is_required ? 'default' : 'secondary'}>
                                            {curriculum.is_required ? 'Yes' : 'No'}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Created</span>
                                    <p className="font-medium">
                                        {new Date(curriculum.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {curriculum.prerequisite_subjects && curriculum.prerequisite_subjects.length > 0 && (
                                <div className="border-t border-border pt-4">
                                    <span className="text-muted-foreground text-sm">Prerequisites</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {curriculum.prerequisite_subjects.map((prereqId, index) => (
                                            <Badge key={index} variant="outline">
                                                ID: {prereqId}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button asChild variant="outline">
                                    <Link href={curriculaEdit(curriculum.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Curriculum
                                    </Link>
                                </Button>
                                <Button variant="destructive" onClick={() => setShowDelete(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Curriculum
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Curriculum</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{curriculum.subject?.title}</span>?{' '}
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
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => {
    const { curriculum } = (page as { props: CurriculaShowProps }).props;
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Curriculum', href: curricula() },
                { title: curriculum?.subject?.title || 'Details', href: '#' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
