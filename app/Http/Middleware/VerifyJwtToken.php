<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class VerifyJwtToken
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            if (!JWTAuth::parseToken()->authenticate()) {
                return response()->json(['message' => 'User tidak ditemukan.'], 401);
            }
        } catch (JWTException $e) {
            $message = 'Token tidak valid.';
            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                $message = 'Token sudah kadaluarsa.';
            } elseif ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                $message = 'Token tidak valid.';
            } elseif ($e instanceof \Tymon\JWTAuth\Exceptions\TokenBlacklistException) {
                $message = 'Token sudah diblacklist.';
            }
            return response()->json(['message' => $message], 401);
        }

        return $next($request);
    }
}
