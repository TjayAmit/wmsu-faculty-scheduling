import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Save,
    ShieldCheck,
    Sparkles,
    User as UserIcon,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as users, show as usersShow, update as usersUpdate } from '@/routes/users';
import type { UsersFormProps } from '@/types/users';

const ROLE_COLORS: Record<string, string> = {
    Admin: 'bg-destructive/15 text-destructive border-destructive/30',
    'Faculty Admin': 'bg-primary/15 text-primary border-primary/30',
    'Faculty Staff': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Teacher: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

export default function Edit({ user, roles = [] }: UsersFormProps) {
    const userRole = user?.roles?.[0]?.name || '';
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: userRole,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            put(usersUpdate.url(user.id));
        }
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    };

    return (
        <>
            <Head title={`Edit User ${user?.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={user ? usersShow(user.id) : users()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {user ? 'User Details' : 'Users'}
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit User Account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update profile information, authorization role, and login credentials for {user?.name}.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Account Credentials & Access
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name & Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-semibold">
                                                Full Name <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Enter full name"
                                                    required
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Account display and identity name.
                                            </p>
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-semibold">
                                                Email Address <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="Enter email address"
                                                    required
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Used for authentication login and notifications.
                                            </p>
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {/* System Role Selection */}
                                    {roles.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-xs font-semibold">
                                                Assigned System Role
                                            </Label>
                                            <Select
                                                value={data.role || 'none'}
                                                onValueChange={(val) => setData('role', val === 'none' ? '' : val)}
                                            >
                                                <SelectTrigger id="role" className="text-sm">
                                                    <SelectValue placeholder="Select authorization role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-muted-foreground italic">
                                                        No Assigned Role (Standard)
                                                    </SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name} className="cursor-pointer">
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Determines portal permission tiers, sidebar navigation, and scheduling approval privileges.
                                            </p>
                                            <InputError message={errors.role} />
                                        </div>
                                    )}

                                    {/* New Password (Optional) */}
                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-semibold">
                                                New Password (Optional)
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Leave blank to keep current password
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter new password (min 8 chars)"
                                                className="pl-9 pr-9 text-sm"
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium"
                                        >
                                            <Save className="mr-1.5 h-4 w-4" />
                                            {processing ? 'Saving Changes…' : 'Save Changes'}
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={user ? usersShow(user.id) : users()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar: Live Identity Preview & Security Governance */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live User Badge Preview */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live User Badge Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0">
                                            {getInitials(data.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-base text-foreground truncate leading-tight">
                                                {data.name.trim() || 'User Account'}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {data.email.trim() || 'user@wmsu.edu.ph'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                                        <span className="text-muted-foreground">System Role:</span>
                                        <Badge
                                            className={`text-[10px] h-5 px-2 font-medium shadow-none border ${
                                                ROLE_COLORS[data.role] || 'bg-muted text-muted-foreground border-border'
                                            }`}
                                        >
                                            {data.role || 'Standard User'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Status:</span>
                                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Active Account
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Simulation of how this user profile is displayed in user lists and role audits.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Security Governance Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Security & Access Governance
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Password Policy:</strong> Minimum 8 characters. Leave password blank when editing to keep the existing password.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Faculty Linking:</strong> If this account belongs to an instructor, link their profile in <Link href="/teachers" className="text-primary hover:underline font-medium">Teachers</Link>.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Role Permissions:</strong> Fine-tune role definitions and capability permissions in <Link href="/roles" className="text-primary hover:underline font-medium">Roles & Permissions</Link>.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Users', href: users() },
            { title: 'Edit User', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
