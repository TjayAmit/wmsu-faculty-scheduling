<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'rank' => $this->rank,
            'employment_type' => $this->employment_type,
            'employment_type_label' => $this->employment_type?->getLabel(),
            'date_hired' => $this->date_hired,
            'phone' => $this->phone,
            'address' => $this->address,
            'is_active' => $this->is_active,
            'has_user_account' => $this->hasUserAccount(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'user' => $this->when($this->user_id, function () {
                return new UserResource($this->user);
            }),

            'assignments_count' => $this->whenCounted('assignments'),
            'active_assignments_count' => $this->whenCounted('activeAssignments'),
        ];
    }
}
