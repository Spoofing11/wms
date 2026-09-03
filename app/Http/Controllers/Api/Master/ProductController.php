<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Master\StoreProductRequest;
use App\Http\Requests\Api\Master\UpdateProductRequest;
use App\Http\Resources\Api\Master\ProductResource;
use App\Http\Resources\Api\Master\ProductCollection;
use App\Services\Master\ProductService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    protected ProductService $service;

    public function __construct(ProductService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $products = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            categoryId: request('category_id'),
        );

        return new ProductCollection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->service->create(
            $request->validated(),
            $request->file('image'),
        );

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => new ProductResource($product->load(['category', 'purchaseSource', 'location'])),
        ], 201);
    }

    public function show($id)
    {
        $product = $this->service->getById($id);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $product = $this->service->update(
            $id,
            $request->validated(),
            $request->file('image'),
        );

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => new ProductResource($product),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
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
            'message' => "$deleted produk berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $products = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            categoryId: request('category_id'),
        );

        return new ProductCollection($products);
    }

    public function restore($id): JsonResponse
    {
        $product = $this->service->restore($id);

        return response()->json([
            'message' => 'Produk berhasil dipulihkan.',
            'data' => new ProductResource($product->load(['category', 'purchaseSource', 'location'])),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Produk berhasil dihapus permanen.',
        ]);
    }
}
