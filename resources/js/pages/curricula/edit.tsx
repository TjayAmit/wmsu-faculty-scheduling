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
import { index as curricula, update as curriculaUpdate } from '@/routes/curricula';
import type { CurriculaFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ curriculum, programs, subjects, semesterTypes }: CurriculaFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        program_id: String(curriculum?.program_id || ''),
        subject_id: String(curriculum?.subject_id || ''),
        year_level: String(curriculum?.year_level || '1'),
        semester_type: curriculum?.semester_type || 'first',
        is_required: curriculum?.is_required ?? true,
        prerequisite_subjects: curriculum?.prerequisite_subjects || [],
        units_override: curriculum?.units_override ? String(curriculum.units_override) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (curriculum) {
            put(curriculaUpdate(curriculum.id).url());
        }
    };

    const addPrerequisite = () => {
        setData('prerequisite_subjects', [...data.prerequisite_subjects, 0]);
    };

    const removePrerequisite = (index: number) => {
        setData('prerequisite_subjects', data.prerequisite_subjects.filter((_, i) => i !== index));
    };

    const updatePrerequisite = (index: number, value: string) => {
        const newPrerequisites = [...data.prerequisite_subjects];
        newPrerequisites[index] = parseInt(value);
        setData('prerequisite_subjects', newPrerequisites);
    };

    return (
        <>
            <Head title="Edit Curriculum" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={curricula()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Curriculum Entry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="program_id">Program</Label>
                                <Select
                                    value={data.program_id}
                                    onValueChange={(value) => setData('program_id', value)}
                                >
                                    <SelectTrigger id="program_id">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={String(program.id)}>
                                                {program.full_name || `${program.code} - ${program.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.program_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject_id">Subject</Label>
                                <Select
                                    value={data.subject_id}
                                    onValueChange={(value) => setData('subject_id', value)}
                                >
                                    <SelectTrigger id="subject_id">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={String(subject.id)}>
                                                {subject.code} - {subject.title} ({subject.units} units)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.subject_id} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="year_level">Year Level</Label>
                                    <Select
                                        value={data.year_level}
                                        onValueChange={(value) => setData('year_level', value)}
                                    >
                                        <SelectTrigger id="year_level">
                                            <SelectValue placeholder="Select year level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                            <SelectItem value="5">5th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.year_level} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester_type">Semester</Label>
                                    <Select
                                        value={data.semester_type}
                                        onValueChange={(value) => setData('semester_type', value)}
                                    >
                                        <SelectTrigger id="semester_type">
                                            <SelectValue placeholder="Select semester" />
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="units_override">Units Override (Optional)</Label>
                                <Input
                                    id="units_override"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    value={data.units_override}
                                    onChange={(e) => setData('units_override', e.target.value)}
                                    placeholder="Leave empty to use subject default"
                                />
                                <p className="text-xs text-muted-foreground">
                                    If left empty, will use the subject's default units
                                </p>
                                <InputError message={errors.units_override} />
                            </div>

                            <div className="space-y-2">
                                <Label>Prerequisites</Label>
                                <div className="space-y-2">
                                    {data.prerequisite_subjects.map((prereqId, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Select
                                                value={String(prereqId)}
                                                onValueChange={(value) => updatePrerequisite(index, value)}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select prerequisite subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((subject) => (
                                                        <SelectItem key={subject.id} value={String(subject.id)}>
                                                            {subject.code} - {subject.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePrerequisite(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addPrerequisite}
                                    >
                                        + Add Prerequisite
                                    </Button>
                                </div>
                                <InputError message={errors.prerequisite_subjects} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_required"
                                    checked={data.is_required}
                                    onCheckedChange={(checked) => setData('is_required', checked as boolean)}
                                />
                                <Label htmlFor="is_required" className="text-sm font-normal">
                                    Required subject (not elective)
                                </Label>
                            </div>
                            <InputError message={errors.is_required} />

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Curriculum'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={curricula()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => {
    // Access curriculum data from page props
    const { curriculum } = (page as { props: CurriculaFormProps }).props;
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Curriculum', href: curricula() },
                { title: curriculum?.subject?.title || 'Edit', href: '#' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
