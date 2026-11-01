import { Head, Link, useForm } from '@inertiajs/react';
import { Save, User, Shield, Lock, Eye, EyeOff, Sparkles, CheckCircle2, Building2 } from 'lucide-react';
import { useState } from 'react';
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
import { index as staff, store as staffStore } from '@/routes/staff';
import type { StaffFormProps } from '@/types';

export default function Create({ departments = [] }: StaffFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        department_id: '',
    });

    const generatePassword = () => {
        const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
        let generated = '';
        for (let i = 0; i < 12; i++) {
            generated += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setData('password', generated);
        setShowPassword(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(staffStore.url());
    };

    return (
        <>
            <Head title="Add Staff Member" />

            {/* Container fits within viewport without artificial scrollbars */}
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description */}
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Add Staff Member
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Register a new faculty staff account with portal login credentials and scheduling permissions.
                    </p>
                </div>

                {/* 2. Compact Form Layout: Full-width utilization with zero vertical overflow */}
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
                        {/* Main Details Card (8 cols) */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Staff Information & Credentials</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Enter official legal name, institutional email address, and temporary access password.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid gap-3.5 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name" className="text-xs font-medium">
                                                Full Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. Maria A. Santos"
                                                className="h-9 text-xs"
                                                required
                                                aria-invalid={!!errors.name}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-xs font-medium">
                                                University Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="staff@wmsu.edu.ph"
                                                className="h-9 text-xs"
                                                required
                                                aria-invalid={!!errors.email}
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {/* Department Assignment */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="department_id" className="text-xs font-medium flex items-center gap-1.5">
                                                <Building2 className="size-3.5 text-muted-foreground" />
                                                Assigned Department
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Designates staff jurisdiction
                                            </span>
                                        </div>
                                        <Select
                                            value={data.department_id ? String(data.department_id) : 'none'}
                                            onValueChange={(val) => setData('department_id', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="department_id" className="h-9 text-xs">
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
                                        <p className="text-[11px] text-muted-foreground">
                                            Staff members will automatically register and manage teachers under their assigned department.
                                        </p>
                                        <InputError message={errors.department_id} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-medium">
                                                Temporary Password <span className="text-destructive">*</span>
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={generatePassword}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus:outline-none"
                                            >
                                                <Sparkles className="size-3" />
                                                Generate strong password
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter at least 8 characters"
                                                className="h-9 pr-10 font-mono text-xs"
                                                required
                                                aria-invalid={!!errors.password}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                        <p className="text-[11px] text-muted-foreground">
                                            Minimum 8 characters. The staff member will be prompted to update this password upon initial login.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary & Save Action Card (4 cols) */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Role & Actions</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] font-medium">
                                            Faculty Staff
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3.5 space-y-3.5">
                                    {/* Role information */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                                        <p className="font-semibold text-foreground">College of Education Staff Access</p>
                                        <div className="space-y-1.5 text-[11px] text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>Draft and review collegiate academic schedules</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>Manage classroom reservations & room allocations</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save and Cancel buttons right here without scrolling */}
                                    <div className="space-y-2 pt-1">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-10 gap-1.5 font-medium"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="size-4 mr-2" />
                                                    Creating Staff Account...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="size-4" />
                                                    Create Staff Member
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            type="button"
                                            asChild
                                            className="w-full h-9"
                                        >
                                            <Link href={staff()}>Cancel</Link>
                                        </Button>
                                    </div>
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
            { title: 'Faculty Staff', href: staff() },
            { title: 'New Staff Member', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
