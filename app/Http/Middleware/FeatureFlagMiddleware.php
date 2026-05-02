<?php

namespace App\Http\Middleware;

use App\Models\FeatureFlag;
use App\Repositories\FeatureFlagRepository;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeatureFlagMiddleware
{
    public function __construct(
        protected FeatureFlagRepository $repository
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()?->getName();
        
        if (!$routeName) {
            return $next($request);
        }

        // Define feature flags required for each route/module
        $routeFeatureFlags = $this->getRouteFeatureFlags($routeName);
        
        foreach ($routeFeatureFlags as $featureFlag) {
            if (!$this->isFeatureEnabled($featureFlag)) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Feature disabled',
                        'feature' => $featureFlag,
                    ], 403);
                }
                
                return redirect()->back()->with('error', "The '{$featureFlag}' feature is currently disabled.");
            }
        }

        return $next($request);
    }

    /**
     * Get feature flags required for specific routes.
     */
    protected function getRouteFeatureFlags(string $routeName): array
    {
        $featureFlags = [
            // Substitute Requests
            'substitute-requests.index' => ['substitute_requests'],
            'substitute-requests.create' => ['substitute_requests'],
            'substitute-requests.store' => ['substitute_requests'],
            'substitute-requests.show' => ['substitute_requests'],
            'substitute-requests.edit' => ['substitute_requests'],
            'substitute-requests.update' => ['substitute_requests'],
            'substitute-requests.destroy' => ['substitute_requests'],
            'substitute-requests.approve' => ['substitute_requests'],
            'substitute-requests.reject' => ['substitute_requests'],
            'substitute-requests.cancel' => ['substitute_requests'],
            
            // Leave Requests
            'leave-requests.index' => ['leave_requests'],
            'leave-requests.create' => ['leave_requests'],
            'leave-requests.store' => ['leave_requests'],
            'leave-requests.show' => ['leave_requests'],
            'leave-requests.edit' => ['leave_requests'],
            'leave-requests.update' => ['leave_requests'],
            'leave-requests.destroy' => ['leave_requests'],
            'leave-requests.approve' => ['leave_requests'],
            'leave-requests.reject' => ['leave_requests'],
            'leave-requests.cancel' => ['leave_requests'],
            'leave-requests.my-requests' => ['leave_requests'],
            
            // Teaching History
            'teaching-histories.index' => ['teaching_histories'],
            'teaching-histories.create' => ['teaching_histories'],
            'teaching-histories.store' => ['teaching_histories'],
            'teaching-histories.show' => ['teaching_histories'],
            'teaching-histories.edit' => ['teaching_histories'],
            'teaching-histories.update' => ['teaching_histories'],
            'teaching-histories.destroy' => ['teaching_histories'],
            'teaching-histories.archive' => ['teaching_histories'],
            'teaching-histories.teacher-history' => ['teaching_histories'],
            
            // Room Schedules
            'room-schedules.index' => ['room_schedules'],
            'room-schedules.create' => ['room_schedules'],
            'room-schedules.store' => ['room_schedules'],
            'room-schedules.show' => ['room_schedules'],
            'room-schedules.edit' => ['room_schedules'],
            'room-schedules.update' => ['room_schedules'],
            'room-schedules.destroy' => ['room_schedules'],
            
            // Sections
            'sections.index' => ['sections'],
            'sections.create' => ['sections'],
            'sections.store' => ['sections'],
            'sections.show' => ['sections'],
            'sections.edit' => ['sections'],
            'sections.update' => ['sections'],
            'sections.destroy' => ['sections'],
            'sections.toggle-status' => ['sections'],
            'sections.assign-adviser' => ['sections'],
        ];

        return $featureFlags[$routeName] ?? [];
    }

    /**
     * Check if a feature flag is enabled.
     */
    protected function isFeatureEnabled(string $featureFlag): bool
    {
        $feature = $this->repository->findByKey($featureFlag);
        return $feature && $feature->isEnabled();
    }
}
