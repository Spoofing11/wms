<?php

namespace App\Services\Transaction;

use App\Models\IncomingTransaction;
use App\Models\StockReplenishment;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class IncomingTransactionService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?int $productId = null): LengthAwarePaginator
    {
        $query = IncomingTransaction::with(['product.category', 'purchaseSource', 'user']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $allowedSorts = ['id', 'transaction_id', 'transaction_date', 'quantity', 'purchase_price', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getById(int $id): IncomingTransaction
    {
        return IncomingTransaction::with(['product.category', 'purchaseSource', 'user'])->findOrFail($id);
    }

    public function create(array $data): IncomingTransaction
    {
        $stockReplenishmentId = $data['stock_replenishment_id'] ?? null;
        unset($data['stock_replenishment_id']);

        return DB::transaction(function () use ($data, $stockReplenishmentId) {
            $data['transaction_id'] = $this->codeGenerator->generateIncomingCode();
            $data['user_id'] = auth()->id() ?? ($data['user_id'] ?? 1);

            $transaction = IncomingTransaction::create($data);

            // Update product stock
            if ($transaction->product) {
                $transaction->product->increment('stock', $transaction->quantity);
            }

            // If linked to a PurchaseRequest from MR, update MR item status to siap_ambil
            if (!empty($data['purchase_request_id'])) {
                $purchaseRequest = \App\Models\PurchaseRequest::with('materialRequestItem')->find($data['purchase_request_id']);
                if ($purchaseRequest && $purchaseRequest->materialRequestItem) {
                    $purchaseRequest->materialRequestItem->update(['status' => 'siap_ambil']);
                    $purchaseRequest->update(['status' => 'ready']);
                    $this->updateMaterialRequestStatus($purchaseRequest->materialRequestItem);
                }
            }

            // If linked to a Stock Replenishment, mark as selesai
            if ($stockReplenishmentId) {
                $replenishment = StockReplenishment::find($stockReplenishmentId);
                if ($replenishment) {
                    $replenishment->update([
                        'status' => 'selesai',
                        'received_at' => now(),
                    ]);
                }
            }

            return $transaction;
        });
    }

    protected function updateMaterialRequestStatus($item): void
    {
        $materialRequest = $item->materialRequest;
        if (!$materialRequest) return;

        $statuses = $materialRequest->items->pluck('status');
        if ($statuses->every(fn ($s) => $s === 'diterima')) {
            $materialRequest->update(['status' => 'diterima']);
        } elseif ($statuses->contains('diproses')) {
            $materialRequest->update(['status' => 'diproses']);
        } elseif ($statuses->contains('siap_ambil')) {
            $materialRequest->update(['status' => 'siap_ambil']);
        } elseif ($statuses->every(fn ($s) => $s === 'diajukan')) {
            $materialRequest->update(['status' => 'diajukan']);
        }
    }

    public function update(int $id, array $data): IncomingTransaction
    {
        return DB::transaction(function () use ($id, $data) {
            $transaction = IncomingTransaction::findOrFail($id);

            // Reverse old stock
            if ($transaction->product) {
                $transaction->product->decrement('stock', $transaction->quantity);
            }

            $transaction->update($data);

            // Apply new stock
            if ($transaction->product) {
                $transaction->product->increment('stock', $transaction->quantity);
            }

            return $transaction->fresh(['product.category', 'purchaseSource', 'user']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $transaction = IncomingTransaction::findOrFail($id);

            // Reverse stock
            if ($transaction->product) {
                $transaction->product->decrement('stock', $transaction->quantity);
            }

            return $transaction->delete();
        });
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = IncomingTransaction::onlyTrashed()->with(['product.category', 'purchaseSource', 'user']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        $allowedSorts = ['id', 'transaction_id', 'transaction_date', 'deleted_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'deleted_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function restore(int $id): IncomingTransaction
    {
        return DB::transaction(function () use ($id) {
            $transaction = IncomingTransaction::onlyTrashed()->findOrFail($id);
            $transaction->restore();

            // Re-apply stock
            if ($transaction->product) {
                $transaction->product->increment('stock', $transaction->quantity);
            }

            return $transaction->fresh(['product.category', 'purchaseSource', 'user']);
        });
    }

    public function forceDelete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $transaction = IncomingTransaction::onlyTrashed()->findOrFail($id);
            return $transaction->forceDelete();
        });
    }
}
