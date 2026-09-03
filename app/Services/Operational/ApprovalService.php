<?php

namespace App\Services\Operational;

use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\OutgoingTransaction;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPendingItems(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = MaterialRequest::with([
            'items' => function ($q) {
                $q->whereIn('status', ['diajukan', 'disetujui', 'siap_ambil', 'diterima'])
                  ->with(['product.category', 'approver', 'photoApprover']);
            },
            'project',
            'requester',
            'creator',
        ])
        ->whereHas('items', function ($q) {
            $q->whereIn('status', ['diajukan', 'disetujui', 'siap_ambil', 'diterima']);
        });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('requester_name', 'like', "%{$search}%")
                  ->orWhere('division', 'like', "%{$search}%")
                  ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('items', function ($iq) use ($search) {
                      $iq->where('new_item_name', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
                  });
            });
        }

        $allowedSorts = ['id', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function approveStep1(int $itemId): MaterialRequestItem
    {
        return DB::transaction(function () use ($itemId) {
            $item = MaterialRequestItem::with('materialRequest')->findOrFail($itemId);

            if (!in_array($item->status, ['diajukan', 'siap_ambil'])) {
                throw new \Exception('Item tidak dalam status yang benar untuk approve.');
            }

            $item->update([
                'status' => 'disetujui',
                'approved_by' => auth()->id() ?? 1,
                'approved_at' => now(),
            ]);

            $this->updateMaterialRequestStatus($item->materialRequest);

            return $item->fresh(['materialRequest.project', 'materialRequest.requester', 'product.category']);
        });
    }

    public function approveStep2(int $itemId, ?string $photoPath = null): array
    {
        return DB::transaction(function () use ($itemId, $photoPath) {
            $item = MaterialRequestItem::with('materialRequest')->findOrFail($itemId);

            if ($item->status !== 'disetujui') {
                throw new \Exception('Item tidak dalam status yang benar untuk approve step 2.');
            }

            $item->update([
                'status' => 'diterima',
                'photo_approved_by' => auth()->id() ?? 1,
                'photo_approved_at' => now(),
                'ready_photo' => $photoPath ?? $item->ready_photo,
            ]);

            $outgoingCode = $this->codeGenerator->generateOutgoingCode();

            $outgoingData = [
                'transaction_id' => $outgoingCode,
                'transaction_date' => now()->toDateString(),
                'product_id' => $item->product_id,
                'quantity' => $item->quantity_requested,
                'condition' => 'good',
                'usage_type' => $item->usage_type === 'borrow' ? 'Pinjam' : 'Habis Pakai',
                'project_name' => $item->materialRequest?->project?->name ?? '',
                'project_id' => $item->materialRequest?->project_id,
                'notes' => $item->notes ?? 'Auto dari Material Request',
                'pickup_time' => $item->materialRequest?->pickup_time,
                'user_id' => auth()->id() ?? 1,
                'taken_by' => $item->materialRequest?->requester_name,
                'material_request_item_id' => $item->id,
            ];

            OutgoingTransaction::create($outgoingData);

            if ($item->product) {
                $item->product->decrement('stock', $item->quantity_requested);
            }

            $this->updateMaterialRequestStatus($item->materialRequest);

            return [
                'item' => $item->fresh(['materialRequest.project', 'materialRequest.requester', 'product.category']),
                'transaction_id' => $outgoingCode,
                'mr_code' => 'MR-' . str_pad($item->materialRequest->id, 3, '0', STR_PAD_LEFT),
            ];
        });
    }

    public function reject(int $itemId, ?string $reason = null): MaterialRequestItem
    {
        return DB::transaction(function () use ($itemId, $reason) {
            $item = MaterialRequestItem::with('materialRequest')->findOrFail($itemId);

            if (!in_array($item->status, ['diajukan', 'disetujui'])) {
                throw new \Exception('Item tidak dalam status yang benar untuk reject.');
            }

            $item->update([
                'status' => 'ditolak',
                'rejection_reason' => $reason,
            ]);

            $this->updateMaterialRequestStatus($item->materialRequest);

            return $item->fresh(['materialRequest.project', 'materialRequest.requester', 'product.category']);
        });
    }

    protected function updateMaterialRequestStatus(MaterialRequest $materialRequest): void
    {
        $items = $materialRequest->items()->get();

        if ($items->isEmpty()) {
            return;
        }

        $statuses = $items->pluck('status')->unique();

        if ($statuses->every(fn ($s) => $s === 'diterima')) {
            $materialRequest->update(['status' => 'diterima']);
        } elseif ($statuses->every(fn ($s) => $s === 'ditolak')) {
            $materialRequest->update(['status' => 'ditolak']);
        } elseif ($statuses->contains('siap_ambil')) {
            $materialRequest->update(['status' => 'siap_ambil']);
        } elseif ($statuses->contains('disetujui')) {
            $materialRequest->update(['status' => 'disetujui']);
        } elseif ($statuses->contains('diajukan')) {
            $materialRequest->update(['status' => 'diajukan']);
        }
    }
}
