<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\WatchedMovie;

class WatchedMovieController extends Controller
{

    public function index($userId)
{
    // Obtener las películas vistas del usuario
    $watchedMovies = WatchedMovie::where('user_id', $userId)->get();

    // Configuraciones de la API TMDB
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');
    
    // Crear un array para almacenar las películas con sus posters
    $moviesWithPosters = [];

    // Recorrer las películas vistas y obtener el poster_path de cada una
    foreach ($watchedMovies as $watchedMovie) {
        $movieId = $watchedMovie->movie_id; // Suponiendo que tienes movie_id en la tabla watched_movies
        $detailsUrl = "$baseUrl/movie/$movieId?language=$language&api_key=$apiKey";

        // Obtener los detalles de la película desde TMDB
        $detailsResponse = Http::get($detailsUrl);

        // Verificar que la respuesta sea exitosa
        if ($detailsResponse->successful()) {
            $movieDetails = $detailsResponse->json();

            // Obtener el poster_path de la película, si existe
            $posterPath = $movieDetails['poster_path'] ?? null;

            // Agregar la película al array con poster
            $moviesWithPosters[] = [
                'id' => $movieId,
                'title' => $movieDetails['title'],
                'poster_path' => $posterPath ? "https://image.tmdb.org/t/p/w92{$posterPath}" : null, // Formateamos la URL de la imagen
            ];
        } else {
            // Log para errores de la API
            Log::error("No se pudo obtener detalles para la película ID $movieId desde TMDB", [
                'status' => $detailsResponse->status(),
                'message' => $detailsResponse->body()
            ]);
        }
    }

    // Devolver las películas vistas con los posters
    return response()->json([
        'watchedMovies' => $moviesWithPosters
    ]);
}



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
