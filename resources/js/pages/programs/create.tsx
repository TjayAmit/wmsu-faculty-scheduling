import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as programs, store as programsStore } from '@/routes/programs';
import type { DegreeLevel, DepartmentOption } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface CreateProps {
    departments: DepartmentOption[];
    degreeLevels: DegreeLevel[];
}

export default function Create({ departments, degreeLevels }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        degree_level: 'bachelor',
        department_id: '',
        description: '',
        duration_years: '4',
        total_units: '120',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(programsStore.url());
    };

    return (
        <>
            <Head title="Create Program" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={programs()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Program</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Program Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., BSCS, BSME"
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Program Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Computer Science"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) => setData('department_id', value)}
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.code} - {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="degree_level">Degree Level</Label>
                                    <Select
                                        value={data.degree_level}
                                        onValueChange={(value) => setData('degree_level', value)}
                                    >
                                        <SelectTrigger id="degree_level">
                                            <SelectValue placeholder="Select degree level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {degreeLevels.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.degree_level} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the program"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="duration_years">Duration (Years)</Label>
                                    <Input
                                        id="duration_years"
                                        type="number"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        value={data.duration_years}
                                        onChange={(e) => setData('duration_years', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.duration_years} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_units">Total Units</Label>
                                    <Input
                                        id="total_units"
                                        type="number"
                                        min="1"
                                        max="500"
                                        step="0.5"
                                        value={data.total_units}
                                        onChange={(e) => setData('total_units', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.total_units} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active program
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Program'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={programs()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Programs', href: programs() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
