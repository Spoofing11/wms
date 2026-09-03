<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $user->load('roles.permissions');
        $userPermissions = $user->roles->flatMap->permissions->pluck('slug')->unique()->values()->all();

        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        abort(403, 'Anda tidak memiliki akses.');
    }
}
