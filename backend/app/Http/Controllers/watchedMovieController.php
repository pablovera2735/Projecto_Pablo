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
        Log::channel('peliculas')->info("Obteniendo películas vistas para user_id: $userId");

        $watchedMovies = WatchedMovie::where('user_id', $userId)->get();

        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');
        
        $moviesWithPosters = [];

        foreach ($watchedMovies as $watchedMovie) {
            $movieId = $watchedMovie->movie_id;
            $detailsUrl = "$baseUrl/movie/$movieId?language=$language&api_key=$apiKey";

            $detailsResponse = Http::get($detailsUrl);

            if ($detailsResponse->successful()) {
                $movieDetails = $detailsResponse->json();

                $posterPath = $movieDetails['poster_path'] ?? null;

                $moviesWithPosters[] = [
                    'id' => $movieId,
                    'title' => $movieDetails['title'],
                    'poster_path' => $posterPath ? "https://image.tmdb.org/t/p/w92{$posterPath}" : null,
                ];

                Log::channel('peliculas')->info("Detalles obtenidos para movie_id: $movieId");
            } else {
                Log::channel('peliculas')->error("Error obteniendo detalles para movie_id: $movieId", [
                    'status' => $detailsResponse->status(),
                    'body' => $detailsResponse->body(),
                ]);
            }
        }

        return response()->json(['watchedMovies' => $moviesWithPosters]);
    }

    public function markAsWatched(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'movie_id' => 'required|integer',
        ]);

        Log::channel('peliculas')->info("Marcando película como vista", [
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        $exists = WatchedMovie::where('user_id', $request->user_id)
                              ->where('movie_id', $request->movie_id)
                              ->first();

        if ($exists) {
            Log::channel('peliculas')->info("La película ya fue marcada como vista anteriormente", [
                'user_id' => $request->user_id,
                'movie_id' => $request->movie_id,
            ]);

            return response()->json(['message' => 'La película ya fue marcada como vista.'], 200);
        }

        WatchedMovie::create([
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        Log::channel('peliculas')->info("Película marcada como vista correctamente", [
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        return response()->json(['message' => 'Película marcada como vista.'], 201);
    }

    public function removeFromWatched(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'movie_id' => 'required|integer',
        ]);

        Log::channel('peliculas')->info("Intentando eliminar película de vistos", [
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        $deleted = WatchedMovie::where('user_id', $request->user_id)
                               ->where('movie_id', $request->movie_id)
                               ->delete();

        if ($deleted) {
            Log::channel('peliculas')->info("Película eliminada de vistos correctamente", [
                'user_id' => $request->user_id,
                'movie_id' => $request->movie_id,
            ]);

            return response()->json(['message' => 'Película eliminada de los vistos.']);
        }

        Log::channel('peliculas')->warning("No se encontró película para eliminar en vistos", [
            'user_id' => $request->user_id,
            'movie_id' => $request->movie_id,
        ]);

        return response()->json(['message' => 'No se encontró el registro.'], 404);
    }

    public function isMovieWatched($userId, $movieId)
    {
        Log::channel('peliculas')->info("Verificando si película fue vista", [
            'user_id' => $userId,
            'movie_id' => $movieId,
        ]);

        $exists = WatchedMovie::where('user_id', $userId)
                              ->where('movie_id', $movieId)
                              ->exists();

        Log::channel('peliculas')->info("Resultado de verificación", [
            'user_id' => $userId,
            'movie_id' => $movieId,
            'isWatched' => $exists,
        ]);

        return response()->json(['isWatched' => $exists]);
    }
}
