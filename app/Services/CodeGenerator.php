<?php

namespace App\Services;

use App\Models\Product;
use App\Models\IncomingTransaction;
use App\Models\OutgoingTransaction;
use App\Models\MaterialRequest;
use App\Models\PurchaseRequest;
use App\Models\StockReplenishment;
use Illuminate\Support\Facades\DB;

class CodeGenerator
{
    public function generateProductSku(string $categoryCode): string
    {
        $lastProduct = Product::where('sku', 'like', "{$categoryCode}-%")
            ->orderByRaw("CAST(SUBSTRING(sku, LOCATE('-', sku) + 1) AS UNSIGNED) DESC")
            ->first();

        if ($lastProduct) {
            $lastNumber = (int) substr($lastProduct->sku, strpos($lastProduct->sku, '-') + 1);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $categoryCode . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generateSequenceNumber(string $categoryCode): int
    {
        $lastProduct = Product::where('sku', 'like', "{$categoryCode}-%")
            ->orderByRaw("CAST(SUBSTRING(sku, LOCATE('-', sku) + 1) AS UNSIGNED) DESC")
            ->first();

        if ($lastProduct) {
            return (int) substr($lastProduct->sku, strpos($lastProduct->sku, '-') + 1) + 1;
        }

        return 1;
    }

    public function generateIncomingCode(): string
    {
        $last = IncomingTransaction::withTrashed()->where('transaction_id', 'like', 'CMP-IN-%')
            ->orderByRaw("CAST(SUBSTRING(transaction_id, 8) AS UNSIGNED) DESC")
            ->first();

        if ($last) {
            $lastNumber = (int) substr($last->transaction_id, 7);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return 'CMP-IN-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generateOutgoingCode(): string
    {
        $last = OutgoingTransaction::withTrashed()->where('transaction_id', 'like', 'CMP-OUT-%')
            ->orderByRaw("CAST(SUBSTRING(transaction_id, 9) AS UNSIGNED) DESC")
            ->first();

        if ($last) {
            $lastNumber = (int) substr($last->transaction_id, 8);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return 'CMP-OUT-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generateMaterialRequestCode(): string
    {
        $last = MaterialRequest::where('id', '>', 0)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $last ? $last->id + 1 : 1;

        return 'MR-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generatePurchaseRequestCode(): string
    {
        $last = PurchaseRequest::where('id', '>', 0)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $last ? $last->id + 1 : 1;

        return 'PR-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generateRestockCode(): string
    {
        $last = StockReplenishment::withTrashed()->where('replenishment_id', 'like', 'CMP-RS-%')
            ->orderByRaw("CAST(SUBSTRING(replenishment_id, 8) AS UNSIGNED) DESC")
            ->first();

        if ($last) {
            $lastNumber = (int) substr($last->replenishment_id, 7);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return 'CMP-RS-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
