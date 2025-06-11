<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Thread;

class ThreadController extends Controller
{
    public function showOrCreate($movieId)
    {
        $thread = Thread::firstOrCreate(
            ['movie_id' => $movieId],
            ['title' => 'Discusión de Película']
        );

        // Cargar comentarios principales y sus respuestas con usuarios
        $thread->load(['comments' => function($query) {
            $query->whereNull('parent_id')
                  ->with(['replies.user', 'user']);
        }]);

        return response()->json($thread);
    }

    public function search(Request $request)
{
    $query = $request->input('q');

    $response = Http::get('https://api.themoviedb.org/3/search/movie', [
        'api_key' => env('TMDB_API_KEY'),
        'query' => $query,
    ]);

    $results = collect($response->json()['results'])->map(function ($movie) {
        return [
            'id' => $movie['id'],
            'title' => $movie['title'],
        ];
    });

    return response()->json(['results' => $results]);
}

}