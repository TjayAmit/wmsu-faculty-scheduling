<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubstituteRequestRequest;
use App\Models\Teacher;
use App\Models\SubstituteRequest;
use App\Services\SubstituteRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubstituteRequestController extends Controller
{
    public function __construct(
        protected SubstituteRequestService $service
    ) {}

    public function index(Request $request)
    {
        $query = SubstituteRequest::with(['requestingTeacher', 'substituteTeacher', 'schedule', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('requesting_teacher_id')) {
            $query->where('requesting_teacher_id', $request->requesting_teacher_id);
        }

        if ($request->has('substitute_teacher_id')) {
            $query->where('substitute_teacher_id', $request->substitute_teacher_id);
        }

        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        return Inertia::render('substitute-requests/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'requesting_teacher_id', 'substitute_teacher_id', 'date_from', 'date_to', 'per_page']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('substitute-requests/create', [
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(SubstituteRequestRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request created successfully');
    }

    public function show(SubstituteRequest $substituteRequest)
    {
        $substituteRequest->load(['requestingTeacher', 'substituteTeacher', 'schedule', 'approver']);

        return Inertia::render('substitute-requests/show', [
            'substituteRequest' => $substituteRequest,
        ]);
    }

    public function edit(SubstituteRequest $substituteRequest)
    {
        $substituteRequest->load(['requestingTeacher', 'substituteTeacher', 'schedule']);

        return Inertia::render('substitute-requests/edit', [
            'substituteRequest' => $substituteRequest,
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function update(SubstituteRequestRequest $request, SubstituteRequest $substituteRequest)
    {
        $this->service->updateFromRequest($substituteRequest->id, $request);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request updated successfully');
    }

    public function destroy(SubstituteRequest $substituteRequest)
    {
        $this->service->delete($substituteRequest);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request deleted successfully');
    }

    public function approve(SubstituteRequest $substituteRequest)
    {
        $this->service->approve($substituteRequest);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request approved successfully');
    }

    public function reject(Request $request, SubstituteRequest $substituteRequest)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->service->reject($substituteRequest, $request->reason);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request rejected successfully');
    }

    public function cancel(SubstituteRequest $substituteRequest)
    {
        $this->service->cancel($substituteRequest);

        return redirect()->route('substitute-requests.index')->with('success', 'Substitute request cancelled successfully');
    }

    public function myRequests(Request $request)
    {
        $teacherId = auth()->user()->teacher?->id;
        
        $query = SubstituteRequest::with(['substituteTeacher', 'schedule', 'approver'])
            ->where('requesting_teacher_id', $teacherId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('substitute-requests/my-requests', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'per_page']),
        ]);
    }
}
