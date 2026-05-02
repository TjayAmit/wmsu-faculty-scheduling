import { Link } from '@inertiajs/react';
import { BookOpen, Building2, DoorOpen, FolderGit2, GraduationCap, LayoutGrid, Users, Library, CalendarDays, Calendar, Clock, Activity, Shield, FileText, CalendarCheck, Flag } from 'lucide-react';
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
import { usePermission } from '@/hooks/use-permission';
import { dashboard } from '@/routes';
import { index as users } from '@/routes/users';
import { index as teachers } from '@/routes/teachers';
import { index as subjects } from '@/routes/subjects';
import { index as schedules } from '@/routes/schedules';
import { index as semesters } from '@/routes/semesters';
import { index as timeSlots } from '@/routes/time-slots';
import { index as activityLogs } from '@/routes/activityLogs';
import { index as roles } from '@/routes/roles';
import { index as draftSchedules } from '@/routes/draft-schedules';
import { index as teacherSchedules } from '@/routes/teacher-schedules';
import { index as facultyDraftSchedules } from '@/routes/faculty-draft-schedules';
import { index as assignSchedules } from '@/routes/assign-schedules';
import { index as staff } from '@/routes/staff';
import { index as classrooms } from '@/routes/classrooms';
import { index as roomSchedules } from '@/routes/room-schedules';
import { index as teachingHistories } from '@/routes/teaching-histories';
import { index as substituteRequests } from '@/routes/substitute-requests';
import { index as leaveRequests } from '@/routes/leave-requests';
import { index as featureFlags } from '@/routes/feature-flags';
import { index as sections } from '@/routes/sections';
import { index as curricula } from '@/routes/curricula';
import { index as departments } from '@/routes/departments';
import { index as programs } from '@/routes/programs';
import type { NavGroup } from '@/types';

// ── Navigation groups ──────────────────────────────────────────────────────────
// Each item may declare `roles` and/or `permissions` guards (OR logic):
//   - roles: user must have at least one of the listed roles
//   - permissions: user must have at least one of the listed permissions
// Items with no guards are visible to all authenticated users.
// Groups with no visible items are automatically hidden.
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
        title: 'Faculty',
        roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
        items: [
            {
                title: 'Teachers',
                href: teachers(),
                icon: GraduationCap,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Faculty Staff',
                href: staff(),
                icon: Users,
                roles: ['Admin', 'Faculty Admin'],
            },
            // Note: Teacher Load Balance - would need: Hours distribution overview
        ],
    },
    {
        title: 'Academic',
        roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
        items: [
            {
                title: 'Semesters',
                href: semesters(),
                icon: Calendar,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Time Slots',
                href: timeSlots(),
                icon: Clock,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Subjects',
                href: subjects(),
                icon: Library,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Classrooms',
                href: classrooms(),
                icon: DoorOpen,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Curriculum',
                href: curricula(),
                icon: BookOpen,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Departments',
                href: departments(),
                icon: Building2,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Programs',
                href: programs(),
                icon: GraduationCap,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Sections',
                href: sections(),
                icon: Users,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            // Note: Holidays - would need: Non-teaching days configuration
            // Note: Workload Rules - would need: Max hours per faculty settings
        ],
    },
    {
        title: 'Scheduling',
        roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
        items: [
            {
                title: 'Schedules',
                href: schedules(),
                icon: CalendarDays,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Draft Schedules',
                href: facultyDraftSchedules(),
                icon: FileText,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Assign Schedules',
                href: assignSchedules(),
                icon: CalendarDays,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Room Schedules',
                href: roomSchedules(),
                icon: CalendarDays,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            {
                title: 'Substitute Requests',
                href: substituteRequests(),
                icon: Users,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
            // Note: Conflicts - would need: Schedule overlap detection view
            // Note: Schedule Analytics - would need: Utilization reports
            // Note: Mass Schedule Import - would need: Bulk CSV/Excel upload
        ],
    },
    {
        title: 'Schedule',
        roles: ['Teacher'],
        items: [
            {
                title: 'My Schedule',
                href: teacherSchedules(),
                icon: CalendarCheck,
                roles: ['Teacher'],
            },
            {
                title: 'Request Schedule',
                href: draftSchedules(),
                icon: FileText,
                roles: ['Teacher'],
            },
        ],
    },
    {
        title: 'Requests',
        roles: ['Teacher'],
        items: [
            {
                title: 'Substitute Requests',
                href: substituteRequests(),
                icon: Users,
                roles: ['Teacher'],
            },
            {
                title: 'Leave Requests',
                href: leaveRequests(),
                icon: Calendar,
                roles: ['Teacher'],
            },
        ],
    },
    {
        title: 'History',
        roles: ['Teacher'],
        items: [
            {
                title: 'Teaching History',
                href: teachingHistories(),
                icon: BookOpen,
                roles: ['Teacher'],
            },
            // Note: Availability - would need: Set preferred/unavailable time slots
            // Note: Workload Report - would need: Hours summary by semester
        ],
    },
    // Note: Dean role has no nav items - would need: Department Schedules, Approval Queue
    // Note: Department Head role has no nav items - would need: Department Faculty, Section Schedules
    {
        title: 'System',
        items: [
            {
                title: 'Users',
                href: users(),
                icon: Users,
                permissions: ['users.view'],
            },
            {
                title: 'Roles',
                href: roles(),
                icon: Shield,
                roles: ['Admin'],
            },
            {
                title: 'Activity Logs',
                href: activityLogs(),
                icon: Activity,
                permissions: ['activity_logs.view'],
            },
            {
                title: 'Feature Flags',
                href: featureFlags(),
                icon: Flag,
                roles: ['Admin'],
            },
            // Note: System Settings - would need: Global app configuration
            // Note: Backup/Restore - would need: Database backup management
            // Note: Notifications - would need: Broadcast/email settings
            // Note: Audit Trail - would need: Data change history
            // Note: API Keys - would need: Third-party integrations
            // Note: Email Templates - would need: Customizable notifications
            // Note: System Health - would need: Status/performance dashboard
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
    const { canAccess, hasRole } = usePermission();

    const filteredGroups = navGroups
        .filter((group) => !group.roles || hasRole(group.roles))
        .map((group) => ({
            ...group,
            items: group.items.filter(canAccess),
        }))
        .filter((group) => group.items.length > 0);

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
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
