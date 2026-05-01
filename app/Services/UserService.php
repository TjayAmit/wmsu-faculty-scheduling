<?php

namespace App\Services;

use App\DTOs\UserData;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;

class UserService
{
    public function __construct(
        protected UserRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?User
    {
        return $this->repository->findById($id);
    }

    public function createFromRequest(Request $request): User
    {
        $dto = UserData::fromRequest($request);
        return $this->repository->create($dto->toArray());
    }

    public function updateFromRequest(int $id, Request $request): User
    {
        $dto = UserData::fromRequest($request);
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createFromDTO(UserData $dto): User
    {
        return $this->repository->create($dto->toArray());
    }

    public function updateFromDTO(int $id, UserData $dto): User
    {
        return $this->repository->update($id, $dto->toArray());
    }
}
