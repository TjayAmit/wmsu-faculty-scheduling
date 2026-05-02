import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Power, PowerOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as featureFlags, edit as featureFlagsEdit, destroy as featureFlagsDestroy, toggle as featureFlagsToggle } from '@/routes/feature-flags';
import type { FeatureFlagsShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ featureFlag }: FeatureFlagsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(featureFlagsDestroy(featureFlag.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleToggle = () => {
        router.post(featureFlagsToggle.url(featureFlag.id));
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title={`Feature Flag - ${featureFlag.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={featureFlags()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>{featureFlag.name}</CardTitle>
                            <Badge variant={featureFlag.is_enabled ? 'default' : 'secondary'}>
                                {featureFlag.is_enabled ? (
                                    <>
                                        <Power className="mr-1 h-3 w-3" />
                                        Enabled
                                    </>
                                ) : (
                                    <>
                                        <PowerOff className="mr-1 h-3 w-3" />
                                        Disabled
                                    </>
                                )}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToggle}>
                                {featureFlag.is_enabled ? (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Disable
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Enable
                                    </>
                                )}
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={featureFlagsEdit(featureFlag.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Key</p>
                            <code className="w-fit rounded bg-muted px-2 py-1 text-sm">
                                {featureFlag.key}
                            </code>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p>{featureFlag.description || 'No description provided.'}</p>
                        </div>

                        {featureFlag.enabledBy && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Enabled By</p>
                                <p>{featureFlag.enabledBy.name}</p>
                            </div>
                        )}

                        {featureFlag.enabled_at && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Enabled At</p>
                                <p>{formatDate(featureFlag.enabled_at)}</p>
                            </div>
                        )}

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{featureFlag.created_at}</p>
                        </div>

                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{featureFlag.updated_at}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Feature Flag</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete feature flag{' '}
                                    <span className="font-medium text-foreground">
                                        {featureFlag.name}
                                    </span>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Feature Flag'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Feature Flags', href: featureFlags() },
            { title: 'View Feature Flag', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
