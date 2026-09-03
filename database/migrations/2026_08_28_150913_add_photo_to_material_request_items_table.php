<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_request_items', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('ready_photo');
        });

        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('menunggu_review_admin','diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'menunggu_review_admin'");
        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('menunggu_review_admin','diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'menunggu_review_admin'");
    }

    public function down(): void
    {
        Schema::table('material_request_items', function (Blueprint $table) {
            $table->dropColumn('photo');
        });

        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'diajukan'");
        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'diajukan'");
    }
};
