<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Master\StorePurchaseSourceRequest;
use App\Http\Requests\Api\Master\UpdatePurchaseSourceRequest;
use App\Http\Resources\Api\Master\PurchaseSourceResource;
use App\Http\Resources\Api\Master\PurchaseSourceCollection;
use App\Services\Master\PurchaseSourceService;
use Illuminate\Http\JsonResponse;

class PurchaseSourceController extends Controller
{
    protected PurchaseSourceService $service;

    public function __construct(PurchaseSourceService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $purchaseSources = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new PurchaseSourceCollection($purchaseSources);
    }

    public function store(StorePurchaseSourceRequest $request): JsonResponse
    {
        $purchaseSource = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Sumber pembelian berhasil ditambahkan.',
            'data' => new PurchaseSourceResource($purchaseSource),
        ], 201);
    }

    public function show($id)
    {
        $purchaseSource = $this->service->getById($id);

        return new PurchaseSourceResource($purchaseSource);
    }

    public function update(UpdatePurchaseSourceRequest $request, $id): JsonResponse
    {
        $purchaseSource = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Sumber pembelian berhasil diperbarui.',
            'data' => new PurchaseSourceResource($purchaseSource),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Sumber pembelian berhasil dihapus.',
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
            'message' => "$deleted sumber pembelian berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $purchaseSources = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new PurchaseSourceCollection($purchaseSources);
    }

    public function restore($id): JsonResponse
    {
        $purchaseSource = $this->service->restore($id);

        return response()->json([
            'message' => 'Sumber pembelian berhasil dipulihkan.',
            'data' => new PurchaseSourceResource($purchaseSource),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Sumber pembelian berhasil dihapus permanen.',
        ]);
    }
}
