<?php

namespace App\Repositories\Eloquent;

use App\Models\Holiday;
use App\Repositories\HolidayRepository;

class EloquentHolidayRepository implements HolidayRepository
{
    public function all(): iterable
    {
        return Holiday::all();
    }

    public function findById(int $id): ?Holiday
    {
        return Holiday::find($id);
    }

    public function create(array $data): Holiday
    {
        return Holiday::create($data);
    }

    public function update(int $id, array $data): Holiday
    {
        $holiday = $this->findById($id);
        $holiday->update($data);

        return $holiday;
    }

    public function delete(int $id): bool
    {
        $holiday = $this->findById($id);

        return $holiday->delete();
    }

    public function findByDate(string $date): ?Holiday
    {
        return Holiday::where('date', $date)->first();
    }

    public function findByDateRange(string $startDate, string $endDate): iterable
    {
        return Holiday::whereBetween('date', [$startDate, $endDate])->get();
    }

    public function findAffectsSchedules(): iterable
    {
        return Holiday::affectsSchedules()->get();
    }

    public function findByType(string $type): iterable
    {
        return Holiday::where('type', $type)->get();
    }

    public function findByAcademicYear(string $academicYear): iterable
    {
        return Holiday::where('academic_year', $academicYear)->get();
    }
}
