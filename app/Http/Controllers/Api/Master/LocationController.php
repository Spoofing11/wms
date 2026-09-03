<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Master\StoreLocationRequest;
use App\Http\Requests\Api\Master\UpdateLocationRequest;
use App\Http\Resources\Api\Master\LocationResource;
use App\Http\Resources\Api\Master\LocationCollection;
use App\Services\Master\LocationService;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    protected LocationService $service;

    public function __construct(LocationService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $locations = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new LocationCollection($locations);
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Lokasi berhasil ditambahkan.',
            'data' => new LocationResource($location),
        ], 201);
    }

    public function show($id)
    {
        $location = $this->service->getById($id);

        return new LocationResource($location);
    }

    public function update(UpdateLocationRequest $request, $id): JsonResponse
    {
        $location = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Lokasi berhasil diperbarui.',
            'data' => new LocationResource($location),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Lokasi berhasil dihapus.',
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
            'message' => "$deleted lokasi berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $locations = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new LocationCollection($locations);
    }

    public function restore($id): JsonResponse
    {
        $location = $this->service->restore($id);

        return response()->json([
            'message' => 'Lokasi berhasil dipulihkan.',
            'data' => new LocationResource($location),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Lokasi berhasil dihapus permanen.',
        ]);
    }
}
