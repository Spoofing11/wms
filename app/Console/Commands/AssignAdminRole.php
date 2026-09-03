<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\User;

class AssignAdminRole extends Command
{
    protected $signature = 'assign-admin-role';
    protected $description = 'Assign admin role to Jonathan user';

    public function handle(): int
    {
        $adminRole = Role::where('slug', 'admin')->first();
        if (!$adminRole) {
            $this->error('Role admin not found. Run migrate:fresh --seed first.');
            return 1;
        }

        $user = User::where('email', 'jonathanaddriel18@gmail.com')->first();
        if (!$user) {
            $this->error('User jonathan not found.');
            return 1;
        }

        $exists = DB::table('model_has_roles')
            ->where('role_id', $adminRole->id)
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $user->id)
            ->exists();

        if ($exists) {
            $this->info('User already has admin role.');
            return 0;
        }

        DB::table('model_has_roles')->insert([
            'role_id' => $adminRole->id,
            'model_type' => 'App\\Models\\User',
            'model_id' => $user->id,
        ]);

        $this->info('Done! User ' . $user->name . ' now has admin role.');
        return 0;
    }
}
