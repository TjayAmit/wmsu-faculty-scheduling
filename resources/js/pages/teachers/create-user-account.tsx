import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface CreateUserAccountProps {
    teacher: {
        id: number;
        full_name: string;
        email: string;
    };
    roles: string[];
}

export function CreateUserAccount({ teacher, roles }: CreateUserAccountProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/teachers/${teacher.id}/create-user-account`);
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter(role => role !== roleName));
        }
    };

    return (
        <>
            <Head title={`Create User Account - ${teacher.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teachers/${teacher.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to teacher
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create User Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Alert>
                                <AlertDescription>
                                    Creating login account for <strong>{teacher.full_name}</strong> ({teacher.email})
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter user name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm password"
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="space-y-2">
                                    {roles.map((role) => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role}`}
                                                checked={data.roles.includes(role)}
                                                onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                                            />
                                            <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                                                {role.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-destructive">{errors.roles}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
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

CreateUserAccount.layout = (page: React.ReactNode) => {
    // Access teacher data from page props using usePage hook
    const { props } = usePage<{ teacher: { id: number; full_name: string } }>();
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
