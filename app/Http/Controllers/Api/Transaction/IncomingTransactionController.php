<?php

namespace App\Http\Controllers\Api\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Transaction\StoreIncomingTransactionRequest;
use App\Http\Requests\Api\Transaction\UpdateIncomingTransactionRequest;
use App\Http\Resources\Api\Transaction\IncomingTransactionResource;
use App\Http\Resources\Api\Transaction\IncomingTransactionCollection;
use App\Services\Transaction\IncomingTransactionService;
use Illuminate\Http\JsonResponse;

class IncomingTransactionController extends Controller
{
    protected IncomingTransactionService $service;

    public function __construct(IncomingTransactionService $service)
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

        return new IncomingTransactionCollection($transactions);
    }

    public function store(StoreIncomingTransactionRequest $request): JsonResponse
    {
        $transaction = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Transaksi barang masuk berhasil ditambahkan.',
            'data' => new IncomingTransactionResource($transaction->load(['product.category', 'purchaseSource', 'user'])),
        ], 201);
    }

    public function show($id)
    {
        $transaction = $this->service->getById($id);

        return new IncomingTransactionResource($transaction);
    }

    public function update(UpdateIncomingTransactionRequest $request, $id): JsonResponse
    {
        $transaction = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Transaksi barang masuk berhasil diperbarui.',
            'data' => new IncomingTransactionResource($transaction),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Transaksi barang masuk berhasil dihapus.',
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
            'message' => "$deleted transaksi barang masuk berhasil dihapus.",
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

        return new IncomingTransactionCollection($transactions);
    }

    public function restore($id): JsonResponse
    {
        $transaction = $this->service->restore($id);

        return response()->json([
            'message' => 'Transaksi barang masuk berhasil dipulihkan.',
            'data' => new IncomingTransactionResource($transaction),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Transaksi barang masuk berhasil dihapus permanen.',
        ]);
    }
}
