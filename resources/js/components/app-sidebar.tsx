import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, GraduationCap, LayoutGrid, Users, Library, CalendarDays, Calendar, Clock, Activity, Shield, FileText } from 'lucide-react';
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
import { index as semesters } from '@/routes/semesters';
import { index as timeSlots } from '@/routes/timeSlots';
import { index as activityLogs } from '@/routes/activityLogs';
import { index as roles } from '@/routes/roles';
import { index as draftSchedules } from '@/routes/draft-schedules';
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
        title: 'Scheduling Management',
        items: [
            {
                title: 'Schedules',
                href: schedules(),
                icon: CalendarDays,
            },
            {
                title: 'Semesters',
                href: semesters(),
                icon: Calendar,
            },
            {
                title: 'Time Slots',
                href: timeSlots(),
                icon: Clock,
            },
            {
                title: 'Subjects',
                href: subjects(),
                icon: Library,
            },
        ],
    },
    {
        title: 'Teacher Profiles',
        items: [
            {
                title: 'Teachers',
                href: teachers(),
                icon: GraduationCap,
            },
            {
                title: 'Assign Schedule',
                href: draftSchedules(),
                icon: FileText,
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
            },
            {
                title: 'Activity Logs',
                href: activityLogs(),
                icon: Activity,
            },
            {
                title: 'Roles',
                href: roles(),
                icon: Shield,
            },
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
