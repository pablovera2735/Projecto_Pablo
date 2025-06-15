<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Comment;
use App\Models\Review;

class AdminController extends Controller
{
    // Cambié para que solo devuelva bool y usarlo más limpio
    private function isAdmin()
    {
        $user = Auth::user();
        return $user && $user->is_admin;
    }

    private function checkAdmin()
    {
        if (!$this->isAdmin()) {
            Log::channel('peliculas')->warning('Acceso no autorizado a funciones admin', [
                'user_id' => Auth::id()
            ]);
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return null;
    }

    public function revokeAdmin($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);

        if ($user->email === 'admin@mail.com') {
            Log::channel('peliculas')->warning('Intento de revocar rol admin al superadmin', ['user_id' => $id]);
            return response()->json(['message' => 'No puedes quitar el rol de admin al superadmin.'], 403);
        }

        if (auth()->id() == $user->id) {
            Log::channel('peliculas')->warning('Intento de admin de revocar su propio rol', ['user_id' => $id]);
            return response()->json(['message' => 'No puedes quitarte tu propio rol de administrador.'], 403);
        }

        $user->is_admin = false;
        $user->save();

        Log::channel('peliculas')->info('Rol de administrador revocado', ['user_id' => $id, 'revoked_by' => auth()->id()]);

        return response()->json(['message' => 'Rol de administrador revocado.']);
    }

    public function getAllUsers()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Log::channel('peliculas')->info('Listado de todos los usuarios solicitado', ['requested_by' => auth()->id()]);

        return response()->json(User::all());
    }

    public function deleteUser($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        if (Auth::id() == $id) {
            Log::channel('peliculas')->warning('Intento de admin de eliminarse a sí mismo', ['user_id' => $id]);
            return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        $user = User::findOrFail($id);

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        $user->delete();

        Log::channel('peliculas')->info('Usuario eliminado', ['deleted_user_id' => $id, 'deleted_by' => auth()->id()]);

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    public function makeAdmin($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $user->is_admin = true;
        $user->save();

        Log::channel('peliculas')->info('Usuario promovido a administrador', ['user_id' => $id, 'promoted_by' => auth()->id()]);

        return response()->json(['message' => 'Usuario promovido a administrador']);
    }

    public function getAllComments()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Log::channel('peliculas')->info('Listado de todos los comentarios solicitado', ['requested_by' => auth()->id()]);

        return response()->json(Comment::with('user')->latest()->get());
    }

    public function deleteComment($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Comment::findOrFail($id)->delete();

        Log::channel('peliculas')->info('Comentario eliminado', ['comment_id' => $id, 'deleted_by' => auth()->id()]);

        return response()->json(['message' => 'Comentario eliminado']);
    }

    public function getAllReviews()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Log::channel('peliculas')->info('Listado de todas las reseñas solicitado', ['requested_by' => auth()->id()]);

        return response()->json(Review::with('user')->latest()->get());
    }

    public function blockUserForum($id, Request $request)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $durationMinutes = $request->input('duration', 60);

        $user->forum_blocked = true;
        $user->forum_blocked_until = now()->addMinutes($durationMinutes);
        $user->save();

        Log::channel('peliculas')->info('Usuario bloqueado del foro', [
            'user_id' => $id,
            'blocked_by' => auth()->id(),
            'duration_minutes' => $durationMinutes,
        ]);

        return response()->json(['message' => 'Usuario bloqueado del foro']);
    }

    public function unblockUserForum($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $user->forum_blocked = false;
        $user->forum_blocked_until = null;
        $user->save();

        Log::channel('peliculas')->info('Usuario desbloqueado del foro', ['user_id' => $id, 'unblocked_by' => auth()->id()]);

        return response()->json(['message' => 'Usuario desbloqueado del foro']);
    }

    public function blockUserReview($id, Request $request)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $durationMinutes = $request->input('duration', 60);

        $user->review_blocked = true;
        $user->review_blocked_until = now()->addMinutes($durationMinutes);
        $user->save();

        Log::channel('peliculas')->info('Usuario bloqueado para reseñas', [
            'user_id' => $id,
            'blocked_by' => auth()->id(),
            'duration_minutes' => $durationMinutes,
        ]);

        return response()->json(['message' => 'Usuario bloqueado para reseñas']);
    }

    public function unblockUserReview($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $user->review_blocked = false;
        $user->review_blocked_until = null;
        $user->save();

        Log::channel('peliculas')->info('Usuario desbloqueado para reseñas', ['user_id' => $id, 'unblocked_by' => auth()->id()]);

        return response()->json(['message' => 'Usuario desbloqueado para reseñas']);
    }

    public function deleteReview($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Review::findOrFail($id)->delete();

        Log::channel('peliculas')->info('Reseña eliminada', ['review_id' => $id, 'deleted_by' => auth()->id()]);

        return response()->json(['message' => 'Reseña eliminada']);
    }
}
