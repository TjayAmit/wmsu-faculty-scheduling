import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, GraduationCap, LayoutGrid, Users, Library, CalendarDays } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as users } from '@/routes/users';
import { index as teachers } from '@/routes/teachers';
import { index as subjects } from '@/routes/subjects';
import { index as schedules } from '@/routes/schedules';
import type { NavGroup } from '@/types';

// ── Navigation groups ──────────────────────────────────────────────────────────
// Add new groups or items here. Each group renders its own labeled section in
// the sidebar. Items with icons from lucide-react are supported.
// ──────────────────────────────────────────────────────────────────────────────
const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Scheduling',
        items: [
            {
                title: 'Schedules',
                href: schedules(),
                icon: CalendarDays,
            },
        ],
    },
    {
        title: 'Profiling',
        items: [
            {
                title: 'Teachers',
                href: teachers(),
                icon: GraduationCap,
            },
            {
                title: 'Subjects',
                href: subjects(),
                icon: Library,
            },
        ],
    },
    {
        title: 'System Management',
        items: [
            {
                title: 'Users',
                href: users(),
                icon: Users,
            }
        ],
    },
];

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-7">
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
