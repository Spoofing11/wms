<?php

namespace App\Services\Master;

use App\Models\Product;
use App\Services\CodeGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    protected CodeGenerator $codeGenerator;

    public function __construct(CodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    public function getPaginated(string $search = '', string $sortField = 'created_at', string $sortOrder = 'desc', int $perPage = 10, ?int $categoryId = null): LengthAwarePaginator
    {
        $query = Product::with(['category', 'purchaseSource', 'location']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('location', fn ($lq) => $lq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $allowedSorts = ['id', 'sku', 'name', 'stock', 'min_stock', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getById(int $id): Product
    {
        return Product::with(['category', 'purchaseSource', 'location'])->findOrFail($id);
    }

    public function getAll()
    {
        return Product::orderBy('name')->get();
    }

    public function create(array $data, ?UploadedFile $image = null): Product
    {
        $category = \App\Models\Category::findOrFail($data['category_id']);

        $sku = $this->codeGenerator->generateProductSku($category->code);
        $sequenceNumber = $this->codeGenerator->generateSequenceNumber($category->code);

        $data['sku'] = $sku;
        $data['sequence_number'] = $sequenceNumber;

        if ($image) {
            $data['image'] = $image->store('products', 'public');
        }

        $product = Product::create($data);

        if (!empty($data['purchase_request_id'])) {
            $purchaseRequest = \App\Models\PurchaseRequest::find($data['purchase_request_id']);
            if ($purchaseRequest) {
                $purchaseRequest->update([
                    'product_id' => $product->id,
                ]);

                if ($purchaseRequest->materialRequestItem) {
                    $purchaseRequest->materialRequestItem->update([
                        'product_id' => $product->id,
                    ]);
                }
            }
        }

        return $product;
    }

    public function update(int $id, array $data, ?UploadedFile $image = null): Product
    {
        $product = Product::findOrFail($id);

        if (isset($data['category_id']) && $data['category_id'] != $product->category_id) {
            $category = \App\Models\Category::findOrFail($data['category_id']);
            $data['sku'] = $this->codeGenerator->generateProductSku($category->code);
            $data['sequence_number'] = $this->codeGenerator->generateSequenceNumber($category->code);
        }

        if ($image) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $image->store('products', 'public');
        }

        $product->update($data);

        return $product->fresh(['category', 'purchaseSource', 'location']);
    }

    public function delete(int $id): bool
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        return $product->delete();
    }

    public function getTrashed(string $search = '', string $sortField = 'deleted_at', string $sortOrder = 'desc', int $perPage = 10, ?int $categoryId = null): LengthAwarePaginator
    {
        $query = Product::onlyTrashed()->with(['category', 'purchaseSource', 'location']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('location', fn ($lq) => $lq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $allowedSorts = ['id', 'sku', 'name', 'deleted_at'];
        $sortField = in_array($sortField, $allowedSorts) ? $sortField : 'deleted_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    public function restore(int $id): Product
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();
        return $product->fresh(['category', 'purchaseSource', 'location']);
    }

    public function forceDelete(int $id): bool
    {
        $product = Product::onlyTrashed()->findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        return $product->forceDelete();
    }
}
