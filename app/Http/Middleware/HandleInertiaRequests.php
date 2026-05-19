<?php

namespace App\Http\Middleware;

use App\Models\Teacher;
use App\Models\User;
use App\Repositories\FeatureFlagRepository;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    private function unlinkedTeachersForPrompt(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('Teacher') || $user->teacher !== null) {
            return null;
        }

        $teachers = Teacher::whereNull('user_id')
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'employee_id', 'department'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'full_name' => trim("{$t->first_name} {$t->last_name}"),
                'employee_id' => $t->employee_id,
                'department' => $t->department,
            ])
            ->values()
            ->toArray();

        return count($teachers) > 0 ? $teachers : null;
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $featureFlagRepository = app(FeatureFlagRepository::class);
        $enabledFlags = $featureFlagRepository->getAllEnabled();

        $featureFlags = [];
        foreach ($enabledFlags as $flag) {
            $featureFlags[$flag->key] = true;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? collect(),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? collect(),
                'unlinked_teachers' => $this->unlinkedTeachersForPrompt($request),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'featureFlags' => $featureFlags,
            'devUsers' => app()->environment('local')
                ? User::with('roles')->get(['id', 'name', 'email'])
                    ->map(fn ($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'roles' => $u->getRoleNames()->values(),
                    ])
                : null,
        ];
    }
}
