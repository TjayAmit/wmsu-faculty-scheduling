import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as semesters, show as semestersShow, update as semestersUpdate } from '@/routes/semesters';
import type { SemestersFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ semester, semesterTypes }: SemestersFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: semester?.name || '',
        academic_year: semester?.academic_year || '',
        semester_type: semester?.semester_type || '',
        start_date: semester?.start_date || '',
        end_date: semester?.end_date || '',
        is_current: semester?.is_current ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (semester) {
            put(semestersUpdate.url(semester.id));
        }
    };

    return (
        <>
            <Head title="Edit Semester" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={semester ? semestersShow(semester.id) : semesters()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Semester</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Semester Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Fall Semester 2024"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="academic_year">Academic Year</Label>
                                <Input
                                    id="academic_year"
                                    value={data.academic_year}
                                    onChange={(e) => setData('academic_year', e.target.value)}
                                    placeholder="e.g., 2024-2025"
                                    required
                                />
                                <InputError message={errors.academic_year} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="semester_type">Semester Type</Label>
                                <Select
                                    value={data.semester_type}
                                    onValueChange={(value) => setData('semester_type', value)}
                                >
                                    <SelectTrigger id="semester_type">
                                        <SelectValue placeholder="Select semester type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.semester_type} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_current"
                                    checked={data.is_current}
                                    onCheckedChange={(checked) => setData('is_current', checked as boolean)}
                                />
                                <Label htmlFor="is_current" className="text-sm font-normal">
                                    Set as current semester
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={semester ? semestersShow(semester.id) : semesters()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Semesters', href: semesters() },
            { title: 'Edit Semester', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
