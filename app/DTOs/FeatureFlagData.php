<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class FeatureFlagData
{
    public function __construct(
        public readonly string $name,
        public readonly string $key,
        public readonly ?string $description = null,
        public readonly bool $is_enabled = false,
        public readonly ?int $enabled_by = null,
        public readonly ?string $enabled_at = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->validated('name'),
            key: $request->validated('key'),
            description: $request->validated('description'),
            is_enabled: $request->validated('is_enabled', false),
            enabled_by: $request->validated('enabled_by'),
            enabled_at: $request->validated('enabled_at'),
        );
    }

    public static function fromModel(FeatureFlag $featureFlag): self
    {
        return new self(
            name: $featureFlag->name,
            key: $featureFlag->key,
            description: $featureFlag->description,
            is_enabled: $featureFlag->is_enabled,
            enabled_by: $featureFlag->enabled_by,
            enabled_at: $featureFlag->enabled_at?->format('Y-m-d H:i:s'),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'key' => $this->key,
            'description' => $this->description,
            'is_enabled' => $this->is_enabled,
            'enabled_by' => $this->enabled_by,
            'enabled_at' => $this->enabled_at,
        ], fn ($value) => $value !== null);
    }
}
