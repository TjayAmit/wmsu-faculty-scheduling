<?php

namespace App\Repositories\Eloquent;

use App\Models\Section;
use App\Repositories\SectionRepository;

class EloquentSectionRepository implements SectionRepository
{
    public function all(): iterable
    {
        return Section::all();
    }

    public function findById(int $id): ?Section
    {
        return Section::find($id);
    }

    public function create(array $data): Section
    {
        return Section::create($data);
    }

    public function update(int $id, array $data): Section
    {
        $section = $this->findById($id);
        $section->update($data);

        return $section;
    }

    public function delete(int $id): bool
    {
        $section = $this->findById($id);

        return $section->delete();
    }

    public function findBySectionCode(string $sectionCode): ?Section
    {
        return Section::where('section_code', $sectionCode)->first();
    }

    public function findActive(): iterable
    {
        return Section::active()->get();
    }

    public function findByProgramId(int $programId): iterable
    {
        return Section::where('program_id', $programId)->get();
    }

    public function findBySemesterId(int $semesterId): iterable
    {
        return Section::where('semester_id', $semesterId)->get();
    }

    public function findByYearLevel(int $yearLevel): iterable
    {
        return Section::where('year_level', $yearLevel)->get();
    }

    public function findByAdviserId(int $adviserId): iterable
    {
        return Section::where('adviser_id', $adviserId)->get();
    }
}
