import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { index as featureFlags, store as featureFlagsStore } from '@/routes/feature-flags';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        key: '',
        description: '',
        is_enabled: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(featureFlagsStore.url());
    };

    return (
        <>
            <Head title="Create Feature Flag" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={featureFlags()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Feature Flag</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Dark Mode"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="key">Key *</Label>
                                <Input
                                    id="key"
                                    value={data.key}
                                    onChange={(e) => setData('key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="e.g., dark_mode"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Only lowercase letters, numbers, and underscores allowed.
                                </p>
                                <InputError message={errors.key} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What does this feature flag control?"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_enabled"
                                    checked={data.is_enabled}
                                    onCheckedChange={(checked) => setData('is_enabled', checked as boolean)}
                                />
                                <Label htmlFor="is_enabled" className="text-sm font-normal">
                                    Enable this feature flag immediately
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Feature Flag'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={featureFlags()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Feature Flags', href: featureFlags() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
