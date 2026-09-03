<?php

namespace App\Services\Transaction;

use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StockOverviewService
{
    public function getStockOverview(
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?string $status = null,
        ?int $categoryId = null,
        ?string $search = null,
    ): Collection {
        $dateFrom = $dateFrom ? Carbon::parse($dateFrom)->startOfDay() : null;
        $dateTo = $dateTo ? Carbon::parse($dateTo)->endOfDay() : null;

        $products = Product::with(['category', 'location'])
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($search, fn ($q) => $q->where(function ($sq) use ($search) {
                $sq->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            }))
            ->get();

        $productIds = $products->pluck('id');

        if ($productIds->isEmpty()) {
            return collect();
        }

        // Bulk incoming sums
        $incomingQuery = DB::table('incoming_transactions')
            ->select('product_id', DB::raw('SUM(quantity) as total'))
            ->whereIn('product_id', $productIds)
            ->when($dateFrom, fn ($q) => $q->where('transaction_date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('transaction_date', '<=', $dateTo))
            ->groupBy('product_id');
        $incomingMap = $incomingQuery->pluck('total', 'product_id');

        // Bulk outgoing sums
        $outgoingQuery = DB::table('outgoing_transactions')
            ->select('product_id', DB::raw('SUM(quantity) as total'))
            ->whereIn('product_id', $productIds)
            ->when($dateFrom, fn ($q) => $q->where('transaction_date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('transaction_date', '<=', $dateTo))
            ->groupBy('product_id');
        $outgoingMap = $outgoingQuery->pluck('total', 'product_id');

        // Bulk adjustment changes
        $adjustmentQuery = DB::table('stock_adjustments')
            ->select('product_id', DB::raw('SUM(new_stock - old_stock) as total'))
            ->whereIn('product_id', $productIds)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo))
            ->groupBy('product_id');
        $adjustmentMap = $adjustmentQuery->pluck('total', 'product_id');

        return $products->map(function ($product) use ($incomingMap, $outgoingMap, $adjustmentMap) {
            $currentStock = $product->stock;
            $incomingTotal = (int) ($incomingMap->get($product->id) ?? 0);
            $outgoingTotal = (int) ($outgoingMap->get($product->id) ?? 0);
            $adjustmentChange = (int) ($adjustmentMap->get($product->id) ?? 0);

            $stockAwal = $currentStock - $incomingTotal + $outgoingTotal - $adjustmentChange;

            $statusLabel = 'aman';
            if ($product->min_stock > 0 && $currentStock <= $product->min_stock) {
                $statusLabel = 'rendah';
            }

            return [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'stock_awal' => $stockAwal,
                'barang_masuk' => $incomingTotal,
                'barang_keluar' => $outgoingTotal,
                'penyesuaian' => $adjustmentChange,
                'perubahan' => $incomingTotal - $outgoingTotal + $adjustmentChange,
                'stock_akhir' => $currentStock,
                'min_stock' => $product->min_stock,
                'status' => $statusLabel,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'code' => $product->category->code,
                    'name' => $product->category->name,
                ] : null,
                'location' => $product->location ? [
                    'id' => $product->location->id,
                    'name' => $product->location->name,
                ] : null,
            ];
        })->filter(function ($item) use ($status) {
            if ($status === 'aman') return $item['status'] === 'aman';
            if ($status === 'rendah') return $item['status'] === 'rendah';
            return true;
        })->values();
    }
}
