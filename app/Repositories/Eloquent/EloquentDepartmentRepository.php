<?php

namespace App\Repositories\Eloquent;

use App\Models\Department;
use App\Repositories\DepartmentRepository;

class EloquentDepartmentRepository implements DepartmentRepository
{
    public function all(): iterable
    {
        return Department::all();
    }

    public function findById(int $id): ?Department
    {
        return Department::find($id);
    }

    public function create(array $data): Department
    {
        return Department::create($data);
    }

    public function update(int $id, array $data): Department
    {
        $department = $this->findById($id);
        $department->update($data);

        return $department;
    }

    public function delete(int $id): bool
    {
        $department = $this->findById($id);

        return $department->delete();
    }

    public function findByCode(string $code): ?Department
    {
        return Department::where('code', $code)->first();
    }

    public function findActive(): iterable
    {
        return Department::active()->get();
    }

    public function findByHeadId(int $headId): iterable
    {
        return Department::where('head_id', $headId)->get();
    }
}
