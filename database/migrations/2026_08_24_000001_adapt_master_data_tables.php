<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // categories — tambah deleted_at (jika belum ada)
        if (Schema::hasTable('categories') && !Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // locations — tambah deleted_at (jika belum ada)
        if (Schema::hasTable('locations') && !Schema::hasColumn('locations', 'deleted_at')) {
            Schema::table('locations', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // purchase_sources — tambah deleted_at (jika belum ada)
        if (Schema::hasTable('purchase_sources') && !Schema::hasColumn('purchase_sources', 'deleted_at')) {
            Schema::table('purchase_sources', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // projects — tambah deleted_at (jika belum ada)
        if (Schema::hasTable('projects') && !Schema::hasColumn('projects', 'deleted_at')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // products — tambah sequence_number (jika belum ada)
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'sequence_number')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unsignedInteger('sequence_number')->nullable()->after('id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('locations') && Schema::hasColumn('locations', 'deleted_at')) {
            Schema::table('locations', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('purchase_sources') && Schema::hasColumn('purchase_sources', 'deleted_at')) {
            Schema::table('purchase_sources', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'deleted_at')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('products') && Schema::hasColumn('products', 'sequence_number')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('sequence_number');
            });
        }
    }
};
