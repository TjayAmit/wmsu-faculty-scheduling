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
import { index as sections, show as sectionsShow, update as sectionsUpdate } from '@/routes/sections';
import type { SectionsFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ section, programs, semesters, teachers }: SectionsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        section_code: section?.section_code || '',
        program_id: section?.program_id?.toString() || '',
        semester_id: section?.semester_id?.toString() || '',
        year_level: section?.year_level?.toString() || '1',
        max_students: section?.max_students?.toString() || '50',
        current_students: section?.current_students?.toString() || '0',
        adviser_id: section?.adviser_id?.toString() || '',
        is_active: section?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (section) {
            put(sectionsUpdate.url(section.id));
        }
    };

    return (
        <>
            <Head title="Edit Section" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={section ? sectionsShow(section.id) : sections()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Section</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="section_code">Section Code *</Label>
                                    <Input
                                        id="section_code"
                                        value={data.section_code}
                                        onChange={(e) => setData('section_code', e.target.value)}
                                        placeholder="e.g., BSIT-1A"
                                        required
                                    />
                                    <InputError message={errors.section_code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="year_level">Year Level *</Label>
                                    <Select
                                        value={data.year_level}
                                        onValueChange={(value) => setData('year_level', value)}
                                    >
                                        <SelectTrigger id="year_level">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    Year {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.year_level} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="program_id">Program *</Label>
                                    <Select
                                        value={data.program_id}
                                        onValueChange={(value) => setData('program_id', value)}
                                    >
                                        <SelectTrigger id="program_id">
                                            <SelectValue placeholder="Select program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programs?.map((program) => (
                                                <SelectItem key={program.id} value={program.id.toString()}>
                                                    {program.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.program_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester_id">Semester *</Label>
                                    <Select
                                        value={data.semester_id}
                                        onValueChange={(value) => setData('semester_id', value)}
                                    >
                                        <SelectTrigger id="semester_id">
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesters?.map((semester) => (
                                                <SelectItem key={semester.id} value={semester.id.toString()}>
                                                    {semester.name} {semester.year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.semester_id} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_students">Max Students *</Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.max_students} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="current_students">Current Students</Label>
                                    <Input
                                        id="current_students"
                                        type="number"
                                        min="0"
                                        value={data.current_students}
                                        onChange={(e) => setData('current_students', e.target.value)}
                                    />
                                    <InputError message={errors.current_students} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adviser_id">Adviser (Optional)</Label>
                                <Select
                                    value={data.adviser_id}
                                    onValueChange={(value) => setData('adviser_id', value)}
                                >
                                    <SelectTrigger id="adviser_id">
                                        <SelectValue placeholder="Select adviser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers?.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.adviser_id} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active section
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={section ? sectionsShow(section.id) : sections()}>Cancel</Link>
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
            { title: 'Sections', href: sections() },
            { title: 'Edit Section', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
