import { Head, Link, useForm } from '@inertiajs/react';
import { Save, User, Shield } from 'lucide-react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { index as staff, store as staffStore } from '@/routes/staff';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(staffStore.url());
    };

    return (
        <>
            <Head title="Add Staff Member" />

            {/* Canvas strictly spans full left-to-right space */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE cards (No redundant back arrow) */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Add Staff Member
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Register a new faculty staff account with portal login credentials.
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
                                        <CardTitle className="text-base font-semibold">Account Credentials</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Primary identification and initial password for the staff user.
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
                                            placeholder="e.g. Maria Santos"
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
                                            placeholder="staff@wmsu.edu.ph"
                                            required
                                            aria-invalid={!!errors.email}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Temporary Password <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter strong temporary password"
                                            required
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
                                        Default permissions assignment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-4">
                                    <Alert className="text-xs bg-muted/40 border-border">
                                        <AlertDescription>
                                            This user will be registered with <strong>Faculty Staff</strong> privileges to manage timetables and room records.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            {/* Action Controls Card */}
                            <Card className="shadow-xs">
                                <CardHeader className="border-b border-border pb-3">
                                    <CardTitle className="text-base font-semibold">Save Profile</CardTitle>
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
                                                Creating Staff...
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
                                        className="w-full h-10"
                                    >
                                        <Link href={staff()}>Cancel</Link>
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
