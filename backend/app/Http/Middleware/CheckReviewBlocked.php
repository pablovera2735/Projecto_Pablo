<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckReviewBlocked
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user->review_blocked) {
            // Si está bloqueado indefinidamente o hasta una fecha futura
            if (is_null($user->review_blocked_until) || now()->lt($user->review_blocked_until)) {
                return response()->json([
                    'message' => 'Actualmente estás bloqueado para publicar reseñas.'
                ], 403);
            }

            // Si ya pasó la fecha, desactiva el bloqueo automáticamente
            $user->review_blocked = false;
            $user->review_blocked_until = null;
            $user->save();
        }

        return $next($request);
    }
}