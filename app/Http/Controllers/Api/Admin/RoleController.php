<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('permissions')->orderBy('name')->get();
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'description' => 'nullable|string',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'string|exists:permissions,slug',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        $permIds = Permission::whereIn('slug', $validated['permissions'])->pluck('id');
        $role->permissions()->sync($permIds);

        return response()->json(['message' => 'Role berhasil dibuat', 'role' => $role->load('permissions')], 201);
    }

    public function show(Role $role)
    {
        $role->load('permissions');
        return response()->json($role);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,' . $role->id,
            'description' => 'nullable|string',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'string|exists:permissions,slug',
        ]);

        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        $permIds = Permission::whereIn('slug', $validated['permissions'])->pluck('id');
        $role->permissions()->sync($permIds);

        return response()->json(['message' => 'Role berhasil diupdate', 'role' => $role->load('permissions')]);
    }

    public function destroy(Role $role)
    {
        if ($role->slug === 'admin') {
            return response()->json(['message' => 'Role admin tidak bisa dihapus'], 400);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus']);
    }

    public function permissions()
    {
        $permissions = Permission::orderBy('group')->orderBy('slug')->get()->groupBy('group');
        return response()->json($permissions);
    }
}
