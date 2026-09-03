<?php

namespace App\Http\Controllers\Api\Operational;

use App\Http\Controllers\Controller;
use App\Services\Operational\PurchasingService;
use Illuminate\Http\JsonResponse;

class PurchasingController extends Controller
{
    protected PurchasingService $service;

    public function __construct(PurchasingService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $paginator = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            tab: request('tab'),
        );

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $purchaseRequest = $this->service->getById($id);

        return response()->json(['data' => $purchaseRequest]);
    }

    public function approve($id): JsonResponse
    {
        try {
            $purchaseRequest = $this->service->approve($id);

            return response()->json([
                'message' => 'Permintaan pembelian berhasil disetujui.',
                'data' => $purchaseRequest,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject($id): JsonResponse
    {
        try {
            $reason = request('rejection_reason');
            $purchaseRequest = $this->service->reject($id, $reason);

            return response()->json([
                'message' => 'Permintaan pembelian berhasil ditolak.',
                'data' => $purchaseRequest,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
