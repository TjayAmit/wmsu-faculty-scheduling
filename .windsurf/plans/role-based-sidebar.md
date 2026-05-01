# Role-Based Sidebar with Spatie Permissions

## Overview

This plan documents how the app sidebar was refactored to render navigation items based on the authenticated user's roles and permissions, powered by [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission).

The approach is:
- Backend shares the user's roles and permissions via Inertia shared props
- Each `NavItem` declares optional `roles` and/or `permissions` guards
- A `usePermission` hook evaluates those guards against the current user
- `AppSidebar` filters groups and items before passing them to `NavMain`
- Groups with zero visible items are automatically hidden

**Guard logic (OR within each guard type):**
- If an item has `roles: ['Admin', 'Faculty Admin']`, the user needs **any one** of those roles
- If an item has `permissions: ['users.view']`, the user needs **any one** of those permissions
- If an item has **both** `roles` and `permissions`, satisfying **either** grants access
- If an item has **neither**, it is visible to all authenticated users

---

## Files Changed

| File | Change |
|---|---|
| `app/Http/Middleware/HandleInertiaRequests.php` | Share `auth.roles` and `auth.permissions` |
| `resources/js/types/auth.ts` | Add `roles` and `permissions` to `Auth` type |
| `resources/js/types/navigation.ts` | Add optional `roles` and `permissions` to `NavItem` |
| `resources/js/hooks/use-permission.ts` | New hook: `hasRole`, `hasPermission`, `canAccess` |
| `resources/js/components/app-sidebar.tsx` | Filter groups/items using `canAccess` |

---

## Role → Sidebar Access Matrix

| Section | Item | Guard |
|---|---|---|
| Overview | Dashboard | (none — all authenticated) |
| Request Management | Assign Schedules | `permissions: ['teacher_assignments.view']` |
| Request Management | Draft Schedules | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Scheduling Management | Teachers | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Scheduling Management | Schedules | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Scheduling Management | Semesters | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Scheduling Management | Time Slots | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Scheduling Management | Subjects | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Schedule Management | Assign Schedule | `roles: ['Admin', 'Faculty Admin', 'Faculty Staff']` |
| Schedule Management | My Schedule | `roles: ['Teacher']` |
| System Management | Users | `permissions: ['users.view']` |
| System Management | Activity Logs | `permissions: ['activity_logs.view']` |
| System Management | Roles | `roles: ['Admin']` |

**Why `roles` over `permissions` for Scheduling Management?**
Teacher role also holds `schedules.view`, `subjects.view`, and `teachers.view` permissions (to view their own data). Using a role guard instead of a permission guard prevents Teachers from seeing the admin management pages.

---

## Boilerplate

### 1. Spatie Roles & Permissions Seeder

```php
<?php
// database/seeders/RoleAndPermissionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete',
            'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete',
            'semesters.view', 'semesters.create', 'semesters.edit', 'semesters.delete',
            'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
            'time_slots.view', 'time_slots.create', 'time_slots.edit', 'time_slots.delete',
            'teacher_assignments.view', 'teacher_assignments.create', 'teacher_assignments.edit', 'teacher_assignments.delete',
            'activity_logs.view',
            'users.view', 'users.create', 'users.edit', 'users.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        Role::firstOrCreate(['name' => 'Admin'])->givePermissionTo(Permission::all());

        Role::firstOrCreate(['name' => 'Faculty Admin'])->givePermissionTo([
            'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete',
            'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
            'time_slots.view', 'time_slots.create', 'time_slots.edit', 'time_slots.delete',
            'teacher_assignments.view', 'teacher_assignments.create', 'teacher_assignments.edit', 'teacher_assignments.delete',
            'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete',
            'semesters.view', 'semesters.create', 'semesters.edit', 'semesters.delete',
            'activity_logs.view',
            'users.view',
        ]);

        Role::firstOrCreate(['name' => 'Faculty Staff'])->givePermissionTo([
            'subjects.view', 'subjects.create', 'subjects.edit',
            'schedules.view', 'schedules.create', 'schedules.edit',
            'time_slots.view', 'time_slots.create', 'time_slots.edit',
            'teacher_assignments.view', 'teacher_assignments.create', 'teacher_assignments.edit',
            'teachers.view', 'teachers.create', 'teachers.edit',
            'semesters.view',
        ]);

        Role::firstOrCreate(['name' => 'Teacher'])->givePermissionTo([
            'teachers.view',
            'schedules.view',
            'subjects.view',
        ]);
    }
}
```

---

### 2. User Model

```php
<?php
// app/Models/User.php

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles; // provides getRoleNames(), getAllPermissions(), etc.
}
```

---

### 3. Inertia Middleware — Share Roles & Permissions

```php
<?php
// app/Http/Middleware/HandleInertiaRequests.php

public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'auth' => [
            'user'        => $request->user(),
            'roles'       => $request->user()?->getRoleNames() ?? collect(),
            'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? collect(),
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
    ];
}
```

> `getRoleNames()` returns a `Collection<string>` of role names.
> `getAllPermissions()->pluck('name')` returns a flat `Collection<string>` of all directly assigned + role-inherited permissions.
> Both serialize to plain JSON arrays on the frontend.

---

### 4. TypeScript — Auth Types

```ts
// resources/js/types/auth.ts

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    roles: string[];       // e.g. ['Admin'] or ['Teacher']
    permissions: string[]; // e.g. ['users.view', 'schedules.view']
};
```

---

### 5. TypeScript — NavItem Type with Guards

```ts
// resources/js/types/navigation.ts

import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** User must have at least one of these permissions to see this item. */
    permissions?: string[];
    /** User must have at least one of these roles to see this item. */
    roles?: string[];
};

export type NavGroup = {
    title: string;
    items: NavItem[];
};
```

---

### 6. TypeScript — Global Inertia Props

```ts
// resources/js/types/global.d.ts

import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
```

---

### 7. React Hook — usePermission

```ts
// resources/js/hooks/use-permission.ts

import { usePage } from '@inertiajs/react';
import type { NavItem } from '@/types';

export function usePermission() {
    const { auth } = usePage().props;
    const userRoles: string[] = auth.roles ?? [];
    const userPermissions: string[] = auth.permissions ?? [];

    const hasRole = (role: string | string[]): boolean => {
        const check = Array.isArray(role) ? role : [role];
        return check.some((r) => userRoles.includes(r));
    };

    const hasPermission = (permission: string | string[]): boolean => {
        const check = Array.isArray(permission) ? permission : [permission];
        return check.some((p) => userPermissions.includes(p));
    };

    /**
     * Returns true when the item has no guards, or the user satisfies
     * at least one role guard OR at least one permission guard.
     */
    const canAccess = (item: Pick<NavItem, 'roles' | 'permissions'>): boolean => {
        const hasRoleGuard = item.roles && item.roles.length > 0;
        const hasPermissionGuard = item.permissions && item.permissions.length > 0;

        if (!hasRoleGuard && !hasPermissionGuard) return true;
        if (hasRoleGuard && hasRole(item.roles!)) return true;
        if (hasPermissionGuard && hasPermission(item.permissions!)) return true;

        return false;
    };

    return { hasRole, hasPermission, canAccess };
}
```

---

### 8. AppSidebar — Filtered Navigation

```tsx
// resources/js/components/app-sidebar.tsx

import { usePermission } from '@/hooks/use-permission';
import type { NavGroup } from '@/types';

// Define nav groups with optional role/permission guards
const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        title: 'System Management',
        items: [
            {
                title: 'Users',
                href: users(),
                icon: Users,
                permissions: ['users.view'],        // permission guard
            },
            {
                title: 'Roles',
                href: roles(),
                icon: Shield,
                roles: ['Admin'],                   // role guard
            },
            {
                title: 'My Schedule',
                href: teacherSchedules(),
                icon: CalendarCheck,
                roles: ['Teacher'],                 // role guard (teacher only)
            },
        ],
    },
];

export function AppSidebar() {
    const { canAccess } = usePermission();

    // Filter items per group, then drop groups with no visible items
    const filteredGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(canAccess),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            {/* ... header ... */}
            <SidebarContent className="pt-7">
                <NavMain groups={filteredGroups} />
            </SidebarContent>
            {/* ... footer ... */}
        </Sidebar>
    );
}
```

---

## How to Add a New Nav Item

1. Add a new entry to `navGroups` in `app-sidebar.tsx`.
2. Attach the appropriate guard:
   - `permissions: ['resource.action']` — recommended when a Spatie permission uniquely targets the right audience
   - `roles: ['Role Name']` — use when multiple roles share the same permissions but only certain roles should see the item
3. If no guard is set, the item is visible to all authenticated users.
4. No changes needed to `NavMain` — it renders whatever it receives.

## How to Use the Hook Outside the Sidebar

```tsx
import { usePermission } from '@/hooks/use-permission';

function SomeComponent() {
    const { hasRole, hasPermission } = usePermission();

    return (
        <div>
            {hasRole('Admin') && <AdminPanel />}
            {hasPermission('users.create') && <CreateUserButton />}
        </div>
    );
}
```

---

## Security Note

Sidebar filtering is a **UX convenience only**. It does not replace server-side authorization.
Always enforce role/permission checks in Laravel controllers and policies:

```php
// Controller
public function index() {
    $this->authorize('viewAny', User::class);
    // or
    Gate::authorize('users.view');
}

// Route middleware
Route::middleware(['role:Admin|Faculty Admin'])->group(function () {
    Route::resource('users', UserController::class);
});
```
