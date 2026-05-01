import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus, UserX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { index as teachers, show as teachersShow, update as teachersUpdate } from '@/routes/teachers';
import type { TeachersFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CreateUserAccountForm from '@/components/teachers/CreateUserAccountForm';

export default function Edit({ teacher, users, employmentTypes, availableRoles, availableUsers }: TeachersFormProps) {
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [showLinkUserDialog, setShowLinkUserDialog] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        email: teacher?.email || '',
        first_name: teacher?.first_name || '',
        last_name: teacher?.last_name || '',
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

    const createUserAccount = (formData: any) => {
        router.post(`/teachers/${teacher?.id}/create-user-account`, formData, {
            onSuccess: () => setShowCreateUserDialog(false),
        });
    };

    const linkUserAccount = (formData: any) => {
        router.post(`/teachers/${teacher?.id}/link-user-account`, formData, {
            onSuccess: () => setShowLinkUserDialog(false),
        });
    };

    const unlinkUserAccount = () => {
        if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
            router.delete(`/teachers/${teacher?.id}/unlink-user-account`);
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
                        <div className="flex justify-between items-center">
                            <CardTitle>Edit Teacher</CardTitle>
                            {teacher && (
                                <div className="flex items-center gap-2">
                                    {teacher.has_user_account ? (
                                        <>
                                            <Badge variant="default">
                                                <UserPlus className="w-3 h-3 mr-1" />
                                                Account Linked
                                            </Badge>
                                            <Button variant="destructive" size="sm" onClick={unlinkUserAccount}>
                                                <UserX className="w-4 h-4 mr-2" />
                                                Unlink Account
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant="secondary">
                                                <UserX className="w-3 h-3 mr-1" />
                                                No Account
                                            </Badge>
                                            <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Create Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Create User Account</DialogTitle>
                                                        <DialogDescription>
                                                            Create a login account for {teacher.full_name}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <CreateUserAccountForm
                                                        teacherEmail={teacher.email}
                                                        availableRoles={availableRoles || []}
                                                        onSubmit={createUserAccount}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Personal Information</h3>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            placeholder="Enter first name"
                                            required
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            placeholder="Enter last name"
                                            required
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="teacher@example.com"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Employment Information</h3>
                                
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
                                        <Label htmlFor="rank">Academic Rank</Label>
                                        <Input
                                            id="rank"
                                            value={data.rank}
                                            onChange={(e) => setData('rank', e.target.value)}
                                            placeholder="Enter academic rank"
                                        />
                                        <InputError message={errors.rank} />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Contact Information</h3>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
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
                                        placeholder="Enter residential address"
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Teacher is active
                                </Label>
                            </div>

                            <Alert>
                                <AlertDescription>
                                    Note: User account management is available in the header above.
                                </AlertDescription>
                            </Alert>

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
