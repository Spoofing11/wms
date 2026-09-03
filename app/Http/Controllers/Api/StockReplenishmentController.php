<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Operational\StockReplenishmentService;
use App\Services\Transaction\IncomingTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockReplenishmentController extends Controller
{
    protected StockReplenishmentService $service;

    public function __construct(StockReplenishmentService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'urgency' => 'required|in:normal,urgent',
        ]);

        $item = $this->service->create($validated);

        return response()->json([
            'message' => 'Restock request berhasil dibuat.',
            'data' => $item->load('product'),
        ], 201);
    }

    public function getForAdminProyek(): JsonResponse
    {
        $paginator = $this->service->getForAdminProyek(
            search: request('search', ''),
            perPage: request('per_page', 10),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
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

    public function approveByAdmin(int $id): JsonResponse
    {
        $item = $this->service->approveByAdmin($id);
        return response()->json([
            'message' => 'Restock berhasil disetujui Admin Proyek.',
            'data' => $item,
        ]);
    }

    public function rejectByAdmin(int $id, Request $request): JsonResponse
    {
        $request->validate(['rejection_reason' => 'required|string']);

        $item = $this->service->rejectByAdmin($id, $request->input('rejection_reason'));
        return response()->json([
            'message' => 'Restock ditolak Admin Proyek.',
            'data' => $item,
        ]);
    }

    public function getForPurchasing(): JsonResponse
    {
        $paginator = $this->service->getForPurchasing(
            search: request('search', ''),
            perPage: request('per_page', 10),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
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

    public function approveByPurchasing(int $id): JsonResponse
    {
        $item = $this->service->approveByPurchasing($id);
        return response()->json([
            'message' => 'Restock berhasil disetujui Purchasing.',
            'data' => $item,
        ]);
    }

    public function rejectByPurchasing(int $id, Request $request): JsonResponse
    {
        $request->validate(['rejection_reason' => 'required|string']);

        $item = $this->service->rejectByPurchasing($id, $request->input('rejection_reason'));
        return response()->json([
            'message' => 'Restock ditolak Purchasing.',
            'data' => $item,
        ]);
    }

    public function getForBarangMasuk(): JsonResponse
    {
        $paginator = $this->service->getForBarangMasuk(
            search: request('search', ''),
            perPage: request('per_page', 10),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
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

    public function receive(int $id, Request $request, IncomingTransactionService $incomingService): JsonResponse
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_source_id' => 'nullable|exists:purchase_sources,id',
            'notes' => 'nullable|string',
        ]);

        $replenishment = \App\Models\StockReplenishment::findOrFail($id);

        $transaction = $incomingService->create([
            'product_id' => $replenishment->product_id,
            'quantity' => $replenishment->quantity,
            'transaction_date' => $validated['transaction_date'],
            'purchase_price' => $validated['purchase_price'] ?? 0,
            'purchase_source_id' => $validated['purchase_source_id'] ?? null,
            'notes' => $validated['notes'] ?? 'Restock dari stock replenishment ' . $replenishment->replenishment_id,
            'stock_replenishment_id' => $id,
        ]);

        $replenishment->refresh();

        return response()->json([
            'message' => 'Barang masuk restock berhasil diterima. Stock bertambah.',
            'data' => [
                'replenishment' => $replenishment->load('product'),
                'transaction' => $transaction,
            ],
        ]);
    }
}
