<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incoming_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->date('transaction_date');
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('purchase_request_id')->nullable();
            $table->foreignId('purchase_source_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->string('invoice_number')->nullable();
            $table->string('payment_method')->nullable();
            $table->decimal('coupon_discount', 15, 2)->default(0);
            $table->decimal('store_discount', 15, 2)->default(0);
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('shipping_discount', 15, 2)->default(0);
            $table->decimal('insurance_fee', 15, 2)->default(0);
            $table->decimal('platform_fee', 15, 2)->default(0);
            $table->decimal('used_bonus', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->nullable();
            $table->softDeletes();
        });

        Schema::create('outgoing_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->date('transaction_date');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->string('condition')->default('good');
            $table->string('usage_type')->nullable();
            $table->string('project_name')->nullable();
            $table->text('notes')->nullable();
            $table->string('pickup_time')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('taken_by')->nullable();
            $table->timestamps();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('material_request_item_id')->nullable();
            $table->softDeletes();
        });

        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('old_stock');
            $table->integer('new_stock');
            $table->string('reason');
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });

        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity_before');
            $table->integer('quantity_change');
            $table->integer('quantity_after');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('outgoing_transactions');
        Schema::dropIfExists('incoming_transactions');
    }
};
