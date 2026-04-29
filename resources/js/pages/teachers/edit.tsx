import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { index as teachers, show as teachersShow, update as teachersUpdate } from '@/routes/teachers';
import type { TeachersFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ teacher, users, employmentTypes }: TeachersFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: teacher?.user_id.toString() || '',
        employee_id: teacher?.employee_id || '',
        department: teacher?.department || '',
        rank: teacher?.rank || '',
        employment_type: (teacher?.employment_type as 'full_time' | 'part_time' | 'casual') || 'full_time',
        date_hired: teacher?.date_hired || '',
        phone: teacher?.phone || '',
        address: teacher?.address || '',
        is_active: teacher?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teacher) {
            put(teachersUpdate.url(teacher.id));
        }
    };

    return (
        <>
            <Head title="Edit Teacher" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={teacher ? teachersShow(teacher.id) : teachers()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Teacher</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="user_id">User</Label>
                                <Select
                                    value={data.user_id}
                                    onValueChange={(value) => setData('user_id', value)}
                                >
                                    <SelectTrigger id="user_id">
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.user_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input
                                    id="employee_id"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    placeholder="Enter employee ID"
                                    required
                                />
                                <InputError message={errors.employee_id} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        placeholder="Enter department"
                                    />
                                    <InputError message={errors.department} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rank">Rank</Label>
                                    <Input
                                        id="rank"
                                        value={data.rank}
                                        onChange={(e) => setData('rank', e.target.value)}
                                        placeholder="Enter rank"
                                    />
                                    <InputError message={errors.rank} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="employment_type">Employment Type</Label>
                                    <Select
                                        value={data.employment_type}
                                        onValueChange={(value) => setData('employment_type', value as 'full_time' | 'part_time' | 'casual')}
                                    >
                                        <SelectTrigger id="employment_type">
                                            <SelectValue placeholder="Select employment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employmentTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.employment_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_hired">Date Hired</Label>
                                    <Input
                                        id="date_hired"
                                        type="date"
                                        value={data.date_hired}
                                        onChange={(e) => setData('date_hired', e.target.value)}
                                    />
                                    <InputError message={errors.date_hired} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter address"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active teacher
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={teacher ? teachersShow(teacher.id) : teachers()}>Cancel</Link>
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
            { title: 'Teachers', href: teachers() },
            { title: 'Edit Teacher', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
