<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropForeign(['material_request_item_id']);
            $table->foreign('material_request_item_id')
                ->references('id')->on('material_request_items')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropForeign(['material_request_item_id']);
            $table->foreign('material_request_item_id')
                ->references('id')->on('material_request_items');
        });
    }
};
