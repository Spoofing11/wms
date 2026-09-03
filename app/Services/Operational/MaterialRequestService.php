<?php

namespace App\Services\Operational;

use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MaterialRequestService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?string $tab = null): LengthAwarePaginator
    {
        $query = MaterialRequest::with(['project', 'requester', 'creator', 'items.product.category', 'items']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('division', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%")
                  ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($tab === 'permintaan') {
            $query->whereHas('items', fn ($iq) => $iq->where('status', '!=', 'menunggu_pengadaan'));
        } elseif ($tab === 'pengadaan') {
            $query->whereHas('items', fn ($iq) => $iq->where('status', 'menunggu_pengadaan'));
        }

        $allowedSorts = ['id', 'request_date', 'urgency', 'status', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getForPrint(string $search = '', ?string $tab = null)
    {
        $query = MaterialRequest::with(['project', 'requester', 'creator', 'items.product.category']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('division', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%")
                  ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($tab === 'permintaan') {
            $query->whereHas('items', fn ($iq) => $iq->where('status', '!=', 'menunggu_pengadaan'));
        } elseif ($tab === 'pengadaan') {
            $query->whereHas('items', fn ($iq) => $iq->where('status', 'menunggu_pengadaan'));
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getById(int $id): MaterialRequest
    {
        return MaterialRequest::with(['project', 'requester', 'creator', 'items.product.category', 'items.approver', 'items.photoApprover', 'items.purchaseRequest'])->findOrFail($id);
    }

    public function create(array $data): MaterialRequest
    {
        return DB::transaction(function () use ($data) {
            $itemsData = $data['items'] ?? [];
            unset($data['items']);

            $data['created_by'] = auth()->id();
            $data['status'] = 'menunggu_review_admin';

            $materialRequest = MaterialRequest::create($data);

            foreach ($itemsData as $itemData) {
                $materialRequest->items()->create([
                    'product_id' => $itemData['product_id'] ?? null,
                    'new_item_name' => $itemData['new_item_name'] ?? null,
                    'quantity_requested' => $itemData['quantity_requested'] ?? 0,
                    'purchase_quantity' => $itemData['purchase_quantity'] ?? null,
                    'usage_type' => $itemData['usage_type'] ?? $materialRequest->usage_type,
                    'notes' => $itemData['notes'] ?? null,
                    'ready_photo' => $itemData['ready_photo'] ?? null,
                    'photo' => $itemData['photo'] ?? null,
                    'status' => 'menunggu_review_admin',
                ]);
            }

            return $materialRequest->fresh(['project', 'requester', 'creator', 'items.product.category']);
        });
    }

    public function update(int $id, array $data): MaterialRequest
    {
        return DB::transaction(function () use ($id, $data) {
            $materialRequest = MaterialRequest::findOrFail($id);

            $itemsData = $data['items'] ?? null;
            unset($data['items']);

            $materialRequest->update($data);

            if ($itemsData !== null) {
                foreach ($itemsData as $itemData) {
                    if (isset($itemData['id'])) {
                        $item = $materialRequest->items()->findOrFail($itemData['id']);
                        $item->update($itemData);
                    } else {
                        $materialRequest->items()->create($itemData);
                    }
                }
            }

            return $materialRequest->fresh(['project', 'requester', 'creator', 'items.product.category']);
        });
    }

    public function delete(int $id): bool
    {
        $materialRequest = MaterialRequest::findOrFail($id);
        return $materialRequest->delete();
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10): LengthAwarePaginator
    {
        $query = MaterialRequest::onlyTrashed()->with(['project', 'requester', 'creator']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('division', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%");
            });
        }

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function restore(int $id): MaterialRequest
    {
        $materialRequest = MaterialRequest::onlyTrashed()->findOrFail($id);
        $materialRequest->restore();
        return $materialRequest->fresh(['project', 'requester', 'creator']);
    }

    public function forceDelete(int $id): bool
    {
        $materialRequest = MaterialRequest::onlyTrashed()->findOrFail($id);
        return $materialRequest->forceDelete();
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
        } elseif ($statuses->contains('menunggu_review_admin')) {
            $materialRequest->update(['status' => 'menunggu_review_admin']);
        } elseif ($statuses->contains('menunggu_pengadaan')) {
            $materialRequest->update(['status' => 'menunggu_pengadaan']);
        } elseif ($statuses->contains('disetujui')) {
            $materialRequest->update(['status' => 'disetujui']);
        } elseif ($statuses->contains('diproses')) {
            $materialRequest->update(['status' => 'diproses']);
        } elseif ($statuses->contains('siap_ambil')) {
            $materialRequest->update(['status' => 'siap_ambil']);
        } elseif ($statuses->every(fn ($s) => $s === 'diterima')) {
            $materialRequest->update(['status' => 'diterima']);
        } else {
            $materialRequest->update(['status' => 'diajukan']);
        }
    }
}
