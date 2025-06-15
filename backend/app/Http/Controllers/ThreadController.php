<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Thread;

class ThreadController extends Controller
{
    public function showOrCreate($movieId)
    {
        Log::channel('peliculas')->info("Intentando obtener o crear thread para movie_id: $movieId");

        $thread = Thread::firstOrCreate(
            ['movie_id' => $movieId],
            ['title' => 'Discusión de Película']
        );

        $thread->load(['comments' => function($query) {
            $query->whereNull('parent_id')
                  ->with(['replies.user', 'user']);
        }]);

        Log::channel('peliculas')->info("Thread cargado para movie_id: $movieId, thread_id: {$thread->id}");

        return response()->json($thread);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');

        Log::channel('peliculas')->info("Buscando películas con query: {$query}");

        $response = Http::get('https://api.themoviedb.org/3/search/movie', [
            'api_key' => env('TMDB_API_KEY'),
            'query' => $query,
        ]);

        if ($response->successful()) {
            $results = collect($response->json()['results'])->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                ];
            });

            Log::channel('peliculas')->info("Resultados de búsqueda obtenidos: " . count($results));
            return response()->json(['results' => $results]);
        } else {
            Log::channel('peliculas')->error('Error al buscar películas en TMDB', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json(['message' => 'Error al buscar películas'], 500);
        }
    }
}