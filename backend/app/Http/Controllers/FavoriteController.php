<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    public function index($userId)
    {
        $favorites = Favorite::where('user_id', $userId)->get();

        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');
        
        $moviesWithPosters = [];

        foreach ($favorites as $favorite) {
            $movieId = $favorite->movie_id;
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
            } else {
                Log::error("No se pudo obtener detalles para la película ID $movieId desde TMDB", [
                    'status' => $detailsResponse->status(),
                    'message' => $detailsResponse->body()
                ]);
            }
        }

        // Log personalizado
        Log::channel('peliculas')->info('Usuario consultó sus películas favoritas', [
            'user_id' => $userId,
            'cantidad_favoritos' => count($favorites),
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json([
            'favorites' => $moviesWithPosters
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required',
            'title' => 'required',
            'poster_path' => 'nullable'
        ]);

        $favorite = Favorite::create([
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'poster_path' => $request->poster_path
        ]);

        Log::channel('peliculas')->info('Película añadida a favoritos', [
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($favorite, 201);
    }

    public function destroy($movieId)
    {
        $userId = auth()->id();

        $favorite = Favorite::where('user_id', $userId)
            ->where('movie_id', $movieId)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }

        $favorite->delete();

        Log::channel('peliculas')->info('Película eliminada de favoritos', [
            'user_id' => $userId,
            'movie_id' => $movieId,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Eliminado'], 200);
    }
}
