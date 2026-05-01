<?php

namespace App\Repositories\Eloquent;

use App\Models\Subject;
use App\Repositories\SubjectRepository;

class EloquentSubjectRepository implements SubjectRepository
{
    public function all(): iterable
    {
        return Subject::all();
    }

    public function findById(int $id): ?Subject
    {
        return Subject::find($id);
    }

    public function create(array $data): Subject
    {
        return Subject::create($data);
    }

    public function update(int $id, array $data): Subject
    {
        $subject = $this->findById($id);
        $subject->update($data);
        return $subject;
    }

    public function delete(int $id): bool
    {
        $subject = $this->findById($id);
        return $subject->delete();
    }
}
