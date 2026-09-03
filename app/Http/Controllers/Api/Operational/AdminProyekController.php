<?php

namespace App\Http\Controllers\Api\Operational;

use App\Http\Controllers\Controller;
use App\Services\Operational\AdminProyekService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminProyekController extends Controller
{
    protected AdminProyekService $service;

    public function __construct(AdminProyekService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $paginator = $this->service->getPendingReview(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
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

    public function approve($id): JsonResponse
    {
        try {
            $materialRequest = $this->service->approve($id);

            return response()->json([
                'message' => 'Material Request berhasil di-approve. Item akan diproses sesuai stock.',
                'data' => $materialRequest,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject($id): JsonResponse
    {
        try {
            $reason = request('rejection_reason');
            $materialRequest = $this->service->reject($id, $reason);

            return response()->json([
                'message' => 'Material Request berhasil ditolak.',
                'data' => $materialRequest,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function updateItem($itemId): JsonResponse
    {
        try {
            $data = request()->all();

            // Handle photo upload if present
            if (request()->hasFile('photo')) {
                $photoPath = request()->file('photo')->store('mr-photos', 'public');
                $data['photo'] = $photoPath;
            }

            $item = $this->service->updateItem($itemId, $data);

            return response()->json([
                'message' => 'Item berhasil diperbarui.',
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
