<?php

namespace App\Repositories\Eloquent;

use App\Models\Curriculum;
use App\Repositories\CurriculumRepository;

class EloquentCurriculumRepository implements CurriculumRepository
{
    public function all(): iterable
    {
        return Curriculum::all();
    }

    public function findById(int $id): ?Curriculum
    {
        return Curriculum::find($id);
    }

    public function create(array $data): Curriculum
    {
        return Curriculum::create($data);
    }

    public function update(int $id, array $data): Curriculum
    {
        $curriculum = $this->findById($id);
        $curriculum->update($data);

        return $curriculum;
    }

    public function delete(int $id): bool
    {
        $curriculum = $this->findById($id);

        return $curriculum->delete();
    }

    public function findByProgramAndSubject(int $programId, int $subjectId): ?Curriculum
    {
        return Curriculum::where('program_id', $programId)
            ->where('subject_id', $subjectId)
            ->first();
    }

    public function findByProgramId(int $programId): iterable
    {
        return Curriculum::where('program_id', $programId)->get();
    }

    public function findBySubjectId(int $subjectId): iterable
    {
        return Curriculum::where('subject_id', $subjectId)->get();
    }

    public function findRequired(): iterable
    {
        return Curriculum::required()->get();
    }

    public function findByYearLevel(int $yearLevel): iterable
    {
        return Curriculum::where('year_level', $yearLevel)->get();
    }

    public function findBySemesterType(string $semesterType): iterable
    {
        return Curriculum::where('semester_type', $semesterType)->get();
    }
}
