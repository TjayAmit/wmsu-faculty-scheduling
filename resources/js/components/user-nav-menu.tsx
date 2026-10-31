import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';

export function UserNavMenu() {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    if (!auth?.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-9 items-center gap-2 rounded-full px-2 py-1 text-left hover:bg-accent focus-visible:ring-1"
                >
                    <Avatar className="h-7 w-7 overflow-hidden rounded-full ring-1 ring-border">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="rounded-full bg-neutral-200 text-xs font-semibold text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="inline-block max-w-[120px] sm:max-w-[160px] truncate text-sm font-medium text-foreground">
                        {auth.user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
