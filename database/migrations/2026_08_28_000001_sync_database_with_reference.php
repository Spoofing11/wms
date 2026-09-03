<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Tambah kolom missing di table existing ──────────────────

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'profile_photo')) {
                $table->string('profile_photo')->nullable()->after('avatar');
            }
        });

        // ── 2. Spatie Permission tables ───────────────────────────────

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            $table->primary(['permission_id', 'model_id', 'model_type']);
            $table->index(['model_id', 'model_type']);
            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
        });

        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            $table->primary(['role_id', 'model_id', 'model_type']);
            $table->index(['model_id', 'model_type']);
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');

            $table->primary(['permission_id', 'role_id']);
            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
        });

        // ── 3. Activity Log ───────────────────────────────────────────

        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->string('log_name')->nullable();
            $table->text('description');
            $table->string('subject_type')->nullable();
            $table->string('event')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('causer_type')->nullable();
            $table->unsignedBigInteger('causer_id')->nullable();
            $table->json('properties')->nullable();
            $table->char('batch_uuid', 36)->nullable();
            $table->timestamps();

            $table->index('log_name');
            $table->index(['subject_type', 'subject_id'], 'subject');
            $table->index(['causer_type', 'causer_id'], 'causer');
        });

        // ── 4. Notifications ──────────────────────────────────────────

        Schema::create('notifications', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('type');
            $table->string('notifiable_type');
            $table->unsignedBigInteger('notifiable_id');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id']);
        });

        // ── 5. Personal Access Tokens (Sanctum) ───────────────────────

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('tokenable_type');
            $table->unsignedBigInteger('tokenable_id');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['tokenable_type', 'tokenable_id']);
            $table->index('expires_at');
        });

        // ── 6. Material Requests ──────────────────────────────────────

        Schema::create('material_requests', function (Blueprint $table) {
            $table->id();
            $table->dateTime('request_date');
            $table->foreignId('project_id')->constrained();
            $table->string('division');
            $table->string('division_other')->nullable();
            $table->string('requester_name')->nullable();
            $table->unsignedBigInteger('requester_id')->nullable();
            $table->string('work_type')->nullable();
            $table->string('work_type_other')->nullable();
            $table->enum('usage_type', ['consumable', 'borrow']);
            $table->enum('urgency', ['normal', 'urgent', 'critical']);
            $table->enum('status', ['diajukan', 'menunggu_pengadaan', 'diproses', 'siap_ambil', 'diterima'])->default('diajukan');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->dateTime('request_datetime')->nullable();
            $table->string('pickup_time')->nullable();
            $table->string('ready_photo')->nullable();
            $table->softDeletes();

            $table->foreign('requester_id')->references('id')->on('users');
            $table->foreign('created_by')->references('id')->on('users');
        });

        // ── 7. Material Request Items ─────────────────────────────────

        Schema::create('material_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_request_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->text('specification')->nullable();
            $table->integer('quantity_requested')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->string('new_item_name')->nullable();
            $table->integer('purchase_quantity')->nullable();
            $table->string('ready_photo')->nullable();
            $table->enum('usage_type', ['consumable', 'borrow'])->nullable();
            $table->enum('status', ['diajukan', 'menunggu_pengadaan', 'diproses', 'siap_ambil', 'diterima'])->default('diajukan');
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products');
        });

        // ── 8. Purchase Requests ──────────────────────────────────────

        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('item_name')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->integer('quantity');
            $table->unsignedBigInteger('requested_by');
            $table->timestamps();
            $table->string('status')->default('diajukan');
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('material_request_item_id')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('requested_by')->references('id')->on('users');
            $table->foreign('material_request_item_id')->references('id')->on('material_request_items');
            $table->foreign('cancelled_by')->references('id')->on('users');
        });

        // ── 9. Purchase Records ───────────────────────────────────────

        Schema::create('purchase_records', function (Blueprint $table) {
            $table->id();
            $table->date('purchase_date');
            $table->string('invoice_number');
            $table->string('payment_method')->nullable();
            $table->unsignedBigInteger('purchase_source_id')->nullable();
            $table->foreignId('product_id')->constrained();
            $table->unsignedBigInteger('created_by');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->integer('subtotal')->nullable();
            $table->decimal('coupon_discount', 15, 2)->default(0);
            $table->decimal('store_discount', 15, 2)->default(0);
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('shipping_discount', 15, 2)->default(0);
            $table->decimal('insurance_fee', 15, 2)->default(0);
            $table->decimal('platform_fee', 15, 2)->default(0);
            $table->decimal('used_bonus', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();
            $table->text('notes')->nullable();
            $table->text('refund_notes')->nullable();

            $table->foreign('purchase_source_id')->references('id')->on('purchase_sources')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users');
        });

        // ── 10. Product Price Histories ───────────────────────────────

        Schema::create('product_price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('average_price', 10, 2);
            $table->decimal('previous_price', 10, 2)->nullable();
            $table->integer('stock');
            $table->timestamps();
            $table->unsignedBigInteger('incoming_transaction_id')->nullable();

            $table->index(['product_id', 'date']);
            $table->index('date');
            $table->foreign('incoming_transaction_id')->references('id')->on('incoming_transactions')->cascadeOnDelete();
        });

        // ── 11. Leftover Transactions ─────────────────────────────────

        Schema::create('leftover_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outgoing_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_used', 8, 2);
            $table->decimal('quantity_leftover', 8, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── 12. Material Usages ───────────────────────────────────────

        Schema::create('material_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->date('usage_date');
            $table->decimal('quantity', 8, 2);
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── 13. Return Transactions ───────────────────────────────────

        Schema::create('return_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outgoing_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->string('condition');
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── 14. Salvaged Items ────────────────────────────────────────

        Schema::create('salvaged_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('unit')->default('pcs');
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── 15. Salvaged Incoming Transactions ────────────────────────

        Schema::create('salvaged_incoming_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->foreignId('salvaged_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 2);
            $table->string('source_project')->nullable();
            $table->text('condition_notes')->nullable();
            $table->string('received_by')->nullable();
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── 16. Salvaged Outgoing Transactions ────────────────────────

        Schema::create('salvaged_outgoing_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->foreignId('salvaged_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 2);
            $table->string('destination_project')->nullable();
            $table->string('issued_to')->nullable();
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── 17. Tambah FK constraints yang belum ada ──────────────────

        Schema::table('incoming_transactions', function (Blueprint $table) {
            $table->foreign('purchase_request_id')->references('id')->on('purchase_requests')->nullOnDelete();
        });

        Schema::table('outgoing_transactions', function (Blueprint $table) {
            $table->foreign('material_request_item_id')->references('id')->on('material_request_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('salvaged_outgoing_transactions');
        Schema::dropIfExists('salvaged_incoming_transactions');
        Schema::dropIfExists('salvaged_items');
        Schema::dropIfExists('return_transactions');
        Schema::dropIfExists('material_usages');
        Schema::dropIfExists('leftover_transactions');
        Schema::dropIfExists('product_price_histories');
        Schema::dropIfExists('purchase_records');
        Schema::dropIfExists('purchase_requests');
        Schema::dropIfExists('material_request_items');
        Schema::dropIfExists('material_requests');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_log');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');

        Schema::table('outgoing_transactions', function (Blueprint $table) {
            $table->dropForeign(['material_request_item_id']);
        });

        Schema::table('incoming_transactions', function (Blueprint $table) {
            $table->dropForeign(['purchase_request_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profile_photo');
        });

        Schema::enableForeignKeyConstraints();
    }
};
