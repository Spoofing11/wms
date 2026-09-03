<?php

namespace App\Services\Operational;

use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\PurchaseRequest;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminProyekService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPendingReview(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = MaterialRequest::with(['project', 'requester', 'creator', 'items.product.category', 'items.purchaseRequest']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('division', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%")
                  ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function approve(int $id): MaterialRequest
    {
        return DB::transaction(function () use ($id) {
            $materialRequest = MaterialRequest::with('items')->findOrFail($id);

            if ($materialRequest->status !== 'menunggu_review_admin') {
                throw new \Exception('Material Request tidak dalam status yang benar untuk approve.');
            }

            // Process each item - determine status based on stock
            foreach ($materialRequest->items as $item) {
                $product = $item->product_id ? \App\Models\Product::find($item->product_id) : null;
                $quantityRequested = $item->quantity_requested;

                if (!$product) {
                    // Barang baru — perlu pengadaan, qty = quantity_requested
                    $itemStatus = 'menunggu_pengadaan';
                    $purchaseQuantity = $quantityRequested;
                } elseif ($product->stock < $quantityRequested) {
                    // Stock kurang — perlu pengadaan, qty = selisih
                    $itemStatus = 'menunggu_pengadaan';
                    $purchaseQuantity = $quantityRequested - $product->stock;
                } else {
                    // Stock cukup — langsung ke inbox
                    $itemStatus = 'diajukan';
                    $purchaseQuantity = null;
                }

                $item->update([
                    'status' => $itemStatus,
                    'purchase_quantity' => $purchaseQuantity,
                ]);

                // Auto-create PurchaseRequest if stock not enough or new item
                if ($itemStatus === 'menunggu_pengadaan') {
                    app(PurchasingService::class)->createFromMaterialRequestItem($item);
                }
            }

            // Update MR status based on items
            $this->updateMaterialRequestStatus($materialRequest);

            return $materialRequest->fresh(['project', 'requester', 'creator', 'items.product.category']);
        });
    }

    public function reject(int $id, ?string $reason = null): MaterialRequest
    {
        return DB::transaction(function () use ($id, $reason) {
            $materialRequest = MaterialRequest::with('items')->findOrFail($id);

            if ($materialRequest->status !== 'menunggu_review_admin') {
                throw new \Exception('Material Request tidak dalam status yang benar untuk reject.');
            }

            $materialRequest->update([
                'status' => 'ditolak',
            ]);

            $materialRequest->items()->update([
                'status' => 'ditolak',
                'rejection_reason' => $reason,
            ]);

            return $materialRequest->fresh(['project', 'requester', 'creator', 'items.product.category']);
        });
    }

    public function updateItem(int $itemId, array $data): MaterialRequestItem
    {
        $item = MaterialRequestItem::findOrFail($itemId);

        $item->update($data);

        return $item->fresh(['materialRequest.project', 'product.category']);
    }

    protected function updateMaterialRequestStatus(MaterialRequest $materialRequest): void
    {
        $items = $materialRequest->items;

        if ($items->isEmpty()) {
            return;
        }

        $statuses = $items->pluck('status')->unique();

        if ($statuses->contains('ditolak') && $statuses->count() === 1) {
            $materialRequest->update(['status' => 'ditolak']);
        } elseif ($statuses->contains('menunggu_pengadaan')) {
            $materialRequest->update(['status' => 'menunggu_pengadaan']);
        } elseif ($statuses->contains('diajukan')) {
            $materialRequest->update(['status' => 'diajukan']);
        } elseif ($statuses->contains('disetujui')) {
            $materialRequest->update(['status' => 'disetujui']);
        } elseif ($statuses->contains('diproses')) {
            $materialRequest->update(['status' => 'diproses']);
        } elseif ($statuses->contains('siap_ambil')) {
            $materialRequest->update(['status' => 'siap_ambil']);
        } elseif ($statuses->every(fn ($s) => $s === 'diterima')) {
            $materialRequest->update(['status' => 'diterima']);
        }
    }
}
