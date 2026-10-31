import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as users, show as usersShow, update as usersUpdate } from '@/routes/users';
import type { UsersFormProps } from '@/types';

export default function Edit({ user }: UsersFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(usersUpdate.url(user.id));
        }
    };

    return (
        <>
            <Head title="Edit User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6 w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update profile information, email address, and authentication credentials.
                    </p>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter email address"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={user ? usersShow(user.id) : users()}>Cancel</Link>
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
            { title: 'Users', href: users() },
            { title: 'Edit User', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
