<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::query()
            ->with(['subject', 'causer']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('description', 'like', '%' . $search . '%')
                  ->orWhere('log_name', 'like', '%' . $search . '%')
                  ->orWhere('event', 'like', '%' . $search . '%');
        }

        if ($request->has('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        if ($request->has('event')) {
            $query->where('event', $request->event);
        }

        return Inertia::render('activityLogs/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['search', 'log_name', 'event', 'per_page']),
            'logNames' => Activity::distinct()->pluck('log_name')->filter()->values(),
            'events' => Activity::distinct()->pluck('event')->filter()->values(),
        ]);
    }

    public function show(Activity $activityLog)
    {
        $activityLog->load(['subject', 'causer']);

        return Inertia::render('activityLogs/show', [
            'activityLog' => $activityLog,
        ]);
    }

    public function destroy(Activity $activityLog)
    {
        $activityLog->delete();

        return redirect()->route('activityLogs.index')->with('success', 'Activity log entry deleted successfully');
    }
}
