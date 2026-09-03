<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Master\CategoryController;
use App\Http\Controllers\Api\Master\LocationController;
use App\Http\Controllers\Api\Master\PurchaseSourceController;
use App\Http\Controllers\Api\Master\ProjectController;
use App\Http\Controllers\Api\Master\ProductController;
use App\Http\Controllers\Api\Transaction\IncomingTransactionController;
use App\Http\Controllers\Api\Transaction\OutgoingTransactionController;
use App\Http\Controllers\Api\Transaction\StockAdjustmentController;
use App\Http\Controllers\Api\Operational\MaterialRequestController;
use App\Http\Controllers\Api\Operational\ApprovalController;
use App\Http\Controllers\Api\Operational\PurchasingController;
use App\Http\Controllers\Api\Operational\AdminProyekController;
use App\Http\Controllers\Api\StockReplenishmentController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\UserController;

Route::prefix('v1')->group(function () {

    // Admin — Roles
    Route::get('roles/permissions', [RoleController::class, 'permissions']);
    Route::apiResource('roles', RoleController::class)->middleware('auth:web');

    // Admin — Users
    Route::apiResource('users', UserController::class)->middleware('auth:web');

    // Master Data
    Route::prefix('master')->middleware('auth:web')->group(function () {
        // Categories — trash routes before resource
        Route::get('categories/trashed', [CategoryController::class, 'trashed']);
        Route::post('categories/bulk-delete', [CategoryController::class, 'bulkDelete']);
        Route::post('categories/{id}/restore', [CategoryController::class, 'restore']);
        Route::delete('categories/{id}/force-delete', [CategoryController::class, 'forceDelete']);
        Route::apiResource('categories', CategoryController::class);

        // Locations — trash routes before resource
        Route::get('locations/trashed', [LocationController::class, 'trashed']);
        Route::post('locations/bulk-delete', [LocationController::class, 'bulkDelete']);
        Route::post('locations/{id}/restore', [LocationController::class, 'restore']);
        Route::delete('locations/{id}/force-delete', [LocationController::class, 'forceDelete']);
        Route::apiResource('locations', LocationController::class);

        // Purchase Sources — trash routes before resource
        Route::get('purchase-sources/trashed', [PurchaseSourceController::class, 'trashed']);
        Route::post('purchase-sources/bulk-delete', [PurchaseSourceController::class, 'bulkDelete']);
        Route::post('purchase-sources/{id}/restore', [PurchaseSourceController::class, 'restore']);
        Route::delete('purchase-sources/{id}/force-delete', [PurchaseSourceController::class, 'forceDelete']);
        Route::apiResource('purchase-sources', PurchaseSourceController::class);

        // Projects — trash routes before resource
        Route::get('projects/trashed', [ProjectController::class, 'trashed']);
        Route::post('projects/bulk-delete', [ProjectController::class, 'bulkDelete']);
        Route::post('projects/{id}/restore', [ProjectController::class, 'restore']);
        Route::delete('projects/{id}/force-delete', [ProjectController::class, 'forceDelete']);
        Route::apiResource('projects', ProjectController::class);

        // Products — trash routes before resource
        Route::get('products/trashed', [ProductController::class, 'trashed']);
        Route::post('products/bulk-delete', [ProductController::class, 'bulkDelete']);
        Route::post('products/{id}/restore', [ProductController::class, 'restore']);
        Route::delete('products/{id}/force-delete', [ProductController::class, 'forceDelete']);
        Route::apiResource('products', ProductController::class);
    });

    // Transactions
    Route::prefix('transactions')->middleware('auth:web')->group(function () {
        // Incoming — trash routes before resource
        Route::get('incoming/trashed', [IncomingTransactionController::class, 'trashed']);
        Route::post('incoming/bulk-delete', [IncomingTransactionController::class, 'bulkDelete']);
        Route::post('incoming/{id}/restore', [IncomingTransactionController::class, 'restore']);
        Route::delete('incoming/{id}/force-delete', [IncomingTransactionController::class, 'forceDelete']);
        Route::apiResource('incoming', IncomingTransactionController::class);

        // Outgoing — trash routes before resource
        Route::get('outgoing/trashed', [OutgoingTransactionController::class, 'trashed']);
        Route::post('outgoing/bulk-delete', [OutgoingTransactionController::class, 'bulkDelete']);
        Route::post('outgoing/{id}/restore', [OutgoingTransactionController::class, 'restore']);
        Route::delete('outgoing/{id}/force-delete', [OutgoingTransactionController::class, 'forceDelete']);
        Route::apiResource('outgoing', OutgoingTransactionController::class);

        // Stock Adjustments
        Route::post('stock-adjustments/bulk-delete', [StockAdjustmentController::class, 'bulkDelete']);
        Route::apiResource('stock-adjustments', StockAdjustmentController::class);
    });

    // Operational
    Route::prefix('operational')->middleware('auth:web')->group(function () {
        // Material Requests — trash routes before resource
        Route::get('material-requests/trashed', [MaterialRequestController::class, 'trashed']);
        Route::get('material-requests/{id}/print', [MaterialRequestController::class, 'printSingle']);
        Route::post('material-requests/bulk-delete', [MaterialRequestController::class, 'bulkDelete']);
        Route::post('material-requests/{id}/restore', [MaterialRequestController::class, 'restore']);
        Route::delete('material-requests/{id}/force-delete', [MaterialRequestController::class, 'forceDelete']);
        Route::apiResource('material-requests', MaterialRequestController::class);

        // Approval (Inbox)
        Route::get('approval', [ApprovalController::class, 'index']);
        Route::post('approval/{id}/approve-step1', [ApprovalController::class, 'approveStep1']);
        Route::post('approval/{id}/approve-step2', [ApprovalController::class, 'approveStep2']);
        Route::post('approval/{id}/reject', [ApprovalController::class, 'reject']);
        Route::post('approval/{id}/print-data', [ApprovalController::class, 'printData']);
        Route::post('approval/{id}/print-zebra', [ApprovalController::class, 'printZebra']);

        // Purchasing
        Route::get('purchasing', [PurchasingController::class, 'index']);
        Route::get('purchasing/{id}', [PurchasingController::class, 'show']);
        Route::post('purchasing/{id}/approve', [PurchasingController::class, 'approve']);
        Route::post('purchasing/{id}/reject', [PurchasingController::class, 'reject']);

        // Admin Proyek
        Route::get('admin-proyek', [AdminProyekController::class, 'index']);
        Route::post('admin-proyek/{id}/approve', [AdminProyekController::class, 'approve']);
        Route::post('admin-proyek/{id}/reject', [AdminProyekController::class, 'reject']);
        Route::put('admin-proyek/item/{itemId}', [AdminProyekController::class, 'updateItem']);
    });

    // Stock Replenishment
    Route::prefix('stock-replenishments')->middleware('auth:web')->group(function () {
        Route::post('/', [StockReplenishmentController::class, 'store']);
        Route::get('/admin-proyek', [StockReplenishmentController::class, 'getForAdminProyek']);
        Route::post('/{id}/admin-approve', [StockReplenishmentController::class, 'approveByAdmin']);
        Route::post('/{id}/admin-reject', [StockReplenishmentController::class, 'rejectByAdmin']);
        Route::get('/purchasing', [StockReplenishmentController::class, 'getForPurchasing']);
        Route::post('/{id}/purchasing-approve', [StockReplenishmentController::class, 'approveByPurchasing']);
        Route::post('/{id}/purchasing-reject', [StockReplenishmentController::class, 'rejectByPurchasing']);
        Route::get('/barang-masuk', [StockReplenishmentController::class, 'getForBarangMasuk']);
        Route::post('/{id}/receive', [StockReplenishmentController::class, 'receive']);
    });

});
