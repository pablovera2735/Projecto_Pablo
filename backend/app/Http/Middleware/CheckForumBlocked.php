<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckForumBlocked
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user->forum_blocked && $user->forum_blocked_until && $user->forum_blocked_until->isFuture()) {
            return response()->json(['message' => 'Estás bloqueado del foro por mal comportamiento.'], 403);
        }

        // Si el bloqueo expiró, se limpia
        if ($user->forum_blocked && (!$user->forum_blocked_until || $user->forum_blocked_until->isPast())) {
            $user->forum_blocked = false;
            $user->forum_blocked_until = null;
            $user->save();
        }

        return $next($request);
    }
}
