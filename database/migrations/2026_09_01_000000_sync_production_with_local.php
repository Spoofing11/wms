<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. users: tambah avatar ──────────────────────────────────
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('profile_photo');
            }
        });

        // ── 2. categories: drop unique + tambah deleted_at ───────────
        Schema::table('categories', function (Blueprint $table) {
            if (DB::getSchemaBuilder()->hasTable('categories')) {
                $unique = DB::select("SHOW INDEX FROM categories WHERE Key_name = 'categories_code_unique'");
                if (!empty($unique)) {
                    $table->dropUnique('categories_code_unique');
                }
                if (!Schema::hasColumn('categories', 'deleted_at')) {
                    $table->softDeletes();
                }
            }
        });

        // ── 3. locations: tambah deleted_at ──────────────────────────
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // ── 4. purchase_sources: tambah deleted_at ───────────────────
        Schema::table('purchase_sources', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_sources', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // ── 5. projects: tambah deleted_at ───────────────────────────
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // ── 6. products: drop unique + tambah sequence_number ────────
        Schema::table('products', function (Blueprint $table) {
            if (DB::getSchemaBuilder()->hasTable('products')) {
                $unique = DB::select("SHOW INDEX FROM products WHERE Key_name = 'products_sku_unique'");
                if (!empty($unique)) {
                    $table->dropUnique('products_sku_unique');
                }
                if (!Schema::hasColumn('products', 'sequence_number')) {
                    $table->unsignedInteger('sequence_number')->nullable()->after('id');
                }
            }
        });

        // ── 7. roles: tambah slug + description ──────────────────────
        Schema::table('roles', function (Blueprint $table) {
            if (!Schema::hasColumn('roles', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }
            if (!Schema::hasColumn('roles', 'description')) {
                $table->text('description')->nullable()->after('slug');
            }
        });

        // Populate slug from name for existing roles
        DB::table('roles')->whereNull('slug')->orWhere('slug', '')->orderBy('id')->each(function ($role) {
            $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $role->name), '-'));
            DB::table('roles')->where('id', $role->id)->update(['slug' => $slug]);
        });

        Schema::table('roles', function (Blueprint $table) {
            if (Schema::hasColumn('roles', 'slug')) {
                $existingUnique = DB::select("SHOW INDEX FROM roles WHERE Key_name = 'roles_slug_unique'");
                if (empty($existingUnique)) {
                    $table->unique('slug');
                }
            }
        });

        // ── 8. permissions: tambah slug + group ──────────────────────
        Schema::table('permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('permissions', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }
            if (!Schema::hasColumn('permissions', 'group')) {
                $table->string('group')->nullable()->after('slug');
            }
        });

        // Populate slug from name for existing permissions
        DB::table('permissions')->whereNull('slug')->orWhere('slug', '')->orderBy('id')->each(function ($perm) {
            DB::table('permissions')->where('id', $perm->id)->update(['slug' => $perm->name]);
        });

        Schema::table('permissions', function (Blueprint $table) {
            if (Schema::hasColumn('permissions', 'slug')) {
                $existingUnique = DB::select("SHOW INDEX FROM permissions WHERE Key_name = 'permissions_slug_unique'");
                if (empty($existingUnique)) {
                    $table->unique('slug');
                }
            }
        });

        // ── 9. material_requests: tambah photo + ubah enum ───────────
        Schema::table('material_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('material_requests', 'photo')) {
                $table->string('photo')->nullable()->after('ready_photo');
            }
        });

        DB::statement("ALTER TABLE material_requests MODIFY COLUMN urgency ENUM('normal','urgent') NOT NULL");

        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('menunggu_review_admin','diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'menunggu_review_admin'");

        // ── 10. material_request_items: tambah kolom + ubah enum ─────
        Schema::table('material_request_items', function (Blueprint $table) {
            if (!Schema::hasColumn('material_request_items', 'photo')) {
                $table->string('photo')->nullable()->after('ready_photo');
            }
            if (!Schema::hasColumn('material_request_items', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('status');
            }
            if (!Schema::hasColumn('material_request_items', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('material_request_items', 'photo_approved_by')) {
                $table->unsignedBigInteger('photo_approved_by')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('material_request_items', 'photo_approved_at')) {
                $table->timestamp('photo_approved_at')->nullable()->after('photo_approved_by');
            }
            if (!Schema::hasColumn('material_request_items', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('photo_approved_at');
            }
        });

        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('menunggu_review_admin','diajukan','menunggu_pengadaan','disetujui','diproses','siap_ambil','diterima','ditolak') NOT NULL DEFAULT 'menunggu_review_admin'");

        // ── 11. purchase_requests: tambah kolom + ubah status ke enum ─
        Schema::table('purchase_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_requests', 'project_id')) {
                $table->unsignedBigInteger('project_id')->nullable()->after('material_request_item_id');
            }
            if (!Schema::hasColumn('purchase_requests', 'project_name')) {
                $table->string('project_name')->nullable()->after('project_id');
            }
            if (!Schema::hasColumn('purchase_requests', 'urgency')) {
                $table->enum('urgency', ['normal', 'urgent'])->nullable()->after('project_name');
            }
            if (!Schema::hasColumn('purchase_requests', 'notes')) {
                $table->text('notes')->nullable()->after('urgency');
            }
            if (!Schema::hasColumn('purchase_requests', 'requester_name')) {
                $table->string('requester_name')->nullable()->after('notes');
            }
        });

        DB::statement("ALTER TABLE purchase_requests MODIFY COLUMN status ENUM('diajukan','disetujui','ready','ditolak') NOT NULL DEFAULT 'diajukan'");

        // ── 11b. purchase_requests: ubah FK cascadeOnDelete ──────────
        Schema::table('purchase_requests', function (Blueprint $table) {
            $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_requests' AND COLUMN_NAME = 'material_request_item_id' AND REFERENCED_TABLE_NAME IS NOT NULL");
            if (!empty($fks)) {
                $table->dropForeign(['material_request_item_id']);
            }
            $table->foreign('material_request_item_id')
                ->references('id')->on('material_request_items')
                ->cascadeOnDelete();
        });

        // ── 12. stock_replenishments: CREATE TABLE ───────────────────
        if (!Schema::hasTable('stock_replenishments')) {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_replenishments');

        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropForeign(['material_request_item_id']);
            $table->foreign('material_request_item_id')
                ->references('id')->on('material_request_items');
            $table->dropColumn(['project_id', 'project_name', 'urgency', 'notes', 'requester_name']);
        });

        DB::statement("ALTER TABLE purchase_requests MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'diajukan'");

        Schema::table('material_request_items', function (Blueprint $table) {
            $table->dropColumn(['photo', 'approved_by', 'approved_at', 'photo_approved_by', 'photo_approved_at', 'rejection_reason']);
        });

        DB::statement("ALTER TABLE material_request_items MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','diproses','siap_ambil','diterima') NOT NULL DEFAULT 'diajukan'");

        Schema::table('material_requests', function (Blueprint $table) {
            $table->dropColumn('photo');
        });

        DB::statement("ALTER TABLE material_requests MODIFY COLUMN urgency ENUM('normal','urgent','critical') NOT NULL");
        DB::statement("ALTER TABLE material_requests MODIFY COLUMN status ENUM('diajukan','menunggu_pengadaan','diproses','siap_ambil','diterima') NOT NULL DEFAULT 'diajukan'");

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['slug', 'group']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['slug', 'description']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sequence_number');
            $table->unique('sku');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->unique('code');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('purchase_sources', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};
