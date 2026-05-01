# Dev User Switcher

A development-only feature that adds a user switcher dropdown to the app header, allowing instant switching between users without logging out and back in.

**Only active when `APP_ENV=local`.** In any other environment, the dropdown is hidden and the switch endpoint returns 403.

---

## Target Files

| File | Change |
|------|--------|
| `app/Http/Controllers/Dev/SwitchUserController.php` | New — handles the login swap |
| `app/Http/Middleware/HandleInertiaRequests.php` | Share `devUsers` prop in local env |
| `routes/web.php` | Register the POST route conditionally |
| `resources/js/types/global.d.ts` | Add `DevUser` type + `devUsers` to shared props |
| `resources/js/components/app-sidebar-header.tsx` | Render the dropdown |

---

## Step-by-Step Implementation

### 1. Create the controller

**File:** `app/Http/Controllers/Dev/SwitchUserController.php`

```php
<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwitchUserController extends Controller
{
    public function __invoke(Request $request, User $user)
    {
        abort_unless(app()->environment('local'), 403);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
```

---

### 2. Share `devUsers` via Inertia middleware

**File:** `app/Http/Middleware/HandleInertiaRequests.php`

Add inside the `share()` return array, alongside `sidebarOpen`:

```php
'devUsers' => app()->environment('local')
    ? \App\Models\User::with('roles')->get(['id', 'name', 'email'])
        ->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'roles' => $u->getRoleNames()->values(),
        ])
    : null,
```

---

### 3. Register the route

**File:** `routes/web.php`

Add before `require __DIR__.'/settings.php';`:

```php
if (app()->environment('local')) {
    Route::middleware('auth')
        ->post('/dev/switch-user/{user}', [\App\Http\Controllers\Dev\SwitchUserController::class, '__invoke'])
        ->name('dev.switch-user');
}
```

---

### 4. Add TypeScript types

**File:** `resources/js/types/global.d.ts`

```typescript
import type { Auth } from '@/types/auth';

export type DevUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            devUsers?: DevUser[] | null;
            [key: string]: unknown;
        };
    }
}
```

---

### 5. Update the sidebar header component

**File:** `resources/js/components/app-sidebar-header.tsx`

Replace the file contents with a version that:
- Imports `router` and `usePage` from `@inertiajs/react`
- Imports `Button` from `@/components/ui/button`
- Imports `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`
- Imports `Check`, `ChevronDown` from `lucide-react`
- Reads `auth` and `devUsers` from `usePage().props`
- Renders the dropdown with `ml-auto` only when `devUsers` is non-null/non-empty
- On item click, calls `router.post('/dev/switch-user/${user.id}')` for non-active users
- Shows a checkmark (`Check` icon) next to the currently active user
- Displays the user's roles as a subtitle in each list item
- Shows a `DEV` amber badge in the trigger button

See the current file for the full implementation.

---

## How It Works

1. `HandleInertiaRequests` detects `APP_ENV=local` and queries all users with their roles, passing them as `devUsers` in every Inertia page response.
2. The `AppSidebarHeader` component reads `devUsers` from the shared props. If `null` (non-local env), the dropdown is not rendered.
3. When you pick a user from the dropdown, the frontend calls `POST /dev/switch-user/{id}`.
4. The controller runs `Auth::login($user)` then redirects to `/dashboard`.
5. Inertia reloads the page with the new user's session — sidebar, permissions, and all shared props update automatically.

---

## Post-Implementation: Clear Route Cache

After adding the route, **always clear the route cache** — a stale cache will cause 404 on the switch endpoint:

```bash
./vendor/bin/sail artisan route:clear
```

Verify the route is registered:

```bash
./vendor/bin/sail artisan route:list --path=dev
# Should show: POST dev/switch-user/{user}  dev.switch-user
```

> All commands in this project must use the `./vendor/bin/sail` prefix (Docker environment).

---

## Notes

- No package installation required — uses only existing Laravel auth and Inertia.js.
- The `abort_unless(app()->environment('local'), 403)` guard in the controller is a second layer of protection beyond the conditional route registration.
- After switching, the app redirects to `/dashboard` to avoid landing on a page the new user may not have permission to view.
- The dropdown is disabled (grayed out) for the currently active user to prevent a redundant self-switch.
- The `if (app()->environment('local'))` check in `routes/web.php` is evaluated at route-load time. If routes are cached (via `route:cache`), the cache must be cleared whenever this file changes — in production the dev route is simply absent from the cache.
