<?php

use App\Http\Controllers\ProfileController;
use App\Services\Master\CategoryService;
use App\Services\Master\LocationService;
use App\Services\Master\PurchaseSourceService;
use App\Services\Master\ProjectService;
use App\Services\Master\ProductService;
use App\Services\Transaction\IncomingTransactionService;
use App\Services\Transaction\OutgoingTransactionService;
use App\Services\Transaction\StockAdjustmentService;
use App\Services\Transaction\StockOverviewService;
use App\Services\Operational\MaterialRequestService;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/dashboard', function (\App\Services\DashboardService $service) {
    return Inertia::render('Dashboard', [
        'stats' => $service->getStats(),
        'transactionsChart' => $service->getTransactionsChart(request('period', 'daily')),
        'stockChart' => $service->getStockChart(request('period', 'daily')),
        'recentMRs' => $service->getRecentMRs(),
        'pendingApprovals' => $service->getPendingApprovals(),
        'lowStockProducts' => $service->getLowStockProducts(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// paginateForInertia() moved to app/helpers.php

// Master Data
Route::middleware(['auth', 'verified'])->prefix('master')->name('master.')->group(function () {
    Route::get('/categories', function (CategoryService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Master/Categories/Index', [
            'categories' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
                'products_count' => $item->products_count ?? 0,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
        ]);
    })->name('categories.index');

    Route::get('/locations', function (LocationService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Master/Locations/Index', [
            'locations' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'products_count' => $item->products_count ?? 0,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
        ]);
    })->name('locations.index');

    Route::get('/purchase-sources', function (PurchaseSourceService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Master/PurchaseSources/Index', [
            'purchaseSources' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'source_type' => $item->source_type,
                'notes' => $item->notes,
                'products_count' => $item->products_count ?? 0,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
        ]);
    })->name('purchase-sources.index');

    Route::get('/projects', function (ProjectService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Master/Projects/Index', [
            'projects' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'address' => $item->address,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
        ]);
    })->name('projects.index');

    Route::get('/products', function (ProductService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            categoryId: request('category_id'),
        );
        return Inertia::render('Master/Products/Index', [
            'products' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'sequence_number' => $item->sequence_number,
                'category_id' => $item->category_id,
                'purchase_source_id' => $item->purchase_source_id,
                'location_id' => $item->location_id,
                'sku' => $item->sku,
                'name' => $item->name,
                'stock' => $item->stock,
                'min_stock' => $item->min_stock,
                'image' => $item->image,
                'image_url' => $item->image ? asset("storage/{$item->image}") : null,
                'price' => $item->price,
                'average_cost' => $item->average_cost,
                'category' => $item->relationLoaded('category') && $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                    'code' => $item->category->code,
                ] : null,
                'purchase_source' => $item->relationLoaded('purchaseSource') && $item->purchaseSource ? [
                    'id' => $item->purchaseSource->id,
                    'name' => $item->purchaseSource->name,
                    'source_type' => $item->purchaseSource->source_type,
                ] : null,
                'location' => $item->relationLoaded('location') && $item->location ? [
                    'id' => $item->location->id,
                    'name' => $item->location->name,
                ] : null,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
            'categories' => app(CategoryService::class)->getAll()->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
            ])->values()->all(),
            'purchaseSources' => app(PurchaseSourceService::class)->getAll()->map(fn ($ps) => [
                'id' => $ps->id,
                'name' => $ps->name,
                'source_type' => $ps->source_type,
            ])->values()->all(),
            'locations' => app(LocationService::class)->getAll()->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
            ])->values()->all(),
            'pendingNewItems' => app(\App\Services\Operational\PurchasingService::class)->getPendingNewItems()->map(fn ($pr) => [
                'id' => $pr->id,
                'item_name' => $pr->item_name,
                'quantity' => $pr->quantity,
                'project_name' => $pr->project_name,
                'requester_name' => $pr->requester_name,
                'material_request_item_id' => $pr->material_request_item_id,
                'notes' => $pr->notes,
            ])->values()->all(),
        ]);
    })->name('products.index');
});

// Transaksi
Route::middleware(['auth', 'verified'])->prefix('transactions')->name('transactions.')->group(function () {
    Route::get('/barang-masuk', function (IncomingTransactionService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Transaction/BarangMasuk/Index', [
            'transactions' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'transaction_id' => $item->transaction_id,
                'transaction_date' => $item->transaction_date?->toDateString(),
                'quantity' => $item->quantity,
                'purchase_price' => $item->purchase_price,
                'notes' => $item->notes,
                'product_id' => $item->product_id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'sku' => $item->product->sku,
                    'name' => $item->product->name,
                    'stock' => $item->product->stock,
                    'category' => $item->product->relationLoaded('category') && $item->product->category ? [
                        'id' => $item->product->category->id,
                        'code' => $item->product->category->code,
                        'name' => $item->product->category->name,
                    ] : null,
                ] : null,
                'purchase_source' => $item->relationLoaded('purchaseSource') && $item->purchaseSource ? [
                    'id' => $item->purchaseSource->id,
                    'name' => $item->purchaseSource->name,
                ] : null,
                'user' => $item->relationLoaded('user') && $item->user ? [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                ] : null,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
            'products' => app(ProductService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'stock' => $p->stock,
            ])->values()->all(),
            'purchaseSources' => app(PurchaseSourceService::class)->getAll()->map(fn ($ps) => [
                'id' => $ps->id,
                'name' => $ps->name,
            ])->values()->all(),
            'pendingMRItems' => app(\App\Services\Operational\PurchasingService::class)->getPendingIncomingItems()->map(fn ($pr) => [
                'id' => $pr->id,
                'item_name' => $pr->item_name,
                'quantity' => $pr->quantity,
                'project_name' => $pr->project_name,
                'requester_name' => $pr->requester_name,
                'product_id' => $pr->product_id,
                'material_request_item_id' => $pr->material_request_item_id,
                'product' => $pr->product ? [
                    'id' => $pr->product->id,
                    'sku' => $pr->product->sku,
                    'name' => $pr->product->name,
                ] : null,
            ])->values()->all(),
            'pendingRestockItems' => app(\App\Services\Operational\StockReplenishmentService::class)
                ->getForBarangMasukItems()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'replenishment_id' => $r->replenishment_id,
                    'quantity' => $r->quantity,
                    'notes' => $r->notes,
                    'urgency' => $r->urgency,
                    'received_at' => $r->received_at?->toIso8601String(),
                    'product_id' => $r->product_id,
                    'product' => $r->product ? [
                        'id' => $r->product->id,
                        'sku' => $r->product->sku,
                        'name' => $r->product->name,
                    ] : null,
                    'requested_by' => $r->requested_by,
                    'requester' => $r->requester ? [
                        'id' => $r->requester->id,
                        'name' => $r->requester->name,
                    ] : null,
                    'approved_by_admin' => $r->approved_by_admin,
                    'approvedByAdmin' => $r->approvedByAdmin ? [
                        'id' => $r->approvedByAdmin->id,
                        'name' => $r->approvedByAdmin->name,
                    ] : null,
                    'approved_at_admin' => $r->approved_at_admin?->toIso8601String(),
                    'approved_by_purchasing' => $r->approved_by_purchasing,
                    'approvedByPurchasing' => $r->approvedByPurchasing ? [
                        'id' => $r->approvedByPurchasing->id,
                        'name' => $r->approvedByPurchasing->name,
                    ] : null,
                    'approved_at_purchasing' => $r->approved_at_purchasing?->toIso8601String(),
                    'created_at' => $r->created_at?->toIso8601String(),
                ])->values()->all(),
        ]);
    })->name('barang-masuk');

    Route::get('/barang-keluar', function (OutgoingTransactionService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Transaction/BarangKeluar/Index', [
            'transactions' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'transaction_id' => $item->transaction_id,
                'transaction_date' => $item->transaction_date?->toDateString(),
                'quantity' => $item->quantity,
                'condition' => $item->condition,
                'usage_type' => $item->usage_type,
                'project_name' => $item->project_name,
                'taken_by' => $item->taken_by,
                'pickup_time' => $item->pickup_time,
                'notes' => $item->notes,
                'product_id' => $item->product_id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'sku' => $item->product->sku,
                    'name' => $item->product->name,
                    'stock' => $item->product->stock,
                    'category' => $item->product->relationLoaded('category') && $item->product->category ? [
                        'id' => $item->product->category->id,
                        'code' => $item->product->category->code,
                        'name' => $item->product->category->name,
                    ] : null,
                ] : null,
                'user' => $item->relationLoaded('user') && $item->user ? [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                ] : null,
                'project' => $item->relationLoaded('project') && $item->project ? [
                    'id' => $item->project->id,
                    'name' => $item->project->name,
                ] : null,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
            'products' => app(ProductService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'stock' => $p->stock,
            ])->values()->all(),
            'projects' => app(ProjectService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ])->values()->all(),
        ]);
    })->name('barang-keluar');

    Route::get('/penyesuaian-stok', function (StockAdjustmentService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
        );
        return Inertia::render('Transaction/PenyesuaianStok/Index', [
            'adjustments' => paginateForInertia($paginator, fn ($item) => [
                'id' => $item->id,
                'old_stock' => $item->old_stock,
                'new_stock' => $item->new_stock,
                'reason' => $item->reason,
                'product_id' => $item->product_id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'sku' => $item->product->sku,
                    'name' => $item->product->name,
                    'stock' => $item->product->stock,
                    'category' => $item->product->relationLoaded('category') && $item->product->category ? [
                        'id' => $item->product->category->id,
                        'code' => $item->product->category->code,
                        'name' => $item->product->category->name,
                    ] : null,
                ] : null,
                'user' => $item->relationLoaded('user') && $item->user ? [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                ] : null,
                'created_at' => $item->created_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ]),
            'products' => app(ProductService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'stock' => $p->stock,
            ])->values()->all(),
            'categories' => app(CategoryService::class)->getAll()->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
            ])->values()->all(),
        ]);
    })->name('penyesuaian-stok');

    Route::get('/stock-overview', function (StockOverviewService $service) {
        $overview = $service->getStockOverview(
            dateFrom: request('date_from'),
            dateTo: request('date_to'),
            status: request('status'),
            categoryId: request('category_id'),
            search: request('search'),
        );
        return Inertia::render('Transaction/StockOverview/Index', [
            'overview' => $overview,
            'categories' => app(CategoryService::class)->getAll()->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
            ])->values()->all(),
        ]);
    })->name('stock-overview');
});

// Operational
Route::middleware(['auth', 'verified'])->prefix('operational')->name('operational.')->group(function () {
    Route::get('/material-requests', function (MaterialRequestService $service) {
        $paginator = $service->getPaginated(
            search: request('search', ''),
            sortField: request('sort_field', 'created_at'),
            sortOrder: request('sort_order', 'desc'),
            perPage: request('per_page', 10),
            tab: request('tab'),
        );
        return Inertia::render('Operational/MaterialRequest/Index', [
            'materialRequests' => [
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
            'projects' => app(ProjectService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ])->values()->all(),
            'products' => app(ProductService::class)->getAll()->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'stock' => $p->stock,
            ])->values()->all(),
            'categories' => app(CategoryService::class)->getAll()->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
            ])->values()->all(),
            'users' => User::select('id', 'name')->orderBy('name')->get()->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
            ])->values()->all(),
        ]);
    })->name('material-requests');

    Route::get('/approval', function () {
        return Inertia::render('Operational/Approval/Index');
    })->name('approval');

    Route::get('/admin-proyek', function () {
        return Inertia::render('Operational/AdminProyek/Index');
    })->name('admin-proyek');
});

// Purchasing - Permintaan Pembelian
Route::middleware(['auth', 'verified'])->prefix('purchasing')->name('purchasing.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Purchasing/Index');
    })->name('index');
});

// Admin
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', function () {
        return Inertia::render('Admin/Users/Index');
    })->name('users.index');

    Route::get('/roles', function () {
        return Inertia::render('Admin/Roles/Index');
    })->name('roles.index');

    Route::get('/activity-log', function () {
        return Inertia::render('Admin/ActivityLog/Index');
    })->name('activity-log.index');
});

// Laporan (placeholder)
Route::middleware(['auth', 'verified'])->name('reports.')->prefix('reports')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Reports/Index');
    })->name('index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// PDF Print (tanpa auth — bisa diakses dari browser langsung)
Route::get('/approval/{id}/print-pdf', [\App\Http\Controllers\Api\Operational\ApprovalController::class, 'printPdf']);

require __DIR__.'/auth.php';
