<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. material_requests — tambah kolom photo
        Schema::table('material_requests', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('ready_photo');
        });

        // 2. material_requests — ubah enum urgency, hapus critical
        DB::statement("ALTER TABLE material_requests MODIFY COLUMN urgency ENUM('normal','urgent') NOT NULL");

        // 3. material_request_items — tambah kolom approval tracking
        Schema::table('material_request_items', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable()->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->unsignedBigInteger('photo_approved_by')->nullable()->after('approved_at');
            $table->timestamp('photo_approved_at')->nullable()->after('photo_approved_by');
            $table->text('rejection_reason')->nullable()->after('photo_approved_at');
        });

        // 4. material_request_items — ubah enum status, tambah disetujui & ditolak
        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'diajukan'");

        // 5. purchase_requests — tambah kolom
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('material_request_item_id');
            $table->string('project_name')->nullable()->after('project_id');
            $table->enum('urgency', ['normal', 'urgent'])->nullable()->after('project_name');
            $table->text('notes')->nullable()->after('urgency');
            $table->string('requester_name')->nullable()->after('notes');
        });

        // 6. purchase_requests — ubah status ke enum
        DB::statement("ALTER TABLE purchase_requests MODIFY COLUMN status ENUM('diajukan','disetujui','ready','ditolak') NOT NULL DEFAULT 'diajukan'");

        // 7. material_requests — ubah enum status, tambah disetujui & ditolak
        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'diajukan'");
    }

    public function down(): void
    {
        Schema::table('material_requests', function (Blueprint $table) {
            $table->dropColumn('photo');
        });

        DB::statement("ALTER TABLE material_requests MODIFY COLUMN urgency ENUM('normal','urgent','critical') NOT NULL");

        Schema::table('material_request_items', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at', 'photo_approved_by', 'photo_approved_at', 'rejection_reason']);
        });

        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','diproses','siap_ambil','diterima') NOT NULL DEFAULT 'diajukan'");

        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropColumn(['project_id', 'project_name', 'urgency', 'notes', 'requester_name']);
        });

        DB::statement("ALTER TABLE purchase_requests MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'diajukan'");

        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','diproses','siap_ambil','diterima') NOT NULL DEFAULT 'diajukan'");
    }
};
