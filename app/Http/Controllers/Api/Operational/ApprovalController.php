<?php

namespace App\Http\Controllers\Api\Operational;

use App\Http\Controllers\Controller;
use App\Models\MaterialRequestItem;
use App\Services\Operational\ApprovalService;
use App\Services\Operational\ThermalPrintService;
use App\Services\Operational\ZebraPrintService;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class ApprovalController extends Controller
{
    protected ApprovalService $service;
    protected ThermalPrintService $thermalPrintService;
    protected ZebraPrintService $zebraPrintService;

    public function __construct(ApprovalService $service, ThermalPrintService $thermalPrintService, ZebraPrintService $zebraPrintService)
    {
        $this->service = $service;
        $this->thermalPrintService = $thermalPrintService;
        $this->zebraPrintService = $zebraPrintService;
    }

    public function index()
    {
        $paginator = $this->service->getPendingItems(
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

    public function approveStep1($itemId): JsonResponse
    {
        try {
            $item = $this->service->approveStep1($itemId);

            return response()->json([
                'message' => 'Item berhasil di-approve (Step 1).',
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function approveStep2($itemId): JsonResponse
    {
        try {
            $photoPath = null;

            if (request()->hasFile('photo')) {
                $photoPath = request()->file('photo')->store('approval-photos', 'public');
            }

            $result = $this->service->approveStep2($itemId, $photoPath);

            return response()->json([
                'message' => 'Item berhasil di-approve. Barang Keluar otomatis dibuat.',
                'data' => $result['item'],
                'transaction_id' => $result['transaction_id'],
                'mr_code' => $result['mr_code'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject($itemId): JsonResponse
    {
        try {
            $reason = request('rejection_reason');
            $item = $this->service->reject($itemId, $reason);

            return response()->json([
                'message' => 'Item berhasil ditolak.',
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function printData($itemId): JsonResponse
    {
        try {
            $item = MaterialRequestItem::with([
                'materialRequest.project',
                'materialRequest.requester',
                'materialRequest.items.product',
                'outgoingTransaction',
                'product',
            ])->findOrFail($itemId);

            $base64Data = $this->thermalPrintService->generatePrintData($item);

            return response()->json([
                'data' => $base64Data,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function printZebra($itemId): JsonResponse
    {
        try {
            $item = MaterialRequestItem::with([
                'materialRequest.project',
                'materialRequest.requester',
                'materialRequest.items.product',
                'outgoingTransaction',
                'product',
            ])->findOrFail($itemId);

            $base64Data = $this->zebraPrintService->generatePrintData($item);

            return response()->json([
                'data' => $base64Data,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function printPdf($id)
    {
        $item = MaterialRequestItem::with([
            'materialRequest.project',
            'materialRequest.items.product',
            'outgoingTransaction',
        ])->findOrFail($id);

        $mr = $item->materialRequest;
        $itemCount = $mr->items->count();
        $hasNotes = !empty($item->notes) || !empty($mr->notes);

        $baseHeight = 80;
        $itemHeight = 7 * $itemCount;
        $notesHeight = $hasNotes ? 10 : 0;
        $totalHeightMm = $baseHeight + $itemHeight + $notesHeight;

        $widthPt = 204.1;
        $heightPt = $totalHeightMm * (72 / 25.4);

        $logoBase64 = $this->getLogoBase64();

        $pdf = Pdf::loadView('pdf.approval-receipt', [
            'item' => $item,
            'logoBase64' => $logoBase64,
        ]);
        $pdf->setPaper([0, 0, $widthPt, $heightPt], 'portrait');

        return $pdf->stream('approval-receipt.pdf');
    }

    private function getLogoBase64(): string
    {
        $webpPath = public_path('images/Login/Composite-Logo-Peanut.webp');
        $pngPath = public_path('images/Login/Composite-Logo-Peanut.png');

        $path = file_exists($webpPath) ? $webpPath : ($pngPath);
        if (!$path || !file_exists($path)) {
            return '';
        }

        $img = @imagecreatefromwebp($path) ?: @imagecreatefrompng($path);
        if (!$img) {
            return '';
        }

        $targetWidth = 150;
        $origWidth = imagesx($img);
        $origHeight = imagesy($img);
        $targetHeight = (int) round($origHeight * ($targetWidth / $origWidth));

        $resized = imagecreatetruecolor($targetWidth, $targetHeight);
        $white = imagecolorallocate($resized, 255, 255, 255);
        imagefill($resized, 0, 0, $white);
        imagecopyresampled($resized, $img, 0, 0, 0, 0, $targetWidth, $targetHeight, $origWidth, $origHeight);

        ob_start();
        imagejpeg($resized, null, 85);
        $jpegData = ob_get_clean();

        imagedestroy($img);
        imagedestroy($resized);

        return 'data:image/jpeg;base64,' . base64_encode($jpegData);
    }
}