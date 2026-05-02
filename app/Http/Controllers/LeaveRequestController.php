<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveRequestRequest;
use App\Models\Teacher;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveRequestService $service
    ) {}

    public function index(Request $request)
    {
        $query = LeaveRequest::with(['teacher', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('leave_type')) {
            $query->where('leave_type', $request->leave_type);
        }

        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('end_date', '<=', $request->date_to);
        }

        return Inertia::render('leave-requests/index', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'teacher_id', 'leave_type', 'date_from', 'date_to', 'per_page']),
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('leave-requests/create', [
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(LeaveRequestRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request created successfully');
    }

    public function show(LeaveRequest $leaveRequest)
    {
        $leaveRequest->load(['teacher', 'approver']);

        return Inertia::render('leave-requests/show', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    public function edit(LeaveRequest $leaveRequest)
    {
        $leaveRequest->load(['teacher']);

        return Inertia::render('leave-requests/edit', [
            'leaveRequest' => $leaveRequest,
            'teachers' => Teacher::all(['id', 'first_name', 'last_name']),
        ]);
    }

    public function update(LeaveRequestRequest $request, LeaveRequest $leaveRequest)
    {
        $this->service->updateFromRequest($leaveRequest->id, $request);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request updated successfully');
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $this->service->delete($leaveRequest);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request deleted successfully');
    }

    public function approve(LeaveRequest $leaveRequest)
    {
        $this->service->approve($leaveRequest);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request approved successfully');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->service->reject($leaveRequest, $request->reason);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request rejected successfully');
    }

    public function cancel(LeaveRequest $leaveRequest)
    {
        $this->service->cancel($leaveRequest);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request cancelled successfully');
    }

    public function myRequests(Request $request)
    {
        $teacherId = auth()->user()->teacher?->id;
        
        $query = LeaveRequest::with(['approver'])
            ->where('teacher_id', $teacherId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('leave-requests/my-requests', [
            'data' => $query->latest()->paginate($request->per_page ?? 10)->withQueryString(),
            'filters' => $request->only(['status', 'per_page']),
        ]);
    }
}
