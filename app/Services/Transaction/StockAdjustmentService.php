<?php

namespace App\Services\Transaction;

use App\Models\StockAdjustment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StockAdjustmentService
{
    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?int $productId = null): LengthAwarePaginator
    {
        $query = StockAdjustment::with(['product.category', 'user']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $allowedSorts = ['id', 'old_stock', 'new_stock', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getById(int $id): StockAdjustment
    {
        return StockAdjustment::with(['product.category', 'user'])->findOrFail($id);
    }

    public function create(array $data): StockAdjustment
    {
        return DB::transaction(function () use ($data) {
            $product = \App\Models\Product::findOrFail($data['product_id']);
            $data['old_stock'] = $product->stock;
            $data['user_id'] = auth()->id() ?? ($data['user_id'] ?? 1);

            $adjustment = StockAdjustment::create($data);

            // Update product stock
            $product->update(['stock' => $data['new_stock']]);

            return $adjustment;
        });
    }

    public function update(int $id, array $data): StockAdjustment
    {
        return DB::transaction(function () use ($id, $data) {
            $adjustment = StockAdjustment::findOrFail($id);
            $product = \App\Models\Product::findOrFail($adjustment->product_id);

            // Restore old stock first
            $product->update(['stock' => $adjustment->old_stock]);

            $adjustment->update($data);

            // Apply new stock
            $product->update(['stock' => $adjustment->new_stock]);

            return $adjustment->fresh(['product.category', 'user']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $adjustment = StockAdjustment::findOrFail($id);
            $product = \App\Models\Product::findOrFail($adjustment->product_id);

            // Restore to old_stock
            $product->update(['stock' => $adjustment->old_stock]);

            return $adjustment->delete();
        });
    }
}
