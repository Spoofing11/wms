<?php

namespace App\Http\Controllers\Api\Operational;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Operational\StoreMaterialRequestRequest;
use App\Http\Requests\Api\Operational\UpdateMaterialRequestRequest;
use App\Services\Operational\MaterialRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MaterialRequestController extends Controller
{
    protected MaterialRequestService $service;

    public function __construct(MaterialRequestService $service)
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
        $materialRequest = $this->service->getById($id);

        return response()->json(['data' => $materialRequest]);
    }

    public function store(StoreMaterialRequestRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $index => &$itemData) {
                $photoKey = "items.{$index}.photo";
                if ($request->hasFile($photoKey)) {
                    $path = $request->file($photoKey)->store('mr-photos', 'public');
                    $itemData['photo'] = $path;
                }
            }
        }

        $materialRequest = $this->service->create($data);

        return response()->json([
            'message' => 'Material Request berhasil dibuat.',
            'data' => $materialRequest,
        ], 201);
    }

    public function update(UpdateMaterialRequestRequest $request, $id): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $index => &$itemData) {
                $photoKey = "items.{$index}.photo";
                if ($request->hasFile($photoKey)) {
                    $path = $request->file($photoKey)->store('mr-photos', 'public');
                    $itemData['photo'] = $path;
                }
            }
        }

        $materialRequest = $this->service->update($id, $data);

        return response()->json([
            'message' => 'Material Request berhasil diperbarui.',
            'data' => $materialRequest,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Material Request berhasil dihapus.',
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
            'message' => "$deleted material request berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $paginator = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
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

    public function restore($id): JsonResponse
    {
        $materialRequest = $this->service->restore($id);

        return response()->json([
            'message' => 'Material Request berhasil dipulihkan.',
            'data' => $materialRequest,
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Material Request berhasil dihapus permanen.',
        ]);
    }

    public function printSingle($id)
    {
        $materialRequest = \App\Models\MaterialRequest::with(['project', 'requester', 'creator', 'items.product.category'])->findOrFail($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.material-request', [
            'materialRequests' => collect([$materialRequest]),
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('permintaan-bahan-' . $materialRequest->id . '.pdf');
    }
}
