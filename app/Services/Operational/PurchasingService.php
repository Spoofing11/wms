<?php

namespace App\Services\Operational;

use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\PurchaseRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PurchasingService
{
    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?string $tab = null): LengthAwarePaginator
    {
        $query = MaterialRequest::with([
            'items' => function ($q) use ($tab) {
                $q->whereHas('purchaseRequest', function ($prq) use ($tab) {
                    $prq->whereIn('status', ['diajukan', 'disetujui', 'ready']);
                    if ($tab === 'barang-baru') {
                        $prq->whereNull('product_id');
                    } elseif ($tab === 'pengadaan') {
                        $prq->whereNotNull('product_id');
                    }
                })->with(['purchaseRequest', 'product.category']);
            },
            'project',
            'requester',
        ])
        ->whereHas('items.purchaseRequest', function ($prq) use ($tab) {
            $prq->whereIn('status', ['diajukan', 'disetujui', 'ready']);

            if ($tab === 'barang-baru') {
                $prq->whereNull('product_id');
            } elseif ($tab === 'pengadaan') {
                $prq->whereNotNull('product_id');
            }
        });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('requester_name', 'like', "%{$search}%")
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

    public function getById(int $id): PurchaseRequest
    {
        return PurchaseRequest::with(['materialRequestItem.materialRequest.project', 'materialRequestItem.product', 'product', 'requester', 'project'])->findOrFail($id);
    }

    public function approve(int $id): PurchaseRequest
    {
        return DB::transaction(function () use ($id) {
            $purchaseRequest = PurchaseRequest::with('materialRequestItem')->findOrFail($id);

            if ($purchaseRequest->status !== 'diajukan') {
                throw new \Exception('Permintaan tidak dalam status yang benar untuk approve.');
            }

            $purchaseRequest->update(['status' => 'disetujui']);

            if ($purchaseRequest->materialRequestItem) {
                $purchaseRequest->materialRequestItem->update(['status' => 'diproses']);
            }

            return $purchaseRequest->fresh(['materialRequestItem.materialRequest.project', 'product', 'requester']);
        });
    }

    public function reject(int $id, ?string $reason = null): PurchaseRequest
    {
        return DB::transaction(function () use ($id, $reason) {
            $purchaseRequest = PurchaseRequest::with('materialRequestItem')->findOrFail($id);

            if ($purchaseRequest->status !== 'diajukan') {
                throw new \Exception('Permintaan tidak dalam status yang benar untuk reject.');
            }

            $purchaseRequest->update([
                'status' => 'ditolak',
                'rejection_reason' => $reason,
            ]);

            if ($purchaseRequest->materialRequestItem) {
                $purchaseRequest->materialRequestItem->update([
                    'status' => 'ditolak',
                    'rejection_reason' => $reason,
                ]);
            }

            return $purchaseRequest->fresh(['materialRequestItem.materialRequest.project', 'product', 'requester']);
        });
    }

    public function createFromMaterialRequestItem(MaterialRequestItem $item): PurchaseRequest
    {
        $mr = $item->materialRequest;

        return PurchaseRequest::create([
            'item_name' => $item->new_item_name ?? $item->product?->name ?? '-',
            'product_id' => $item->product_id,
            'quantity' => $item->purchase_quantity ?? $item->quantity_requested,
            'requested_by' => $mr?->created_by ?? 1,
            'status' => 'diajukan',
            'material_request_item_id' => $item->id,
            'project_id' => $mr?->project_id,
            'project_name' => $mr?->project?->name,
            'urgency' => $mr?->urgency,
            'notes' => $item->notes,
            'requester_name' => $mr?->requester_name,
        ]);
    }

    public function getPendingNewItems()
    {
        return PurchaseRequest::with(['materialRequestItem.materialRequest.project', 'materialRequestItem.product'])
            ->whereNull('product_id')
            ->where('status', 'disetujui')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPendingIncomingItems()
    {
        return PurchaseRequest::with(['materialRequestItem.materialRequest.project', 'materialRequestItem.product.category', 'product'])
            ->where('status', 'disetujui')
            ->whereNotNull('product_id')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
