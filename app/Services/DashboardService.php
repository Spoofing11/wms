<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\IncomingTransaction;
use App\Models\OutgoingTransaction;
use App\Models\InventoryLog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        $today = Carbon::today();

        return [
            'total_products' => Product::count(),
            'total_user' => User::count(),
            'incoming_today' => IncomingTransaction::whereDate('created_at', $today)->count(),
            'outgoing_today' => OutgoingTransaction::whereDate('created_at', $today)->count(),
        ];
    }

    public function getTransactionsChart(string $period = 'daily'): array
    {
        $query = DB::table('incoming_transactions')
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("COUNT(*) as incoming"),
                DB::raw("0 as outgoing")
            )
            ->where('created_at', '>=', $this->getStartDate($period))
            ->groupBy('date')
            ->unionAll(
                DB::table('outgoing_transactions')
                    ->select(
                        DB::raw("DATE(created_at) as date"),
                        DB::raw("0 as incoming"),
                        DB::raw("COUNT(*) as outgoing")
                    )
                    ->where('created_at', '>=', $this->getStartDate($period))
                    ->groupBy('date')
            );

        $results = DB::table(DB::raw("({$query->toSql()}) as combined"))
            ->mergeBindings($query)
            ->select(
                'date',
                DB::raw("SUM(incoming) as incoming"),
                DB::raw("SUM(outgoing) as outgoing")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $results->map(fn ($row) => [
            'date' => $row->date,
            'incoming' => (int) $row->incoming,
            'outgoing' => (int) $row->outgoing,
        ])->toArray();
    }

    public function getStockChart(string $period = 'daily'): array
    {
        $results = InventoryLog::select(
            DB::raw("DATE(created_at) as date"),
            DB::raw("SUM(quantity_after) as total_stock")
        )
        ->where('created_at', '>=', $this->getStartDate($period))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return $results->map(fn ($row) => [
            'date' => $row->date,
            'total_stock' => (int) $row->total_stock,
        ])->toArray();
    }

    public function getRecentMRs(): array
    {
        return MaterialRequest::with('project')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($mr) => [
                'id' => $mr->id,
                'request_date' => $mr->request_date?->format('d M Y'),
                'requester_name' => $mr->requester_name,
                'division' => $mr->division,
                'status' => $mr->status,
                'urgency' => $mr->urgency,
                'project_name' => $mr->project?->name,
                'items_count' => $mr->items()->count(),
            ])
            ->toArray();
    }

    public function getPendingApprovals(): array
    {
        return MaterialRequestItem::with(['materialRequest.project', 'product'])
            ->whereIn('status', ['disetujui', 'diajukan'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product?->name ?? $item->new_item_name,
                'quantity' => $item->quantity_requested,
                'status' => $item->status,
                'requester_name' => $item->materialRequest?->requester_name,
                'project_name' => $item->materialRequest?->project?->name,
                'division' => $item->materialRequest?->division,
            ])
            ->toArray();
    }

    public function getLowStockProducts(): array
    {
        return Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'stock' => $p->stock,
                'min_stock' => $p->min_stock,
                'category_name' => $p->category?->name,
            ])
            ->toArray();
    }

    private function getStartDate(string $period): Carbon
    {
        return match ($period) {
            'weekly' => now()->subWeeks(6)->startOfWeek(),
            'monthly' => now()->subMonths(5)->startOfMonth(),
            default => now()->subDays(13)->startOfDay(),
        };
    }
}
