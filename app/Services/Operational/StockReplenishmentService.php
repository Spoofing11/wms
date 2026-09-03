<?php

namespace App\Services\Operational;

use App\Models\StockReplenishment;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StockReplenishmentService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function create(array $data): StockReplenishment
    {
        return DB::transaction(function () use ($data) {
            $data['replenishment_id'] = $this->codeGenerator->generateRestockCode();
            $data['requested_by'] = auth()->id();
            $data['status'] = 'diajukan';

            return StockReplenishment::create($data);
        });
    }

    public function getForAdminProyek(string $search = '', int $perPage = 10, string $sortField = 'created_at', string $sortOrder = 'desc'): LengthAwarePaginator
    {
        $query = StockReplenishment::with(['product.category', 'requester'])
            ->where('status', 'diajukan');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('replenishment_id', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"))
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'like', "%{$search}%"));
            });
        }

        $allowedSorts = ['id', 'replenishment_id', 'quantity', 'urgency', 'created_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getForPurchasing(string $search = '', int $perPage = 10, string $sortField = 'created_at', string $sortOrder = 'desc'): LengthAwarePaginator
    {
        $query = StockReplenishment::with(['product.category', 'requester', 'approvedByAdmin'])
            ->where('status', 'disetujui_admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('replenishment_id', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"))
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'like', "%{$search}%"));
            });
        }

        $allowedSorts = ['id', 'replenishment_id', 'quantity', 'urgency', 'created_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getForBarangMasuk(string $search = '', int $perPage = 10, string $sortField = 'created_at', string $sortOrder = 'desc'): LengthAwarePaginator
    {
        $query = StockReplenishment::with(['product.category', 'requester', 'approvedByAdmin', 'approvedByPurchasing'])
            ->where('status', 'disetujui_purchasing');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('replenishment_id', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"))
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'like', "%{$search}%"));
            });
        }

        $allowedSorts = ['id', 'replenishment_id', 'quantity', 'urgency', 'created_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getForBarangMasukItems(): Collection
    {
        return StockReplenishment::with(['product.category', 'requester', 'approvedByPurchasing'])
            ->where('status', 'disetujui_purchasing')
            ->orderByDesc('created_at')
            ->get();
    }

    public function approveByAdmin(int $id): StockReplenishment
    {
        $item = StockReplenishment::findOrFail($id);
        $item->update([
            'status' => 'disetujui_admin',
            'approved_by_admin' => auth()->id() ?? 1,
            'approved_at_admin' => now(),
        ]);
        return $item->fresh(['product', 'requester']);
    }

    public function rejectByAdmin(int $id, string $reason): StockReplenishment
    {
        $item = StockReplenishment::findOrFail($id);
        $item->update([
            'status' => 'ditolak_admin',
            'rejected_by_admin' => auth()->id() ?? 1,
            'rejected_at_admin' => now(),
            'rejection_reason_admin' => $reason,
        ]);
        return $item->fresh(['product', 'requester']);
    }

    public function approveByPurchasing(int $id): StockReplenishment
    {
        $item = StockReplenishment::findOrFail($id);
        $item->update([
            'status' => 'disetujui_purchasing',
            'approved_by_purchasing' => auth()->id() ?? 1,
            'approved_at_purchasing' => now(),
        ]);
        return $item->fresh(['product', 'requester', 'approvedByAdmin']);
    }

    public function rejectByPurchasing(int $id, string $reason): StockReplenishment
    {
        $item = StockReplenishment::findOrFail($id);
        $item->update([
            'status' => 'ditolak_purchasing',
            'rejected_by_purchasing' => auth()->id() ?? 1,
            'rejected_at_purchasing' => now(),
            'rejection_reason_purchasing' => $reason,
        ]);
        return $item->fresh(['product', 'requester', 'approvedByAdmin']);
    }

    public function receive(int $id, array $data): StockReplenishment
    {
        return DB::transaction(function () use ($id, $data) {
            $item = StockReplenishment::findOrFail($id);

            $item->update([
                'status' => 'selesai',
                'received_at' => now(),
            ]);

            return $item->fresh(['product', 'requester', 'approvedByAdmin', 'approvedByPurchasing']);
        });
    }
}
