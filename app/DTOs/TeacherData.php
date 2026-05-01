<?php

namespace App\DTOs;

use App\Enums\EmploymentType;
use App\Models\Teacher;
use Illuminate\Http\Request;

readonly class TeacherData
{
    public function __construct(
        public ?int $user_id = null,
        public ?string $employee_id = null,
        public ?string $department = null,
        public ?string $rank = null,
        public EmploymentType|string|null $employment_type = null,
        public ?string $date_hired = null,
        public ?string $phone = null,
        public ?string $address = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            user_id: $request->validated('user_id'),
            employee_id: $request->validated('employee_id'),
            department: $request->validated('department'),
            rank: $request->validated('rank'),
            employment_type: $request->validated('employment_type'),
            date_hired: $request->validated('date_hired'),
            phone: $request->validated('phone'),
            address: $request->validated('address'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Teacher $teacher): self
    {
        return new self(
            user_id: $teacher->user_id,
            employee_id: $teacher->employee_id,
            department: $teacher->department,
            rank: $teacher->rank,
            employment_type: $teacher->employment_type,
            date_hired: $teacher->date_hired?->toDateString(),
            phone: $teacher->phone,
            address: $teacher->address,
            is_active: $teacher->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
