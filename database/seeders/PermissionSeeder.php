<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Update existing production permissions: add slug + group ──
        $existingPerms = Permission::all();
        $groupMap = [
            'dashboard' => 'Dashboard',
            'users' => 'Users',
            'roles' => 'Roles',
            'activitylog' => 'Activity Log',
            'purchase_sources' => 'Master Data',
            'locations' => 'Master Data',
            'categories' => 'Master Data',
            'products' => 'Master Data',
            'projects' => 'Master Data',
            'incoming_transactions' => 'Transaksi',
            'outgoing_transactions' => 'Transaksi',
            'purchaserecord' => 'Transaksi',
            'materialrequest' => 'Operasional',
            'inbox' => 'Operasional',
            'return_transactions' => 'Transaksi',
            'leftover_transactions' => 'Transaksi',
            'material_usages' => 'Transaksi',
            'salvaged_items' => 'Transaksi',
            'salvaged_incoming_transactions' => 'Transaksi',
            'salvaged_outgoing_transactions' => 'Transaksi',
            'average_prices' => 'Transaksi',
            'avarage_prices' => 'Transaksi',
            'material_requests' => 'Operasional',
            'purchase_requests' => 'Purchasing',
            'products_adjust_stock' => 'Transaksi',
            'products.adjust_stock' => 'Transaksi',
            'inventorylog' => 'Transaksi',
            'purchase' => 'Purchasing',
        ];

        foreach ($existingPerms as $perm) {
            $prefix = explode('.', $perm->name)[0];
            $group = $groupMap[$prefix] ?? 'Lainnya';

            $updates = [];
            if (empty($perm->slug)) {
                $updates['slug'] = $perm->name;
            }
            if (empty($perm->group)) {
                $updates['group'] = $group;
            }
            if (!empty($updates)) {
                $perm->update($updates);
            }
        }

        // ── 2. Create NEW permissions for frontend navigation slugs ─────
        $newPermissions = [
            'Master Data' => [
                ['name' => 'Create Kategori', 'slug' => 'master.categories.create'],
                ['name' => 'Read Kategori', 'slug' => 'master.categories.read'],
                ['name' => 'Update Kategori', 'slug' => 'master.categories.update'],
                ['name' => 'Delete Kategori', 'slug' => 'master.categories.delete'],
                ['name' => 'Create Lokasi', 'slug' => 'master.locations.create'],
                ['name' => 'Read Lokasi', 'slug' => 'master.locations.read'],
                ['name' => 'Update Lokasi', 'slug' => 'master.locations.update'],
                ['name' => 'Delete Lokasi', 'slug' => 'master.locations.delete'],
                ['name' => 'Create Sumber Pembelian', 'slug' => 'master.purchase-sources.create'],
                ['name' => 'Read Sumber Pembelian', 'slug' => 'master.purchase-sources.read'],
                ['name' => 'Update Sumber Pembelian', 'slug' => 'master.purchase-sources.update'],
                ['name' => 'Delete Sumber Pembelian', 'slug' => 'master.purchase-sources.delete'],
                ['name' => 'Create Proyek', 'slug' => 'master.projects.create'],
                ['name' => 'Read Proyek', 'slug' => 'master.projects.read'],
                ['name' => 'Update Proyek', 'slug' => 'master.projects.update'],
                ['name' => 'Delete Proyek', 'slug' => 'master.projects.delete'],
                ['name' => 'Create Barang', 'slug' => 'master.products.create'],
                ['name' => 'Read Barang', 'slug' => 'master.products.read'],
                ['name' => 'Update Barang', 'slug' => 'master.products.update'],
                ['name' => 'Delete Barang', 'slug' => 'master.products.delete'],
            ],
            'Transaksi' => [
                ['name' => 'Create Barang Masuk', 'slug' => 'transaction.barang-masuk.create'],
                ['name' => 'Read Barang Masuk', 'slug' => 'transaction.barang-masuk.read'],
                ['name' => 'Update Barang Masuk', 'slug' => 'transaction.barang-masuk.update'],
                ['name' => 'Delete Barang Masuk', 'slug' => 'transaction.barang-masuk.delete'],
                ['name' => 'Create Barang Keluar', 'slug' => 'transaction.barang-keluar.create'],
                ['name' => 'Read Barang Keluar', 'slug' => 'transaction.barang-keluar.read'],
                ['name' => 'Update Barang Keluar', 'slug' => 'transaction.barang-keluar.update'],
                ['name' => 'Delete Barang Keluar', 'slug' => 'transaction.barang-keluar.delete'],
                ['name' => 'Create Penyesuaian', 'slug' => 'transaction.penyesuaian.create'],
                ['name' => 'Read Penyesuaian', 'slug' => 'transaction.penyesuaian.read'],
                ['name' => 'Update Penyesuaian', 'slug' => 'transaction.penyesuaian.update'],
                ['name' => 'Delete Penyesuaian', 'slug' => 'transaction.penyesuaian.delete'],
                ['name' => 'Read Stock Overview', 'slug' => 'transaction.stock-overview.read'],
            ],
            'Operasional' => [
                ['name' => 'Read Admin Proyek', 'slug' => 'operational.admin-proyek.read'],
                ['name' => 'Create Permintaan Bahan', 'slug' => 'operational.material-request.create'],
                ['name' => 'Read Permintaan Bahan', 'slug' => 'operational.material-request.read'],
                ['name' => 'Update Permintaan Bahan', 'slug' => 'operational.material-request.update'],
                ['name' => 'Delete Permintaan Bahan', 'slug' => 'operational.material-request.delete'],
                ['name' => 'Approve/Reject Step 1', 'slug' => 'operational.approval.step1'],
                ['name' => 'Approve+Foto/Reject Step 2', 'slug' => 'operational.approval.step2'],
            ],
            'Purchasing' => [
                ['name' => 'Read Pembelian', 'slug' => 'purchasing.read'],
            ],
        ];

        foreach ($newPermissions as $group => $items) {
            foreach ($items as $perm) {
                Permission::updateOrCreate(
                    ['slug' => $perm['slug']],
                    ['name' => $perm['name'], 'group' => $group, 'guard_name' => 'web']
                );
            }
        }

        // ── 3. Update roles: add slug + description ─────────────────────
        $roleSlugMap = [
            'superadmin' => ['slug' => 'superadmin', 'description' => 'Akses penuh ke semua fitur'],
            'Finance & Purchasing' => ['slug' => 'finance-purchasing', 'description' => 'Finance dan Pembelian'],
            'Admin' => ['slug' => 'admin', 'description' => 'Admin umum'],
            'IT COMPOSITE' => ['slug' => 'it-composite', 'description' => 'IT Composite'],
            'Staff Gudang' => ['slug' => 'staff-gudang', 'description' => 'Staff gudang'],
            'Tukang' => ['slug' => 'tukang', 'description' => 'Tukang'],
            'SPV Lapangan' => ['slug' => 'spv-lapangan', 'description' => 'Supervisor Lapangan'],
            'Engineer' => ['slug' => 'engineer', 'description' => 'Engineer'],
            'Kepala Produksi' => ['slug' => 'kepala-produksi', 'description' => 'Kepala Produksi'],
            'Subcont (Pak roni)' => ['slug' => 'subcont-pak-roni', 'description' => 'Subcont Pak Roni'],
            'Project Manager' => ['slug' => 'project-manager', 'description' => 'Project Manager'],
            'Admin Proyek' => ['slug' => 'admin-proyek', 'description' => 'Admin Proyek'],
            'Project Coordinator' => ['slug' => 'project-coordinator', 'description' => 'Project Coordinator'],
        ];

        foreach ($roleSlugMap as $name => $data) {
            Role::where('name', $name)->update([
                'slug' => $data['slug'],
                'description' => $data['description'],
            ]);
        }

        // ── 4. Assign ALL permissions to superadmin + IT COMPOSITE roles ─
        $superadmin = Role::where('slug', 'superadmin')->first();
        if ($superadmin) {
            $superadmin->permissions()->sync(Permission::pluck('id'));
        }

        $itComposite = Role::where('slug', 'it-composite')->first();
        if ($itComposite) {
            $itComposite->permissions()->sync(Permission::pluck('id'));
        }
    }
}
