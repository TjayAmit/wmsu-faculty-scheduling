<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class DepartmentData
{
    public function __construct(
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly ?int $head_id = null,
        public readonly ?string $office_location = null,
        public readonly ?string $contact_phone = null,
        public readonly ?string $contact_email = null,
        public readonly bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            code: $request->validated('code'),
            name: $request->validated('name'),
            description: $request->validated('description'),
            head_id: $request->validated('head_id'),
            office_location: $request->validated('office_location'),
            contact_phone: $request->validated('contact_phone'),
            contact_email: $request->validated('contact_email'),
            is_active: $request->validated('is_active', true),
        );
    }

    public static function fromModel(Department $department): self
    {
        return new self(
            code: $department->code,
            name: $department->name,
            description: $department->description,
            head_id: $department->head_id,
            office_location: $department->office_location,
            contact_phone: $department->contact_phone,
            contact_email: $department->contact_email,
            is_active: $department->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'head_id' => $this->head_id,
            'office_location' => $this->office_location,
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,
            'is_active' => $this->is_active,
        ], fn ($value) => $value !== null);
    }
}
