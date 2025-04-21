<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MovieController extends Controller
{
    // Obtener las películas populares
    public function getPopularMovies(Request $request)
{
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');
    $page = $request->get('page', 1);

    $url = "$baseUrl/discover/movie?sort_by=popularity.desc&language=$language&api_key=$apiKey&page=$page";

    Log::channel('peliculas')->info("Llamando a TMDB: $url");

    $response = Http::get($url);

    if ($response->successful()) {
        $movies = $response->json()['results'];
        $totalPages = $response->json()['total_pages'];

        Log::channel('peliculas')->info("Películas populares recibidas", [
            'page' => $page,
            'count' => count($movies)
        ]);

        return response()->json([
            'status' => 'success',
            'movies' => $movies,
            'total_pages' => $totalPages
        ]);
    }

    Log::channel('peliculas')->error('Error al obtener películas populares', [
        'status' => $response->status(),
        'body' => $response->body()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener las películas populares'
    ], 500);
}

    // Listar los géneros de películas
    public function listGenres()
    {
        // Obtener géneros desde la configuración
        $genres = config('services.tmdb.genres');

        return response()->json([
            'status' => 'success',
            'genres' => $genres
        ]);
    }

    public function getMovieCast($id)
{
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');

    $url = "$baseUrl/movie/$id/credits?api_key=$apiKey&language=$language";

    Log::channel('peliculas')->info("🎭 Obteniendo reparto para película ID $id -> URL: $url");

    $response = Http::get($url);

    if ($response->successful()) {
        $cast = $response->json()['cast'];
        $castCount = count($cast);

        Log::channel('peliculas')->info("✅ Reparto obtenido para película ID $id", [
            'total_cast' => $castCount,
            'mostrando' => min($castCount, 6)
        ]);

        return response()->json(['cast' => array_slice($cast, 0, 6)]);
    }

    Log::channel('peliculas')->error("❌ Error al obtener reparto de la película ID $id", [
        'status' => $response->status(),
        'body' => $response->body()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudo obtener el reparto'
    ], 500);
}



    // Obtener películas por género
    public function getMoviesByGenre(Request $request, $genreId)
{
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');
    $page = $request->get('page', 1);

    $url = "$baseUrl/discover/movie?with_genres=$genreId&language=$language&api_key=$apiKey&page=$page";

    Log::channel('peliculas')->info("🎭 Películas por género [$genreId] - Página $page -> URL: $url");

    $response = Http::get($url);

    if ($response->successful()) {
        $movies = $response->json()['results'];
        $totalPages = $response->json()['total_pages'];

        Log::channel('peliculas')->info("✅ Género $genreId: Recibidas " . count($movies) . " películas");

        return response()->json([
            'status' => 'success',
            'movies' => $movies,
            'total_pages' => $totalPages
        ]);
    }

    Log::channel('peliculas')->error("❌ Error al obtener películas por género $genreId", [
        'status' => $response->status(),
        'body' => $response->body()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener las películas por género'
    ], 500);
}


    // Búsqueda de películas por nombre
    public function searchMovie(Request $request)
{
    $request->validate([
        'query' => 'required|string'
    ]);

    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');
    $query = $request->input('query');

    $url = "$baseUrl/search/movie?query=$query&language=$language&api_key=$apiKey";

    Log::channel('peliculas')->info("🔍 Búsqueda de película: '$query' -> URL: $url");

    $response = Http::get($url);

    if ($response->successful()) {
        $movies = $response->json()['results'];

        Log::channel('peliculas')->info("✅ Resultados obtenidos para '$query'", [
            'total' => count($movies)
        ]);

        return response()->json([
            'status' => 'success',
            'movies' => $movies
        ]);
    }

    Log::channel('peliculas')->error("❌ Error al buscar '$query'", [
        'status' => $response->status(),
        'body' => $response->body()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener los resultados de la búsqueda'
    ], 500);
}

    // Obtener detalles de una película
    public function getMovieDetails($id)
{
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');

    $detailsUrl = "$baseUrl/movie/$id?language=$language&api_key=$apiKey";
    $videosUrl = "$baseUrl/movie/$id/videos?api_key=$apiKey&language=$language";

    Log::channel('peliculas')->info("🎬 Detalles de la película ID $id");

    $detailsResponse = Http::get($detailsUrl);
    $videosResponse = Http::get($videosUrl);

    if ($detailsResponse->successful() && $videosResponse->successful()) {
        $movieDetails = $detailsResponse->json();
        $videos = $videosResponse->json();

        $trailer = collect($videos['results'])->first(function ($video) {
            return $video['type'] === 'Trailer' && $video['site'] === 'YouTube';
        });

        $movieDetails['trailer'] = $trailer ? 'https://www.youtube.com/embed/' . $trailer['key'] : null;

        Log::channel('peliculas')->info("✅ Detalles obtenidos de película ID $id", [
            'title' => $movieDetails['title'] ?? 'Sin título',
            'hasTrailer' => $movieDetails['trailer'] ? 'Sí' : 'No'
        ]);

        return response()->json([
            'status' => 'success',
            'movie_details' => $movieDetails
        ]);
    }

    Log::channel('peliculas')->error("❌ Error al obtener detalles de película ID $id", [
        'details_status' => $detailsResponse->status(),
        'videos_status' => $videosResponse->status()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener los detalles de la película'
    ], 500);
}


}
