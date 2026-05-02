<?php

namespace App\Http\Controllers;

use App\Http\Requests\FeatureFlagRequest;
use App\Models\FeatureFlag;
use App\Services\FeatureFlagService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeatureFlagController extends Controller
{
    public function __construct(
        protected FeatureFlagService $service
    ) {}

    public function index(Request $request)
    {
        $query = FeatureFlag::with('enabledBy');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%'.$search.'%')
                ->orWhere('key', 'like', '%'.$search.'%');
        }

        if ($request->has('is_enabled')) {
            $query->where('is_enabled', $request->boolean('is_enabled'));
        }

        return Inertia::render('feature-flags/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'is_enabled', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('feature-flags/create');
    }

    public function store(FeatureFlagRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('feature-flags.index')->with('success', 'Feature flag created successfully');
    }

    public function updateFromRequest(int $id, FeatureFlagRequest $request): FeatureFlag
    {
        return $this->service->updateFromRequest($id, $request);
    }

    public function show(FeatureFlag $featureFlag)
    {
        $featureFlag->load('enabledBy');

        return Inertia::render('feature-flags/show', [
            'featureFlag' => $featureFlag,
        ]);
    }

    public function edit(FeatureFlag $featureFlag)
    {
        $featureFlag->load('enabledBy');

        return Inertia::render('feature-flags/edit', [
            'featureFlag' => $featureFlag,
        ]);
    }

    public function update(FeatureFlagRequest $request, FeatureFlag $featureFlag)
    {
        $this->service->updateFromRequest($featureFlag->id, $request);

        return redirect()->route('feature-flags.index')->with('success', 'Feature flag updated successfully');
    }

    public function destroy(FeatureFlag $featureFlag)
    {
        $this->service->delete($featureFlag);

        return redirect()->route('feature-flags.index')->with('success', 'Feature flag deleted successfully');
    }

    public function enable(FeatureFlag $featureFlag)
    {
        $this->service->enable($featureFlag->id);

        return redirect()->route('feature-flags.index')->with('success', 'Feature flag enabled successfully');
    }

    public function disable(FeatureFlag $featureFlag)
    {
        $this->service->disable($featureFlag->id);

        return redirect()->route('feature-flags.index')->with('success', 'Feature flag disabled successfully');
    }

    public function toggle(FeatureFlag $featureFlag)
    {
        if ($featureFlag->isEnabled()) {
            $this->service->disable($featureFlag->id);
            $message = 'Feature flag disabled successfully';
        } else {
            $this->service->enable($featureFlag->id);
            $message = 'Feature flag enabled successfully';
        }

        return redirect()->route('feature-flags.index')->with('success', $message);
    }
}
