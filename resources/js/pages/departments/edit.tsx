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
import { index as departments, show as departmentsShow, update as departmentsUpdate } from '@/routes/departments';
import type { DepartmentsFormProps, TeacherOption } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ department, teachers }: DepartmentsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        code: department?.code || '',
        name: department?.name || '',
        description: department?.description || '',
        head_id: department?.head_id?.toString() || '',
        office_location: department?.office_location || '',
        contact_phone: department?.contact_phone || '',
        contact_email: department?.contact_email || '',
        is_active: department?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (department) {
            put(departmentsUpdate.url(department.id));
        }
    };

    return (
        <>
            <Head title="Edit Department" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={department ? departmentsShow(department.id) : departments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Department Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., CS, ENG, MATH"
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Department Name</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the department"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="head_id">Department Head (Optional)</Label>
                                <Select
                                    value={data.head_id}
                                    onValueChange={(value) => setData('head_id', value)}
                                >
                                    <SelectTrigger id="head_id">
                                        <SelectValue placeholder="Select department head" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers?.map((teacher: TeacherOption) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.first_name} {teacher.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.head_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="office_location">Office Location (Optional)</Label>
                                <Input
                                    id="office_location"
                                    value={data.office_location}
                                    onChange={(e) => setData('office_location', e.target.value)}
                                    placeholder="e.g., Building A, Room 101"
                                />
                                <InputError message={errors.office_location} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="e.g., (123) 456-7890"
                                    />
                                    <InputError message={errors.contact_phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Contact Email (Optional)</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="e.g., dept@university.edu"
                                    />
                                    <InputError message={errors.contact_email} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active department
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={department ? departmentsShow(department.id) : departments()}>Cancel</Link>
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
            { title: 'Departments', href: departments() },
            { title: 'Edit Department', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
