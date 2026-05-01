import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { index as roles, update as rolesUpdate } from '@/routes/roles';
import type { RolesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ role, permissions }: RolesFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions?.map((p) => p.id) || [],
    });

    const [isOpen, setIsOpen] = useState(true);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(rolesUpdate(role.id));
    };

    const togglePermission = (permissionId: number) => {
        setData('permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const toggleAllPermissions = () => {
        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', permissions.map((p) => p.id));
        }
    };

    // Group permissions by module (assuming format: "module.action")
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const module = permission.name.split('.')[0] || 'other';
        if (!acc[module]) acc[module] = [];
        acc[module].push(permission);
        return acc;
    }, {} as Record<string, typeof permissions>);

    const isProtectedRole = role.name === 'super-admin' || role.name === 'admin';

    return (
        <>
            <Head title={`Edit Role - ${role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={roles()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Edit Role</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Modify role name and permissions
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Role Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={isProtectedRole}
                                    placeholder="e.g., editor, manager"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                {isProtectedRole && (
                                    <p className="text-sm text-muted-foreground">
                                        Protected role names cannot be changed.
                                    </p>
                                )}
                            </div>

                            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        <span>Permissions</span>
                                        <span className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {data.permissions.length} selected
                                            </Badge>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </span>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="mb-4 flex items-center gap-2">
                                                <Checkbox
                                                    id="select-all"
                                                    checked={data.permissions.length === permissions.length && permissions.length > 0}
                                                    onCheckedChange={toggleAllPermissions}
                                                />
                                                <Label htmlFor="select-all" className="cursor-pointer">
                                                    Select All Permissions
                                                </Label>
                                            </div>

                                            <div className="space-y-4">
                                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                                    <div key={module}>
                                                        <h4 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                                                            {module}
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                            {perms.map((permission) => (
                                                                <div key={permission.id} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`permission-${permission.id}`}
                                                                        checked={data.permissions.includes(permission.id)}
                                                                        onCheckedChange={() => togglePermission(permission.id)}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`permission-${permission.id}`}
                                                                        className="cursor-pointer text-xs font-normal"
                                                                    >
                                                                        {permission.name.split('.')[1] || permission.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href={roles()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
