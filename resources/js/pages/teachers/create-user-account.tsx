import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, User, Mail, Lock, GraduationCap, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface CreateUserAccountProps {
    teacher: {
        id: number;
        full_name: string;
        email: string;
    };
    roles?: string[];
}

export function CreateUserAccount({ teacher }: CreateUserAccountProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: teacher.full_name || '',
        email: teacher.email || '',
        password: '',
        password_confirmation: '',
        roles: ['Teacher'] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/teachers/${teacher.id}/create-user-account`);
    };

    return (
        <>
            <Head title={`Create User Account - ${teacher.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6 max-w-2xl">
                <div>
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={`/teachers/${teacher.id}`}>
                            <ArrowLeft className="mr-1.5 size-4" />
                            Back to Teacher Profile
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-xs border-border">
                    <CardHeader className="border-b border-border/70 pb-4">
                        <CardTitle className="text-xl font-bold">Create Teacher User Account</CardTitle>
                        <CardDescription className="text-xs">
                            Generate login credentials for <span className="font-semibold text-foreground">{teacher.full_name}</span> to access the faculty schedule portal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold">
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter user name"
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
                                <Label htmlFor="email" className="text-xs font-semibold">
                                    Email Address (Login Username)
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="email"
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
                                    Pre-filled with the teacher's registered email address.
                                </p>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="password"
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
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
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
                                    Assigned automatically as <strong>Teacher</strong> with instructor portal permissions to view personal timetables and assigned classes.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#800000] hover:bg-[#660000] text-white"
                                >
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={`/teachers/${teacher.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateUserAccount.layout = (page: React.ReactNode, props: { teacher: { id: number; full_name: string } }) => {
    const teacher = props.teacher;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Teachers', href: '/teachers' },
                { title: teacher.full_name, href: `/teachers/${teacher.id}` },
                { title: 'Create User Account', href: '#' },
            ]}
        >
            {page}
        </AppLayout>
    );
};

export default CreateUserAccount;
