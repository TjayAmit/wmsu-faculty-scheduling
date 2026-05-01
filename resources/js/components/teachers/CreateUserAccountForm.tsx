import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';

interface CreateUserAccountFormProps {
    teacherEmail: string;
    availableRoles: Role[];
    onSubmit: (data: any) => void;
}

export default function CreateUserAccountForm({ teacherEmail, availableRoles, onSubmit }: CreateUserAccountFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter(role => role !== roleName));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    {availableRoles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={data.roles.includes(role.name)}
                                onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                            />
                            <Label htmlFor={`role-${role.id}`} className="text-sm">
                                {role.display_name || role.name}
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
                    Teacher email: <strong>{teacherEmail}</strong>
                </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="submit"
                    disabled={processing}
                >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </div>
        </form>
    );
}
