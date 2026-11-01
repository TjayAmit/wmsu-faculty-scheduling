import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2, Users, Building2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import {
    index as staff,
    create as staffCreate,
    show as staffShow,
    edit as staffEdit,
    destroy as staffDestroy,
} from '@/routes/staff';
import type { StaffIndexProps } from '@/types';

export default function Index({ data, filters }: StaffIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            staff(),
            { search, per_page: perPage, ...params },
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
        if (!deleteId) {
            return;
        }

        setIsDeleting(true);
        router.delete(staffDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Faculty Staff" />

            {/* Standard full-width canvas */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* 1. Page Title & Description OUTSIDE the table card */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Faculty Staff
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage academic staff members, contact records, and system accounts.
                    </p>
                </div>

                {/* 2. Unified Surface Card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <TablePageHeader
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search faculty staff…"
                        onSearchChange={handleSearchChange}
                        createHref={staffCreate().url}
                        createLabel="New Staff Member"
                    />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Name
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Department
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Email
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Date Added
                                </TableHead>
                                <TableHead className="h-11 w-24 py-0 pl-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <Users className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No faculty staff found</p>
                                                {search && (
                                                    <p className="mt-0.5 text-sm">
                                                        Try a different search or{' '}
                                                        <button
                                                            onClick={() => handleSearchChange('')}
                                                            className="text-primary hover:underline"
                                                        >
                                                            clear the filter
                                                        </button>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(staffShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.name}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm">
                                            {item.department ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-primary/20 bg-primary/5 text-primary text-xs font-normal gap-1"
                                                >
                                                    <Building2 className="h-3 w-3" />
                                                    <span>
                                                        {item.department.code} - {item.department.name}
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Unassigned
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.email}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {fmtDate(item.created_at)}
                                        </TableCell>

                                        <TableCell
                                            className="py-3.5 pl-4 pr-6 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    title="Edit Faculty Staff"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(staffEdit(item.id));
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    title="Delete Faculty Staff"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteId(item.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
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
                title="Delete Faculty Staff Member"
                itemName={data.data.find((u) => u.id === deleteId)?.name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Faculty Staff', href: staff() }]}>
        {page}
    </AppLayout>
);
