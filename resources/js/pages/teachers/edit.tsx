import { Head, Link, useForm, router } from '@inertiajs/react';
import { Save, UserPlus, UserX, UserCheck, Briefcase, User, Shield, Building2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import CreateUserAccountForm from '@/components/teachers/CreateUserAccountForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as teachers, show as teachersShow, update as teachersUpdate } from '@/routes/teachers';
import type { TeachersFormProps } from '@/types';

export default function Edit({ teacher, employmentTypes, departments = [], userDepartment, availableRoles }: TeachersFormProps) {
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);

    const fullName =
        teacher?.full_name ||
        `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() ||
        'Teacher';

    // Format date for standard HTML5 date input (YYYY-MM-DD)
    const formattedDateHired = teacher?.date_hired ? teacher.date_hired.split('T')[0] : '';

    const { data, setData, put, processing, errors, isDirty } = useForm({
        email: teacher?.email || '',
        first_name: teacher?.first_name || '',
        last_name: teacher?.last_name || '',
        employee_id: teacher?.employee_id || '',
        biometric_pin: (teacher as { biometric_pin?: string | null })?.biometric_pin || '',
        department: teacher?.department || '',
        rank: teacher?.rank || '',
        employment_type: (teacher?.employment_type as 'full_time' | 'part_time' | 'casual') || 'full_time',
        date_hired: formattedDateHired,
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

    const unlinkUserAccount = () => {
        if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
            router.delete(`/teachers/${teacher?.id}/unlink-user-account`);
        }
    };

    return (
        <>
            <Head title={`Edit ${fullName}`} />

            {/* Canvas strictly spans full left-to-right space */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE cards (No redundant back arrow) */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Teacher Profile
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update faculty credentials, departmental assignments, and portal access for{' '}
                        <span className="font-medium text-foreground">{fullName}</span>.
                    </p>
                </div>

                {/* 2. Full-Width Form Layout */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* Main Columns (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Primary legal identification details and contact records.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                First Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="first_name"
                                                type="text"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                required
                                                aria-invalid={!!errors.first_name}
                                            />
                                            <InputError message={errors.first_name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">
                                                Last Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="last_name"
                                                type="text"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                required
                                                aria-invalid={!!errors.last_name}
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                University Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                aria-invalid={!!errors.email}
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+63 912 345 6789"
                                                aria-invalid={!!errors.phone}
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Residential Address</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Enter residential address"
                                            rows={2}
                                            aria-invalid={!!errors.address}
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Academic & Employment Information */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Employment & Institutional Details</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Employee identifiers, department assignment, and rank classification.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_id">
                                                Employee ID <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="employee_id"
                                                value={data.employee_id}
                                                onChange={(e) => setData('employee_id', e.target.value)}
                                                className="font-mono text-sm"
                                                required
                                                aria-invalid={!!errors.employee_id}
                                            />
                                            <InputError message={errors.employee_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employment_type">
                                                Employment Type <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.employment_type}
                                                onValueChange={(value) => setData('employment_type', value as 'full_time' | 'part_time' | 'casual')}
                                            >
                                                <SelectTrigger id="employment_type">
                                                    <SelectValue placeholder="Select type" />
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
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {userDepartment ? (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                        <Building2 className="size-3.5 text-primary" />
                                                        Department
                                                    </Label>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-primary/30 text-primary bg-primary/5 text-[10px] gap-1 px-1.5 py-0"
                                                    >
                                                        Department Scope
                                                    </Badge>
                                                </div>
                                                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {data.department || userDepartment.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        Faculty member registered under {userDepartment.name} ({userDepartment.code}).
                                                    </p>
                                                </div>
                                                <input type="hidden" name="department" value={data.department} />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="department">Department</Label>
                                                {departments.length > 0 ? (
                                                    <Select
                                                        value={data.department}
                                                        onValueChange={(val) => setData('department', val)}
                                                    >
                                                        <SelectTrigger id="department">
                                                            <SelectValue placeholder="Select department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departments.map((dept) => (
                                                                <SelectItem key={dept.id} value={dept.name}>
                                                                    {dept.code} - {dept.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        id="department"
                                                        value={data.department}
                                                        onChange={(e) => setData('department', e.target.value)}
                                                        placeholder="e.g. College of Education"
                                                        aria-invalid={!!errors.department}
                                                    />
                                                )}
                                                <InputError message={errors.department} />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="rank">Academic Rank</Label>
                                            <Input
                                                id="rank"
                                                value={data.rank}
                                                onChange={(e) => setData('rank', e.target.value)}
                                                placeholder="e.g. Assistant Professor"
                                                aria-invalid={!!errors.rank}
                                            />
                                            <InputError message={errors.rank} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_hired">Date Hired</Label>
                                            <Input
                                                id="date_hired"
                                                type="date"
                                                value={data.date_hired}
                                                onChange={(e) => setData('date_hired', e.target.value)}
                                                aria-invalid={!!errors.date_hired}
                                            />
                                            <InputError message={errors.date_hired} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="biometric_pin">ZKTeco Biometric PIN (Optional)</Label>
                                            <Input
                                                id="biometric_pin"
                                                value={data.biometric_pin}
                                                onChange={(e) => setData('biometric_pin', e.target.value)}
                                                placeholder="e.g. 1001 (Defaults to Employee ID if blank)"
                                                className="font-mono text-sm"
                                            />
                                            <InputError message={(errors as Record<string, string>).biometric_pin} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Column (1 Column) */}
                        <div className="space-y-6">
                            {/* Portal Account Status Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Portal Account</CardTitle>
                                    <CardDescription className="text-xs">
                                        Login credentials and security association.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-3">
                                    {teacher?.has_user_account ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1"
                                                >
                                                    <UserCheck className="size-3" />
                                                    Account Linked
                                                </Badge>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={unlinkUserAccount}
                                                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                            >
                                                <UserX className="size-4 mr-1.5" />
                                                Unlink User Account
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <Badge variant="outline" className="text-muted-foreground">
                                                No User Account
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                Teacher profile exists without an active system login.
                                            </p>

                                            <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" type="button" className="w-full gap-1.5">
                                                        <UserPlus className="size-4" />
                                                        Create Login Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Create User Account</DialogTitle>
                                                        <DialogDescription>
                                                            Create login credentials for {fullName}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <CreateUserAccountForm
                                                        teacherName={fullName}
                                                        teacherEmail={teacher?.email || ''}
                                                        onSubmit={createUserAccount}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Status Settings Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <CardTitle className="text-base font-semibold">Faculty Status</CardTitle>
                                    <CardDescription className="text-xs">
                                        Determine active participation in schedule loading.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-4">
                                    <div className="flex items-start space-x-3 rounded-lg border border-border p-3.5 bg-muted/20">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                                Active Faculty Member
                                            </Label>
                                            <p className="text-xs text-muted-foreground leading-normal">
                                                Active teachers can be assigned to academic timetables and courses.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Action Controls Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <CardTitle className="text-base font-semibold">Save Changes</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2.5">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-10 gap-1.5 font-medium"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="size-4 mr-2" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        asChild
                                        className="w-full h-10"
                                    >
                                        <Link href={teacher ? teachersShow(teacher.id) : teachers()}>
                                            Cancel
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
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
