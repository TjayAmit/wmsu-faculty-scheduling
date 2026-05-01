import { Link } from '@inertiajs/react';
import { BookOpen, DoorOpen, FolderGit2, GraduationCap, LayoutGrid, Users, Library, CalendarDays, Calendar, Clock, Activity, Shield, FileText, CalendarCheck } from 'lucide-react';
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
import { index as curricula } from '@/routes/curricula';
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
        title: 'Faculty Admin',
        items: [
            {
                title: 'Teachers',
                href: teachers(),
                icon: GraduationCap,
                roles: ['Admin', 'Faculty Admin', 'Faculty Staff'],
            },
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
                title: 'Faculty Staff',
                href: staff(),
                icon: Users,
                roles: ['Admin', 'Faculty Admin'],
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
            // Note: Departments - would need: Department configuration
            // Note: Programs - would need: Degree program management
            // Note: Sections - would need: Class sections per semester
            // Note: Holidays - would need: Non-teaching days configuration
            // Note: Workload Rules - would need: Max hours per faculty settings
        ],
    },
    {
        title: 'Scheduling',
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
                permissions: ['teacher_assignments.view'],
            },
            // Note: Conflicts - would need: Schedule overlap detection view
            // Note: Schedule Analytics - would need: Utilization reports
            // Note: Mass Schedule Import - would need: Bulk CSV/Excel upload
            // Note: Room Schedules - would need: Room occupancy calendar
            // Note: Teacher Load Balance - would need: Hours distribution overview
            // Note: Schedule Conflicts Resolution - would need: Override/reassign conflicts
        ],
    },
    {
        title: 'My Schedule',
        items: [
            {
                title: 'Request Schedule',
                href: draftSchedules(),
                icon: FileText,
                roles: ['Teacher'],
            },
            {
                title: 'My Schedule',
                href: teacherSchedules(),
                icon: CalendarCheck,
                roles: ['Teacher'],
            },
            // Note: Availability - would need: Set preferred/unavailable time slots
            // Note: Teaching History - would need: Past semester schedules archive
            // Note: Workload Report - would need: Hours summary by semester
            // Note: Substitute Requests - would need: Request/find substitute teachers
            // Note: Leave Requests - would need: File for absence/time off
            // Note: Schedule Preferences - would need: Preferred subjects/times settings
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
    const { canAccess } = usePermission();

    const filteredGroups = navGroups
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
