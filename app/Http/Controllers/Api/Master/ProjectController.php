<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Master\StoreProjectRequest;
use App\Http\Requests\Api\Master\UpdateProjectRequest;
use App\Http\Resources\Api\Master\ProjectResource;
use App\Http\Resources\Api\Master\ProjectCollection;
use App\Services\Master\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    protected ProjectService $service;

    public function __construct(ProjectService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $projects = $this->service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new ProjectCollection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Proyek berhasil ditambahkan.',
            'data' => new ProjectResource($project),
        ], 201);
    }

    public function show($id)
    {
        $project = $this->service->getById($id);

        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, $id): JsonResponse
    {
        $project = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Proyek berhasil diperbarui.',
            'data' => new ProjectResource($project),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Proyek berhasil dihapus.',
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
            'message' => "$deleted proyek berhasil dihapus.",
        ]);
    }

    public function trashed()
    {
        $projects = $this->service->getTrashed(
            search: request('search', ''),
            sortField: request('sort_field', 'deleted_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );

        return new ProjectCollection($projects);
    }

    public function restore($id): JsonResponse
    {
        $project = $this->service->restore($id);

        return response()->json([
            'message' => 'Proyek berhasil dipulihkan.',
            'data' => new ProjectResource($project),
        ]);
    }

    public function forceDelete($id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Proyek berhasil dihapus permanen.',
        ]);
    }
}
