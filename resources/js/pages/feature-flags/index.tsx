import { Head, router } from '@inertiajs/react';
import { MoreVertical, Pencil, Trash2, Eye, Flag, Power, PowerOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import {
    index as featureFlags,
    create as featureFlagsCreate,
    show as featureFlagsShow,
    edit as featureFlagsEdit,
    destroy as featureFlagsDestroy,
    toggle as featureFlagsToggle,
} from '@/routes/feature-flags';
import type { FeatureFlagsIndexProps, FeatureFlag } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters }: FeatureFlagsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [isEnabled, setIsEnabled] = useState<string>(
        filters.is_enabled !== undefined ? String(filters.is_enabled) : ''
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            featureFlags(),
            {
                search,
                per_page: perPage,
                is_enabled: isEnabled,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate({ search: value, page: 1 });
        }, 350);
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(featureFlagsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleToggle = (id: number) => {
        router.post(featureFlagsToggle.url(id));
    };

    return (
        <>
            <Head title="Feature Flags" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Feature Flags"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search feature flags…"
                        onSearchChange={handleSearchChange}
                        createHref={featureFlagsCreate().url}
                        createLabel="New Feature Flag"
                    />

                    {/* Filters */}
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enabled_only"
                                    checked={isEnabled === '1'}
                                    onCheckedChange={(checked) => {
                                        setIsEnabled(checked ? '1' : '');
                                        setTimeout(() => navigate({ is_enabled: checked ? '1' : '', page: 1 }), 0);
                                    }}
                                />
                                <Label htmlFor="enabled_only" className="text-sm font-normal cursor-pointer">
                                    Show enabled only
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="disabled_only"
                                    checked={isEnabled === '0'}
                                    onCheckedChange={(checked) => {
                                        setIsEnabled(checked ? '0' : '');
                                        setTimeout(() => navigate({ is_enabled: checked ? '0' : '', page: 1 }), 0);
                                    }}
                                />
                                <Label htmlFor="disabled_only" className="text-sm font-normal cursor-pointer">
                                    Show disabled only
                                </Label>
                            </div>

                            {(isEnabled || search) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsEnabled('');
                                        setSearch('');
                                        setTimeout(() => navigate({ is_enabled: '', search: '', page: 1 }), 0);
                                    }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Name
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Key
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Description
                                </TableHead>
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Enabled By
                                </TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <Flag className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No feature flags found</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item: FeatureFlag) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(featureFlagsShow(item.id))}
                                    >

                                        <TableCell className="px-4 py-3.5">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.name}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                {item.key}
                                            </code>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground max-w-xs truncate">
                                            {item.description || '-'}
                                        </TableCell>

                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggle(item.id);
                                                }}
                                                className={`
                                                    relative inline-flex h-6 w-10 items-center rounded-full
                                                    transition-all duration-200 ease-in-out
                                                    focus:outline-none focus:ring-0
                                                    ${item.is_enabled 
                                                        ? 'bg-primary hover:bg-primary/90' 
                                                        : 'bg-input hover:bg-input/80'
                                                    }
                                                `}
                                                role="switch"
                                                aria-checked={item.is_enabled}
                                                title={item.is_enabled ? 'Click to disable' : 'Click to enable'}
                                            >
                                                <span
                                                    className={`
                                                        pointer-events-none inline-block h-4 w-4 rounded-full
                                                        bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out
                                                        ${item.is_enabled ? 'translate-x-5' : 'translate-x-1'}
                                                    `}
                                                />
                                            </button>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.enabledBy?.name || '-'}
                                        </TableCell>

                                        <TableCell
                                            className="py-3.5 pl-4 pr-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => router.get(featureFlagsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.get(featureFlagsEdit(item.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggle(item.id)}>
                                                        {item.is_enabled ? (
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
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )))
                            }
                        </TableBody>
                    </Table>

                    <TablePagination
                        meta={{
                            total: data.total,
                            from: data.from,
                            to: data.to,
                            current_page: data.current_page,
                            last_page: data.last_page,
                        }}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Feature Flag"
                itemName={data.data.find((item) => item.id === deleteId)?.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Feature Flags', href: featureFlags() }]}>
        {page}
    </AppLayout>
);
