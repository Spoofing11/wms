<?php

namespace App\Services\Master;

use App\Models\Location;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LocationService
{
    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = Location::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $allowedSorts = ['id', 'name', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function getAll()
    {
        return Location::orderBy('name')->get();
    }

    public function getById(int $id): Location
    {
        return Location::withCount('products')->findOrFail($id);
    }

    public function create(array $data): Location
    {
        return Location::create($data);
    }

    public function update(int $id, array $data): Location
    {
        $location = Location::findOrFail($id);
        $location->update($data);
        return $location->fresh();
    }

    public function delete(int $id): bool
    {
        $location = Location::findOrFail($id);
        return $location->delete();
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = Location::onlyTrashed();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $allowedSorts = ['id', 'name', 'deleted_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'deleted_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function restore(int $id): Location
    {
        $location = Location::onlyTrashed()->findOrFail($id);
        $location->restore();
        return $location->fresh();
    }

    public function forceDelete(int $id): bool
    {
        $location = Location::onlyTrashed()->findOrFail($id);
        return $location->forceDelete();
    }
}
