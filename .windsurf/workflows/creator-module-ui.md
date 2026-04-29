---
description: Module UI Creator Workflow - Generate complete CRUD UI pages with list, create, edit, view, delete and integrate to sidebar/routes
---

# Module UI Creator Workflow

This workflow generates complete CRUD UI pages for a Laravel + React + shadcn/ui module. It creates:
- **List Page**: Table with pagination, search, and actions
- **Create Page**: Simple form with title field (extendable)
- **Edit Page**: Same as create with data pre-filled
- **View Page**: Detail view page
- **Delete**: Confirmation dialog
- **Sidebar**: Auto-registration in navigation
- **Routes**: Auto-registration in web.php

## Prerequisites

- Laravel + React + shadcn/ui project initialized
- components.json configured
- Existing AppSidebar at `@/components/app-sidebar.tsx`
- Existing web routes at `routes/web.php`
- Wayfinder route generation working

## Phase 0: Project Memory Check

### Step 0: Check Project Memory

Before proceeding with any task, check the project memory to understand:
- **Laravel Sail usage**: All commands must use `./vendor/bin/sail` prefix (e.g., `./vendor/bin/sail artisan`, `./vendor/bin/sail npm`, `./vendor/bin/sail composer`)
- **Package versions**: Laravel 13.0, React 19.2.0, Inertia.js 3.0, Tailwind CSS 4.0.0, Shadcn UI 4.2.0
- **Project structure**: Verify the project uses the expected Laravel + React + shadcn/ui stack
- **Testing framework**: Pest 4.5 for testing
- **Code formatting**: Laravel Pint for PHP, Prettier for frontend

If memory is not found or outdated, create/update it with current project configuration before proceeding.

## Phase 1: Component Requirements Check

### Step 1: Check Required shadcn Components

Verify these components exist in `@/components/ui/`:
- `table.tsx` - For data display
- `button.tsx` - For actions
- `input.tsx` - For search and forms
- `dialog.tsx` - For delete confirmation
- `pagination.tsx` - For table pagination
- `dropdown-menu.tsx` - For row actions
- `card.tsx` - For page layout
- `label.tsx` - For form labels
- `badge.tsx` - For status displays (optional)

If any component is missing, add it:
```bash
# turbo
npx shadcn@latest add table button input dialog pagination dropdown-menu card label badge
```

### Step 2: Check Existing Project Structure

Ensure these patterns exist in the project:
- `resources/js/pages/[module]/` directory structure for module pages
- `resources/js/types/index.ts` exports NavItem type
- `resources/js/components/app-sidebar.tsx` exists with mainNavItems array
- `routes/web.php` exists with route definitions

## Phase 2: Module Configuration

### Step 3: Define Module Metadata

Create variables for the module (replace with actual values):

```typescript
// Module configuration
const MODULE_NAME = '[module-name]';           // e.g., 'users', 'products'
const MODULE_TITLE = '[Module Title]';         // e.g., 'Users', 'Products'
const MODULE_ICON = '[IconName]';              // e.g., 'Users', 'Package'
const MODULE_ROUTE = '[route-name]';           // e.g., 'users', 'products'

// Examples:
// User module: MODULE_NAME='users', MODULE_TITLE='Users', MODULE_ICON='Users', MODULE_ROUTE='users'
// Product module: MODULE_NAME='products', MODULE_TITLE='Products', MODULE_ICON='Package', MODULE_ROUTE='products'
```

### Step 4: Define TypeScript Interfaces

```typescript
// Interface for the module item
interface [ModuleName] {
    id: number;
    title: string;
    // Add other fields as needed
    created_at: string;
    updated_at: string;
}

// Interface for page props
interface [ModuleName]IndexProps {
    data: {
        data: [ModuleName][];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
}

interface [ModuleName]FormProps {
    [moduleName]?: [ModuleName];  // Optional for edit, absent for create
}

interface [ModuleName]ShowProps {
    [moduleName]: [ModuleName];
}
```

## Phase 3: Create Pages

### Step 5: Create List Page (Index)

Create `resources/js/pages/[module]/index.tsx`:

```tsx
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as [module-name], create as [module-name]Create, show as [module-name]Show, edit as [module-name]Edit, destroy as [module-name]Destroy } from '@/routes/[module-name]';
import type { [ModuleName]IndexProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Index({ data, filters }: [ModuleName]IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get([module-name](), { search }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete([module-name]Destroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const paginationLinks = () => {
        const links = [];
        for (let i = 1; i <= data.last_page; i++) {
            links.push(
                <Button
                    key={i}
                    variant={data.current_page === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get([module-name](), { page: i, search }, { preserveState: true })}
                >
                    {i}
                </Button>
            );
        }
        return links;
    };

    return (
        <>
            <Head title={MODULE_TITLE} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <h2 className="text-xl font-semibold">{MODULE_TITLE}</h2>
                        <div className="flex items-center gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search..."
                                        className="w-64 pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <Button asChild size="sm">
                                <Link href={[module-name]Create()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No records found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    href={[module-name]Show(item.id)}
                                                    className="hover:underline"
                                                >
                                                    {item.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{item.created_at}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={[module-name]Show(item.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={[module-name]Edit(item.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(item.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {data.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {data.from} to {data.to} of {data.total} results
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get([module-name](), { page: data.current_page - 1, search }, { preserveState: true })}
                                        disabled={data.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {paginationLinks()}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get([module-name](), { page: data.current_page + 1, search }, { preserveState: true })}
                                        disabled={data.current_page === data.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: MODULE_TITLE, href: [module-name]() }]}>
        {page}
    </AppLayout>
);
```

### Step 6: Create Show Page (View)

Create `resources/js/pages/[module]/show.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as [module-name], edit as [module-name]Edit, destroy as [module-name]Destroy } from '@/routes/[module-name]';
import type { [ModuleName]ShowProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';

export default function Show({ [moduleName] }: [ModuleName]ShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete([module-name]Destroy([moduleName].id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`${MODULE_TITLE} - ${[moduleName].title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Back Link */}
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={[module-name]()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                {/* Header Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>{[moduleName].title}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={[module-name]Edit([moduleName].id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Title</p>
                            <p>{[moduleName].title}</p>
                        </div>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p>{[moduleName].created_at}</p>
                        </div>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                            <p>{[moduleName].updated_at}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{[moduleName].title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode, props: [ModuleName]ShowProps) => (
    <AppLayout
        breadcrumbs={[
            { title: MODULE_TITLE, href: [module-name]() },
            { title: props.[moduleName].title, href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
```

### Step 7: Create Create Page

Create `resources/js/pages/[module]/create.tsx`:

```tsx
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { index as [module-name], store as [module-name]Store } from '@/routes/[module-name]';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post([module-name]Store.url());
    };

    return (
        <>
            <Head title={`Create ${MODULE_TITLE}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Back Link */}
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={[module-name]()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                {/* Form Card */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New {MODULE_TITLE}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter title"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Add more form fields here as needed */}

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={[module-name]()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: MODULE_TITLE, href: [module-name]() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
```

### Step 8: Create Edit Page

Create `resources/js/pages/[module]/edit.tsx`:

```tsx
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { index as [module-name], show as [module-name]Show, update as [module-name]Update } from '@/routes/[module-name]';
import type { [ModuleName]FormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ [moduleName] }: [ModuleName]FormProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: [moduleName]?.title || '',
        // Add other fields here
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ([moduleName]) {
            put([module-name]Update.url([moduleName].id));
        }
    };

    return (
        <>
            <Head title={`Edit ${MODULE_TITLE}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Back Link */}
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={[module-name]Show([moduleName]!.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                {/* Form Card */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit {MODULE_TITLE}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter title"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Add more form fields here as needed */}

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={[module-name]Show([moduleName]!.id)}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode, props: [ModuleName]FormProps) => (
    <AppLayout
        breadcrumbs={[
            { title: MODULE_TITLE, href: MODULE_ROUTE() },
            { title: props.[moduleName]?.title || 'Edit', href: 'javascript:void(0)' },
        ]}
    >
        {page}
    </AppLayout>
);
```

## Phase 4: Update Sidebar Navigation

### Step 9: Add Module to Sidebar

Update `resources/js/components/app-sidebar.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, [IconName] } from 'lucide-react';
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
import { index as [module]Route } from '@/routes/[module]';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    // Add the new module here
    {
        title: MODULE_TITLE,
        href: [module]Route(),
        icon: [IconName],  // e.g., Users, Package, etc.
    },
];

const footerNavItems: NavItem[] = [
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

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
```

## Phase 5: Controller Creation & Validation

### Step 10: Check Controller Existence

Before adding routes, verify the controller exists at `app/Http/Controllers/[ModuleName]Controller.php`.

If the controller does NOT exist, create it with stub methods (see Step 12).

If the controller EXISTS but is missing required methods (index, create, store, show, edit, update, destroy), add the missing methods.

### Step 11: Add Routes to web.php

Update `routes/web.php` with individual route definitions (NOT resource routes):

```php
<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // [Module] Routes
    Route::get('[module]', [App\Http\Controllers\[ModuleName]Controller::class, 'index'])->name('[module].index');
    Route::get('[module]/create', [App\Http\Controllers\[ModuleName]Controller::class, 'create'])->name('[module].create');
    Route::post('[module]', [App\Http\Controllers\[ModuleName]Controller::class, 'store'])->name('[module].store');
    Route::get('[module]/{[module]}', [App\Http\Controllers\[ModuleName]Controller::class, 'show'])->name('[module].show');
    Route::get('[module]/{[module]}/edit', [App\Http\Controllers\[ModuleName]Controller::class, 'edit'])->name('[module].edit');
    Route::put('[module]/{[module]}', [App\Http\Controllers\[ModuleName]Controller::class, 'update'])->name('[module].update');
    Route::delete('[module]/{[module]}', [App\Http\Controllers\[ModuleName]Controller::class, 'destroy'])->name('[module].destroy');
});

require __DIR__.'/settings.php';
```

**IMPORTANT**: Always use individual route definitions, never `Route::resource()`. Individual routes allow for easier modification and removal of specific endpoints.

### Step 12: Generate Wayfinder Routes

After adding routes, regenerate Wayfinder routes:

```bash
# turbo
php artisan wayfinder:generate
```

**IMPORTANT**: Wayfinder generates routes in a nested structure based on route names. For routes like `users.index`, `users.create`, etc., wayfinder creates `resources/js/routes/users/index.ts`. Therefore, when importing routes in your components:
- Use `import { index as users, create as usersCreate } from '@/routes/users'` (nested)
- NOT `import { users, usersCreate } from '@/routes'` (root level)
- For useForm/put/post operations with non-GET routes, use `.url()` method: `post(usersStore.url())` or `put(usersUpdate.url(id))`
- For router.delete/get operations, call the route function directly: `router.delete(usersDestroy(id))` or `router.get(users())`

## Phase 6: Backend Controller Creation

### Step 13: Create Controller with Stub Methods

Create `app/Http/Controllers/[ModuleName]Controller.php` with all required CRUD methods:

```php
<?php

namespace App\Http\Controllers;

use App\Models\[ModuleName];
use Illuminate\Http\Request;
use Inertia\Inertia;

class [ModuleName]Controller extends Controller
{
    public function index(Request $request)
    {
        $query = [ModuleName]::query();

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('[module]/index', [
            'data' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('[module]/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        [ModuleName]::create($validated);

        return redirect()->route('[module].index')->with('success', 'Created successfully');
    }

    public function show([ModuleName] $[module])
    {
        return Inertia::render('[module]/show', [
            '[moduleName]' => $[module],
        ]);
    }

    public function edit([ModuleName] $[module])
    {
        return Inertia::render('[module]/edit', [
            '[moduleName]' => $[module],
        ]);
    }

    public function update(Request $request, [ModuleName] $[module])
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $[module]->update($validated);

        return redirect()->route('[module].index')->with('success', 'Updated successfully');
    }

    public function destroy([ModuleName] $[module])
    {
        $[module]->delete();

        return redirect()->route('[module].index')->with('success', 'Deleted successfully');
    }
}
```

**IMPORTANT**: This step must be completed BEFORE adding routes to web.php. The controller must exist with all required methods (index, create, store, show, edit, update, destroy) before routes are registered.

## Phase 7: TypeScript Types

### Step 14: Add Type Exports

Update `resources/js/types/index.ts` if needed to export new types:

```typescript
export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './[module]';  // Add this line if you create a separate types file
```

Or add to `resources/js/types/[module].ts`:

```typescript
export interface [ModuleName] {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface [ModuleName]IndexProps {
    data: {
        data: [ModuleName][];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
}

export interface [ModuleName]FormProps {
    [moduleName]?: [ModuleName];
}

export interface [ModuleName]ShowProps {
    [moduleName]: [ModuleName];
}
```

## Phase 8: Verification

### Step 15: Checklist

Before considering the module complete, verify:

- [ ] Controller created at `app/Http/Controllers/[ModuleName]Controller.php` with all CRUD methods
- [ ] List page created at `resources/js/pages/[module]/index.tsx`
- [ ] Create page created at `resources/js/pages/[module]/create.tsx`
- [ ] Edit page created at `resources/js/pages/[module]/edit.tsx`
- [ ] Show page created at `resources/js/pages/[module]/show.tsx`
- [ ] Sidebar updated with new navigation item
- [ ] Web routes registered in `routes/web.php` (individual routes, NOT resource)
- [ ] Wayfinder routes regenerated
- [ ] Types added to TypeScript
- [ ] Model exists (user responsibility)

### Step 16: Test Navigation

1. Click the module name in sidebar
2. Verify list page loads with table
3. Click "Add New" - should navigate to create page
4. Fill and submit form - should redirect to list
5. Click a row title - should navigate to view page
6. Click "Edit" - should navigate to edit page
7. Click "Delete" - should show confirmation dialog
8. Confirm delete - should redirect to list

## Quick Reference Commands

```bash
# Add missing shadcn components
npx shadcn@latest add table button input dialog pagination dropdown-menu card label

# Generate Wayfinder routes
php artisan wayfinder:generate

# Clear caches if needed
php artisan route:clear
php artisan view:clear
```

## Variable Replacement Guide

When creating a module, replace these placeholders:

| Placeholder | Example Value | Description |
|-------------|---------------|-------------|
| `[module-name]` | `users` | URL-friendly name (kebab-case) |
| `[Module Title]` | `Users` | Display name (Title Case) |
| `[IconName]` | `Users` | Lucide icon name |
| `[route-name]` | `users` | Route helper name |
| `[module]` | `user` | Singular form for variables |
| `[ModuleName]` | `User` | Model name (PascalCase) |
| `[moduleName]` | `user` | camelCase variable name |

## Common Lucide Icons by Module Type

- Users/People: `Users`, `User`, `UserCircle`
- Content: `FileText`, `Document`, `Book`, `Library`
- Commerce: `Package`, `ShoppingCart`, `CreditCard`, `Store`
- Settings: `Settings`, `Cog`, `Tool`
- Calendar: `Calendar`, `Clock`, `Timer`
- Communication: `Mail`, `MessageSquare`, `Bell`
- Analytics: `BarChart`, `PieChart`, `TrendingUp`
- Files: `Folder`, `File`, `Image`, `Upload`

## Best Practices

1. **Consistent Naming**: Use kebab-case for routes, PascalCase for components/models
2. **Type Safety**: Always define TypeScript interfaces for props
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Loading States**: Disable buttons during form submission
5. **Error Handling**: Display validation errors near fields
6. **UX Feedback**: Show success messages after CRUD operations
7. **Pagination**: Always include pagination for lists > 10 items
8. **Search**: Debounce search input for better performance
9. **Breadcrumbs**: Include breadcrumbs for navigation context
10. **Responsive**: Ensure table works on mobile (horizontal scroll or card layout)

## Output Structure

After running this workflow, the module will have:

```
resources/js/pages/[module]/
├── index.tsx    # List with search, pagination, actions
├── create.tsx   # Create form
├── edit.tsx     # Edit form
└── show.tsx     # View details

resources/js/components/app-sidebar.tsx  # Updated with nav item
routes/web.php                           # Updated with routes
resources/js/types/[module].ts           # TypeScript types (optional)
```

The result is a fully functional CRUD module integrated into the application sidebar and routes.
