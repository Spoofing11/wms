<?php

namespace App\Services\Master;

use App\Models\PurchaseSource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseSourceService
{
    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = PurchaseSource::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('source_type', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['id', 'source_type', 'name', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function getAll()
    {
        return PurchaseSource::orderBy('name')->get();
    }

    public function getById(int $id): PurchaseSource
    {
        return PurchaseSource::withCount('products')->findOrFail($id);
    }

    public function create(array $data): PurchaseSource
    {
        return PurchaseSource::create($data);
    }

    public function update(int $id, array $data): PurchaseSource
    {
        $purchaseSource = PurchaseSource::findOrFail($id);
        $purchaseSource->update($data);
        return $purchaseSource->fresh();
    }

    public function delete(int $id): bool
    {
        $purchaseSource = PurchaseSource::findOrFail($id);
        return $purchaseSource->delete();
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = PurchaseSource::onlyTrashed();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('source_type', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['id', 'source_type', 'name', 'deleted_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'deleted_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->withCount('products')->paginate($perPage);
    }

    public function restore(int $id): PurchaseSource
    {
        $purchaseSource = PurchaseSource::onlyTrashed()->findOrFail($id);
        $purchaseSource->restore();
        return $purchaseSource->fresh();
    }

    public function forceDelete(int $id): bool
    {
        $purchaseSource = PurchaseSource::onlyTrashed()->findOrFail($id);
        return $purchaseSource->forceDelete();
    }
}
