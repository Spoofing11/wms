<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_replenishments', function (Blueprint $table) {
            $table->id();
            $table->string('replenishment_id')->unique();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->string('urgency')->default('normal');
            $table->string('status')->default('diajukan');
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by_admin')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at_admin')->nullable();
            $table->foreignId('rejected_by_admin')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('rejected_at_admin')->nullable();
            $table->text('rejection_reason_admin')->nullable();
            $table->foreignId('approved_by_purchasing')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at_purchasing')->nullable();
            $table->foreignId('rejected_by_purchasing')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('rejected_at_purchasing')->nullable();
            $table->text('rejection_reason_purchasing')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_replenishments');
    }
};
