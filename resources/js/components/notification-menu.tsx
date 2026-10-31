import { Link } from '@inertiajs/react';
import { Bell, CalendarDays, CheckCheck, Clock, Layers } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { index as schedules } from '@/routes/schedules';
import { index as substituteRequests } from '@/routes/substitute-requests';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    href?: string;
    iconType: 'schedule' | 'substitute' | 'system';
}

const defaultNotifications: NotificationItem[] = [
    {
        id: '1',
        title: 'Schedule Published',
        description: '1st Semester AY 2026-2027 draft schedule is ready for review.',
        time: '10m ago',
        read: false,
        href: schedules(),
        iconType: 'schedule',
    },
    {
        id: '2',
        title: 'Substitute Request',
        description: 'Prof. Maria Santos requested schedule substitute for Nov 3.',
        time: '1h ago',
        read: false,
        href: substituteRequests(),
        iconType: 'substitute',
    },
    {
        id: '3',
        title: 'Room Assignment Updated',
        description: 'Room CS-204 schedule has been modified.',
        time: '3h ago',
        read: true,
        href: schedules(),
        iconType: 'schedule',
    },
];

export function NotificationMenu() {
    const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const renderIcon = (type: NotificationItem['iconType']) => {
        switch (type) {
            case 'schedule':
                return <CalendarDays className="h-4 w-4 text-primary" />;
            case 'substitute':
                return <Clock className="h-4 w-4 text-amber-500" />;
            default:
                return <Layers className="h-4 w-4 text-emerald-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label={`Notifications (${unreadCount} unread)`}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
                <DropdownMenuLabel className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Notifications</span>
                            {unreadCount > 0 ? (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                                    {unreadCount} new
                                </Badge>
                            ) : (
                                <span className="text-xs text-muted-foreground">All caught up</span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all as read
                            </button>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((item) => {
                            const content = (
                                <div
                                    className={cn(
                                        'flex items-start gap-3 p-3 transition-colors hover:bg-accent/60 cursor-pointer',
                                        !item.read && 'bg-accent/25',
                                    )}
                                    onClick={() => markAsRead(item.id)}
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                                        {renderIcon(item.iconType)}
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p
                                                className={cn(
                                                    'text-xs truncate font-medium text-foreground',
                                                    !item.read && 'font-semibold',
                                                )}
                                            >
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {item.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>
                                    {!item.read && (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
                                    )}
                                </div>
                            );

                            return item.href ? (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="block"
                                    onClick={() => markAsRead(item.id)}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <div key={item.id}>{content}</div>
                            );
                        })
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="p-2 text-center">
                    <Link
                        href={schedules()}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View all schedules & updates
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
