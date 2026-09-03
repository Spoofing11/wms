<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Master\StoreCategoryRequest;
use App\Http\Requests\Api\Master\UpdateCategoryRequest;
use App\Http\Resources\Api\Master\CategoryResource;
use App\Http\Resources\Api\Master\CategoryCollection;
use App\Services\Master\CategoryService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    protected CategoryService $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $categories = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new CategoryCollection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function show($id)
    {
        $category = $this->service->getById($id);

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, $id): JsonResponse
    {
        $category = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
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
            'message' => "$deleted kategori berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $categories = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new CategoryCollection($categories);
    }

    public function restore($id): JsonResponse
    {
        $category = $this->service->restore($id);

        return response()->json([
            'message' => 'Kategori berhasil dipulihkan.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Kategori berhasil dihapus permanen.',
        ]);
    }
}
