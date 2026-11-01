import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';

export function UserNavMenu() {
    const { auth } = usePage().props;

    if (!auth?.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-left text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <span className="inline-block max-w-[120px] sm:max-w-[160px] truncate text-sm font-semibold text-primary-foreground">
                        {auth.user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-primary-foreground/80 opacity-80" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
