import { Head, Link, useForm } from '@inertiajs/react';
import { Save, User, Shield, Building2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { index as staff, show as staffShow, update as staffUpdate } from '@/routes/staff';
import type { StaffFormProps } from '@/types';

export default function Edit({ user, departments = [] }: StaffFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        department_id: user?.department_id ? String(user.department_id) : '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            put(staffUpdate.url(user.id));
        }
    };

    return (
        <>
            <Head title={`Edit Staff Member - ${user?.name}`} />

            {/* Canvas strictly spans full left-to-right space */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE cards (No redundant back arrow) */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Staff Member
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update account credentials and security settings for{' '}
                        <span className="font-medium text-foreground">{user?.name}</span>.
                    </p>
                </div>

                {/* 2. Full-Width Form Layout */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* Main Columns (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Account Information</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Staff member legal name and portal authentication email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            required
                                            aria-invalid={!!errors.name}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            required
                                            aria-invalid={!!errors.email}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="department_id" className="flex items-center gap-1.5">
                                                <Building2 className="size-4 text-muted-foreground" />
                                                Assigned Department
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                Jurisdiction & scheduling scope
                                            </span>
                                        </div>
                                        <Select
                                            value={data.department_id ? String(data.department_id) : 'none'}
                                            onValueChange={(val) => setData('department_id', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="department_id">
                                                <SelectValue placeholder="Select departmental assignment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Department (General Academic Office)</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                                        {dept.code} - {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            This staff member registers and manages faculty schedules within this department.
                                        </p>
                                        <InputError message={errors.department_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password Reset
                                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                                (leave blank to keep unchanged)
                                            </span>
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter new password if updating"
                                            aria-invalid={!!errors.password}
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Column (1 Col) */}
                        <div className="space-y-6">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Role & Access</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        System access level.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            Faculty Staff
                                        </Badge>
                                        {user?.email_verified_at ? (
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs"
                                            >
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                                                Pending Verification
                                            </Badge>
                                        )}
                                    </div>

                                    <Alert className="text-xs bg-muted/40 border-border mt-2">
                                        <AlertDescription>
                                            Staff accounts have permissions to view faculty schedules and manage department room allocations.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            {/* Action Controls Card */}
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
                                        <Link href={user ? staffShow(user.id) : staff()}>Cancel</Link>
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
            { title: 'Faculty Staff', href: staff() },
            { title: 'Edit Staff Member', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
