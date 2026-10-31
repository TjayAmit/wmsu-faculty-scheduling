import { Head, Link, useForm } from '@inertiajs/react';
import { Save, User, Building2, Phone, Briefcase } from 'lucide-react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as teachers, store as teachersStore } from '@/routes/teachers';
import type { TeachersFormProps } from '@/types';

export default function Create({ employmentTypes }: TeachersFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        biometric_pin: '',
        department: '',
        rank: '',
        employment_type: 'full_time',
        date_hired: '',
        phone: '',
        address: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(teachersStore.url());
    };

    return (
        <>
            <Head title="Add New Teacher" />

            {/* Canvas strictly spans full left-to-right space */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE cards (No redundant back arrow) */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Add New Teacher
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new faculty profile and configure departmental appointments.
                    </p>
                </div>

                {/* 2. Full-Width Form Layout */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* Main Information (2 Columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Details Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Primary identification and legal names for university records.
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
                                                placeholder="e.g. John"
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
                                                placeholder="e.g. Doe"
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
                                                placeholder="faculty@wmsu.edu.ph"
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
                                                placeholder="e.g. +63 912 345 6789"
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
                                            placeholder="Enter street, barangay, city..."
                                            rows={2}
                                            aria-invalid={!!errors.address}
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Academic & Employment Card */}
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
                                                placeholder="e.g. T-0001"
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
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={data.department}
                                                onChange={(e) => setData('department', e.target.value)}
                                                placeholder="e.g. College of Computing Studies"
                                                aria-invalid={!!errors.department}
                                            />
                                            <InputError message={errors.department} />
                                        </div>

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

                        {/* Side Actions Column (1 Column) */}
                        <div className="space-y-6">
                            {/* Status Card */}
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

                                    <Alert className="text-xs bg-muted/40 border-border">
                                        <AlertDescription>
                                            A student/faculty portal login account can be generated separately after saving.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            {/* Form Action Controls Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <CardTitle className="text-base font-semibold">Save Profile</CardTitle>
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
                                                Creating Teacher...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                Create Teacher Profile
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        asChild
                                        className="w-full h-10"
                                    >
                                        <Link href={teachers()}>Cancel</Link>
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

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Teachers', href: teachers() },
            { title: 'New Teacher', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
