<?php

namespace App\Repositories;

use App\Models\Curriculum;

interface CurriculumRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Curriculum;

    public function create(array $data): Curriculum;

    public function update(int $id, array $data): Curriculum;

    public function delete(int $id): bool;

    public function findByProgramAndSubject(int $programId, int $subjectId): ?Curriculum;

    public function findByProgramId(int $programId): iterable;

    public function findBySubjectId(int $subjectId): iterable;

    public function findRequired(): iterable;

    public function findByYearLevel(int $yearLevel): iterable;

    public function findBySemesterType(string $semesterType): iterable;
}
