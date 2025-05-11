<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WatchedMovie;

class WatchedMovieController extends Controller
{
    // Marcar una película como vista
    public function markAsWatched(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'movie_id' => 'required|integer',
        ]);

        $exists = WatchedMovie::where('user_id', $request->user_id)
                              ->where('movie_id', $request->movie_id)
                              ->first();

        if ($exists) {
            return response()->json(['message' => 'La película ya fue marcada como vista.'], 200);
        }

        WatchedMovie::create([
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        return response()->json(['message' => 'Película marcada como vista.'], 201);
    }

    // Eliminar una película del listado de vistas
    public function removeFromWatched(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'movie_id' => 'required|integer',
        ]);

        $deleted = WatchedMovie::where('user_id', $request->user_id)
                               ->where('movie_id', $request->movie_id)
                               ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Película eliminada de los vistos.']);
        }

        return response()->json(['message' => 'No se encontró el registro.'], 404);
    }

    // Verificar si una película fue vista por un usuario
    public function isMovieWatched($userId, $movieId)
    {
        $exists = WatchedMovie::where('user_id', $userId)
                              ->where('movie_id', $movieId)
                              ->exists();

        return response()->json(['isWatched' => $exists]);
    }
}
