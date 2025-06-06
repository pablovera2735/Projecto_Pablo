<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Comment;
use App\Models\Review;

class AdminController extends Controller
{
    private function checkAdmin()
{
    $user = Auth::user();

    if (!$user || !$user->is_admin) {
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

        // Impedir que el superadmin pierda su rol
        if ($user->email === 'admin@mail.com') {
        return response()->json(['message' => 'No puedes quitar el rol de admin al superadmin.'], 403);
        }

        // Impedir que un admin se quite su propio rol
        if (auth()->id() == $user->id) {
        return response()->json(['message' => 'No puedes quitarte tu propio rol de administrador.'], 403);
        }

        $user->is_admin = false;
        $user->save();

        return response()->json(['message' => 'Rol de administrador revocado.']);
    }

    // Ver todos los usuarios

    public function getAllUsers()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        return response()->json(User::all());
    }


    // Eliminar usuario
    public function deleteUser($id)
    {
        if ($response = $this->checkAdmin()) {
        return $response;
        }

        if (Auth::id() == $id) {
        return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        $user = User::findOrFail($id);

        // 🔐 Elimina todos los tokens del usuario (si usa Laravel Sanctum)
        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }


    // Promover a admin
    public function makeAdmin($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $user = User::findOrFail($id);
        $user->is_admin = true;  // Si quieres seguir usando el campo para otros usuarios
        $user->save();

        return response()->json(['message' => 'Usuario promovido a administrador']);
    }
    
    
    // Obtener todos los comentarios
    public function getAllComments()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        return response()->json(Comment::with('user')->latest()->get());
    }

    // Eliminar comentario
    public function deleteComment($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Comment::findOrFail($id)->delete();
        return response()->json(['message' => 'Comentario eliminado']);
    }


    // Obtener todas las reseñas
    public function getAllReviews()
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        return response()->json(Review::with('user')->latest()->get());
    }


    public function blockUserForum($id, Request $request)
{
    $user = User::findOrFail($id);
    
    // Puedes recibir duración del bloqueo opcional
    $durationMinutes = $request->input('duration', 60); // Por ejemplo, 60 minutos
    
    $user->forum_blocked = true;
    $user->forum_blocked_until = now()->addMinutes($durationMinutes);
    $user->save();

    return response()->json(['message' => 'Usuario bloqueado del foro']);
}


public function unblockUserForum($id)
{
    $user = User::findOrFail($id);
    $user->forum_blocked = false;
    $user->forum_blocked_until = null;
    $user->save();

    return response()->json(['message' => 'Usuario desbloqueado del foro']);
}


public function blockUserReview($id, Request $request)
{
    if ($response = $this->checkAdmin()) {
        return $response;
    }

    $user = User::findOrFail($id);
    
    $durationMinutes = $request->input('duration', 60); // duración opcional, por defecto 60 minutos

    $user->review_blocked = true;
    $user->review_blocked_until = now()->addMinutes($durationMinutes);
    $user->save();

    return response()->json(['message' => 'Usuario bloqueado para reseñas']);
}

// Desbloquear reseñas del usuario
public function unblockUserReview($id)
{
    if ($response = $this->checkAdmin()) {
        return $response;
    }

    $user = User::findOrFail($id);
    $user->review_blocked = false;
    $user->review_blocked_until = null;
    $user->save();

    return response()->json(['message' => 'Usuario desbloqueado para reseñas']);
}

    // Eliminar reseña
    public function deleteReview($id)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Reseña eliminada']);
    }
}
