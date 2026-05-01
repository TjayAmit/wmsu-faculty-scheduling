import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface LinkUserAccountProps {
    teacher: {
        id: number;
        full_name: string;
        email: string;
    };
    availableUsers: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    roles: string[];
}

export default function LinkUserAccount({ teacher, availableUsers, roles }: LinkUserAccountProps) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        roles: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/teachers/${teacher.id}/link-user-account`);
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
            <Head title={`Link User Account - ${teacher.full_name}`} />

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
                        <CardTitle>Link User Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Alert>
                                <AlertDescription>
                                    Link an existing user account to <strong>{teacher.full_name}</strong> ({teacher.email})
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="user_id">Select User</Label>
                                <Select
                                    value={data.user_id}
                                    onValueChange={(value) => setData('user_id', value)}
                                >
                                    <SelectTrigger id="user_id">
                                        <SelectValue placeholder="Select a user to link" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && (
                                    <p className="text-sm text-destructive">{errors.user_id}</p>
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

                            <Alert>
                                <AlertDescription>
                                    <strong>Note:</strong> This will link the selected user account to this teacher profile. 
                                    The user will gain access to teacher-related features based on the assigned roles.
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Link Account
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

LinkUserAccount.layout = (page: React.ReactNode) => {
    // Access teacher data from page props using usePage hook
    const { props } = usePage<{ teacher: { id: number; full_name: string } }>();
    const teacher = props.teacher;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Teachers', href: '/teachers' },
                { title: teacher.full_name, href: `/teachers/${teacher.id}` },
                { title: 'Link User Account', href: '#' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
