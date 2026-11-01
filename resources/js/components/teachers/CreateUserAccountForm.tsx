import { useForm } from '@inertiajs/react';
import { Loader2, GraduationCap, Mail, User, Lock, CheckCircle2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Role } from '@/types';

interface CreateUserAccountFormProps {
    teacherName?: string;
    teacherEmail: string;
    availableRoles?: Role[] | string[];
    onSubmit: (data: any) => void;
}

export default function CreateUserAccountForm({
    teacherName = '',
    teacherEmail = '',
    onSubmit,
}: CreateUserAccountFormProps) {
    const { data, setData, processing, errors } = useForm({
        name: teacherName || '',
        email: teacherEmail || '',
        password: '',
        password_confirmation: '',
        roles: ['Teacher'] as string[],
    });

    // Keep name and email in sync if props change
    useEffect(() => {
        if (teacherName && !data.name) {
            setData('name', teacherName);
        }
        if (teacherEmail && !data.email) {
            setData('email', teacherEmail);
        }
    }, [teacherName, teacherEmail]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Full Name */}
            <div className="space-y-1.5">
                <Label htmlFor="account-name" className="text-xs font-semibold">
                    Full Name
                </Label>
                <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="account-name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Juan Ibarra"
                        className="pl-8 text-xs sm:text-sm"
                        autoComplete="name"
                        required
                    />
                </div>
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
                <Label htmlFor="account-email" className="text-xs font-semibold">
                    Email Address (Login Username)
                </Label>
                <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="account-email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="teacher@wmsu.edu.ph"
                        className="pl-8 text-xs sm:text-sm font-medium"
                        autoComplete="email"
                        required
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                    Pre-filled with the faculty teacher's registered institutional email.
                </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <Label htmlFor="account-password" className="text-xs font-semibold">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="account-password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="pl-8 text-xs sm:text-sm"
                        autoComplete="new-password"
                        required
                    />
                </div>
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
                <Label htmlFor="account-password-confirmation" className="text-xs font-semibold">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="account-password-confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Re-enter password"
                        className="pl-8 text-xs sm:text-sm"
                        autoComplete="new-password"
                        required
                    />
                </div>
                {errors.password_confirmation && (
                    <p className="text-xs text-destructive">{errors.password_confirmation}</p>
                )}
            </div>

            {/* Role Assignment - Automatic */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-primary" />
                        Account Role
                    </span>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold text-[11px] gap-1">
                        <CheckCircle2 className="size-3" /> Teacher
                    </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Assigned automatically as <strong>Teacher</strong> with instructor portal access to view schedules and classes.
                </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[#800000] hover:bg-[#660000] text-white"
                >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </div>
        </form>
    );
}
