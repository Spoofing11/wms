<?php

namespace App\Services\Master;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = Category::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['id', 'name', 'code', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function getAll()
    {
        return Category::orderBy('name')->get();
    }

    public function getById(int $id): Category
    {
        return Category::withCount('products')->findOrFail($id);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);
        $category->update($data);
        return $category->fresh();
    }

    public function delete(int $id): bool
    {
        $category = Category::findOrFail($id);
        return $category->delete();
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = Category::onlyTrashed();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['id', 'name', 'code', 'deleted_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'deleted_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function restore(int $id): Category
    {
        $category = Category::onlyTrashed()->findOrFail($id);
        $category->restore();
        return $category->fresh();
    }

    public function forceDelete(int $id): bool
    {
        $category = Category::onlyTrashed()->findOrFail($id);
        return $category->forceDelete();
    }
}
