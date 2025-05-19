<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Comment;
use App\Models\Review;

class AdminController extends Controller
{
    // Ver todos los usuarios
    public function getAllUsers()
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(User::all());
    }

    // Eliminar usuario
    public function deleteUser($id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if (Auth::id() == $id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    // Promover a admin
    public function makeAdmin($id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);
        $user->is_admin = true;
        $user->save();

        return response()->json(['message' => 'Usuario promovido a administrador']);
    }

    // Obtener todos los comentarios
    public function getAllComments()
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(Comment::with('user')->latest()->get());
    }

    // Eliminar comentario
    public function deleteComment($id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Comment::findOrFail($id)->delete();
        return response()->json(['message' => 'Comentario eliminado']);
    }

    // Obtener todas las reseñas
    public function getAllReviews()
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(Review::with('user')->latest()->get());
    }

    // Eliminar reseña
    public function deleteReview($id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Reseña eliminada']);
    }
}

