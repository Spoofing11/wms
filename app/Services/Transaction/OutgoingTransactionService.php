<?php

namespace App\Services\Transaction;

use App\Models\OutgoingTransaction;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OutgoingTransactionService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?int $productId = null): LengthAwarePaginator
    {
        $query = OutgoingTransaction::with(['product.category', 'user', 'project']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('taken_by', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $allowedSorts = ['id', 'transaction_id', 'transaction_date', 'quantity', 'usage_type', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getById(int $id): OutgoingTransaction
    {
        return OutgoingTransaction::with(['product.category', 'user', 'project'])->findOrFail($id);
    }

    public function create(array $data): OutgoingTransaction
    {
        return DB::transaction(function () use ($data) {
            $data['transaction_id'] = $this->codeGenerator->generateOutgoingCode();
            $data['user_id'] = auth()->id() ?? ($data['user_id'] ?? 1);

            // Auto-set project_name from project_id
            if (!empty($data['project_id']) && empty($data['project_name'])) {
                $project = \App\Models\Project::find($data['project_id']);
                if ($project) {
                    $data['project_name'] = $project->name;
                }
            }

            $transaction = OutgoingTransaction::create($data);

            // Update product stock
            if ($transaction->product) {
                $transaction->product->decrement('stock', $transaction->quantity);
            }

            return $transaction;
        });
    }

    public function update(int $id, array $data): OutgoingTransaction
    {
        return DB::transaction(function () use ($id, $data) {
            $transaction = OutgoingTransaction::findOrFail($id);

            // Reverse old stock
            if ($transaction->product) {
                $transaction->product->increment('stock', $transaction->quantity);
            }

            // Auto-set project_name from project_id
            if (!empty($data['project_id']) && empty($data['project_name'])) {
                $project = \App\Models\Project::find($data['project_id']);
                if ($project) {
                    $data['project_name'] = $project->name;
                }
            }

            $transaction->update($data);

            // Apply new stock
            if ($transaction->product) {
                $transaction->product->decrement('stock', $transaction->quantity);
            }

            return $transaction->fresh(['product.category', 'user', 'project']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $transaction = OutgoingTransaction::findOrFail($id);

            // Reverse stock
            if ($transaction->product) {
                $transaction->product->increment('stock', $transaction->quantity);
            }

            return $transaction->delete();
        });
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = OutgoingTransaction::onlyTrashed()->with(['product.category', 'user', 'project']);

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

    public function restore(int $id): OutgoingTransaction
    {
        return DB::transaction(function () use ($id) {
            $transaction = OutgoingTransaction::onlyTrashed()->findOrFail($id);
            $transaction->restore();

            // Re-apply stock decrease
            if ($transaction->product) {
                $transaction->product->decrement('stock', $transaction->quantity);
            }

            return $transaction->fresh(['product.category', 'user', 'project']);
        });
    }

    public function forceDelete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $transaction = OutgoingTransaction::onlyTrashed()->findOrFail($id);
            return $transaction->forceDelete();
        });
    }
}
