<?php

namespace App\Repositories;

use App\Models\Section;

interface SectionRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Section;

    public function create(array $data): Section;

    public function update(int $id, array $data): Section;

    public function delete(int $id): bool;

    public function findBySectionCode(string $sectionCode): ?Section;

    public function findActive(): iterable;

    public function findByProgramId(int $programId): iterable;

    public function findBySemesterId(int $semesterId): iterable;

    public function findByYearLevel(int $yearLevel): iterable;

    public function findByAdviserId(int $adviserId): iterable;
}
