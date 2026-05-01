<?php

namespace App\Repositories\Eloquent;

use App\Models\Program;
use App\Repositories\ProgramRepository;

class EloquentProgramRepository implements ProgramRepository
{
    public function all(): iterable
    {
        return Program::all();
    }

    public function findById(int $id): ?Program
    {
        return Program::find($id);
    }

    public function create(array $data): Program
    {
        return Program::create($data);
    }

    public function update(int $id, array $data): Program
    {
        $program = $this->findById($id);
        $program->update($data);

        return $program;
    }

    public function delete(int $id): bool
    {
        $program = $this->findById($id);

        return $program->delete();
    }

    public function findByCode(string $code): ?Program
    {
        return Program::where('code', $code)->first();
    }

    public function findActive(): iterable
    {
        return Program::active()->get();
    }

    public function findByDepartmentId(int $departmentId): iterable
    {
        return Program::where('department_id', $departmentId)->get();
    }

    public function findByDegreeLevel(string $degreeLevel): iterable
    {
        return Program::where('degree_level', $degreeLevel)->get();
    }
}
