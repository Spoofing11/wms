<?php

namespace App\Http\Controllers\Api\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Transaction\StoreOutgoingTransactionRequest;
use App\Http\Requests\Api\Transaction\UpdateOutgoingTransactionRequest;
use App\Http\Resources\Api\Transaction\OutgoingTransactionResource;
use App\Http\Resources\Api\Transaction\OutgoingTransactionCollection;
use App\Services\Transaction\OutgoingTransactionService;
use Illuminate\Http\JsonResponse;

class OutgoingTransactionController extends Controller
{
    protected OutgoingTransactionService $service;

    public function __construct(OutgoingTransactionService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $transactions = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            productId: request('product_id'),
        );

        return new OutgoingTransactionCollection($transactions);
    }

    public function store(StoreOutgoingTransactionRequest $request): JsonResponse
    {
        $transaction = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Transaksi barang keluar berhasil ditambahkan.',
            'data' => new OutgoingTransactionResource($transaction->load(['product.category', 'user', 'project'])),
        ], 201);
    }

    public function show($id)
    {
        $transaction = $this->service->getById($id);

        return new OutgoingTransactionResource($transaction);
    }

    public function update(UpdateOutgoingTransactionRequest $request, $id): JsonResponse
    {
        $transaction = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Transaksi barang keluar berhasil diperbarui.',
            'data' => new OutgoingTransactionResource($transaction),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Transaksi barang keluar berhasil dihapus.',
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
            'message' => "$deleted transaksi barang keluar berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $transactions = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new OutgoingTransactionCollection($transactions);
    }

    public function restore($id): JsonResponse
    {
        $transaction = $this->service->restore($id);

        return response()->json([
            'message' => 'Transaksi barang keluar berhasil dipulihkan.',
            'data' => new OutgoingTransactionResource($transaction),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Transaksi barang keluar berhasil dihapus permanen.',
        ]);
    }
}
