<?php

namespace App\Http\Controllers\Api\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Transaction\StoreStockAdjustmentRequest;
use App\Http\Requests\Api\Transaction\UpdateStockAdjustmentRequest;
use App\Http\Resources\Api\Transaction\StockAdjustmentResource;
use App\Http\Resources\Api\Transaction\StockAdjustmentCollection;
use App\Services\Transaction\StockAdjustmentService;
use Illuminate\Http\JsonResponse;

class StockAdjustmentController extends Controller
{
    protected StockAdjustmentService $service;

    public function __construct(StockAdjustmentService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $adjustments = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            productId: request('product_id'),
        );

        return new StockAdjustmentCollection($adjustments);
    }

    public function store(StoreStockAdjustmentRequest $request): JsonResponse
    {
        $adjustment = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Penyesuaian stock berhasil ditambahkan.',
            'data' => new StockAdjustmentResource($adjustment->load(['product.category', 'user'])),
        ], 201);
    }

    public function show($id)
    {
        $adjustment = $this->service->getById($id);

        return new StockAdjustmentResource($adjustment);
    }

    public function update(UpdateStockAdjustmentRequest $request, $id): JsonResponse
    {
        $adjustment = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Penyesuaian stock berhasil diperbarui.',
            'data' => new StockAdjustmentResource($adjustment),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Penyesuaian stock berhasil dihapus.',
        ]);
    }

    public function bulkDelete(): JsonResponse
    {
        $ids = request()->validate(['ids' => 'required|array'])['ids'];
        $deleted = 0;

        foreach ($ids as $id) {
            try {
                $this->service->delete($id);
                $deleted++;
            } catch (\Exception $e) {
                continue;
            }
        }

        return response()->json([
            'message' => "$deleted penyesuaian stock berhasil dihapus.",
        ]);
    }
}
