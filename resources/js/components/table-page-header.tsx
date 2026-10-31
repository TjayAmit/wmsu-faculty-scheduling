import { Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TablePageHeaderProps {
    title?: string;
    count?: number;
    description?: string;
    search: string;
    searchPlaceholder?: string;
    onSearchChange: (value: string) => void;
    createHref?: string;
    createLabel?: string;
    children?: React.ReactNode;
}

export function TablePageHeader({
    title,
    count,
    description,
    search,
    searchPlaceholder = 'Search…',
    onSearchChange,
    createHref,
    createLabel = 'New',
    children,
}: TablePageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
            <div className="shrink-0">
                {title && <h2 className="text-base font-semibold text-card-foreground">{title}</h2>}
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {count !== undefined && (
                    <p className={title ? "text-xs text-muted-foreground mt-0.5" : "text-sm font-medium text-muted-foreground"}>
                        {count} {count === 1 ? 'record' : 'records'}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        className="h-9 w-44 pl-8 text-sm lg:w-56"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {children}

                {createHref && (
                    <Button asChild size="sm" className="h-9 gap-1.5 shrink-0">
                        <Link href={createHref}>
                            <Plus className="h-4 w-4" />
                            {createLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
