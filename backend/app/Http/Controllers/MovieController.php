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
    $year = $request->get('year');
    $month = $request->get('month');

    $query = [
        'sort_by' => 'popularity.desc',
        'language' => $language,
        'api_key' => $apiKey,
        'page' => $page,
    ];

    // Agregar filtros si están presentes
    if ($year) {
        $query['primary_release_year'] = $year;
    }

    if ($year && $month) {
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);
        $query['primary_release_date.gte'] = "$year-$month-01";
        $query['primary_release_date.lte'] = "$year-$month-31";
    }

    $url = "$baseUrl/discover/movie";
    Log::channel('peliculas')->info("Llamando a TMDB: $url", $query);

    $response = Http::get($url, $query);

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

public function getUpcomingMovies(Request $request)
{
    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');
    $page = $request->get('page', 1);
    $year = $request->get('year');
    $month = $request->get('month');

    $query = [
        'language' => $language,
        'api_key' => $apiKey,
        'page' => $page,
        'sort_by' => 'popularity.desc',
        'primary_release_date.gte' => now()->format('Y-m-d'), // solo estrenos futuros desde hoy
    ];

    if ($year && $month) {
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);
        $query['primary_release_date.gte'] = "$year-$month-01";
        $query['primary_release_date.lte'] = date("Y-m-t", strtotime($query['primary_release_date.gte']));
    } elseif ($year && !$month) {
        $query['primary_release_date.gte'] = "$year-01-01";
        $query['primary_release_date.lte'] = "$year-12-31";
    }

    $url = "$baseUrl/discover/movie";
    Log::channel('peliculas')->info("Llamando a TMDB (próximas): $url", $query);

    $response = Http::get($url, $query);

    if ($response->successful()) {
        $movies = $response->json()['results'];
        $totalPages = $response->json()['total_pages'];

        Log::channel('peliculas')->info("Películas próximas recibidas", [
            'page' => $page,
            'count' => count($movies)
        ]);

        return response()->json([
            'status' => 'success',
            'movies' => $movies,
            'total_pages' => $totalPages
        ]);
    }

    Log::channel('peliculas')->error('Error al obtener películas próximas', [
        'status' => $response->status(),
        'body' => $response->body()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener las películas próximas'
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


public function searchMovie(Request $request)
{
    $query = $request->input('q'); // clave: 'q'

    if (!$query) {
        return response()->json(['status' => 'error', 'message' => 'Falta el parámetro de búsqueda'], 400);
    }

    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');

    // Primero, buscar en foro (tu catálogo local)
    $foroUrl = "$baseUrl/search/movie?query=" . urlencode($query) . "&language=$language&api_key=$apiKey&include_adult=false";

    Log::channel('peliculas')->info("🔍 Búsqueda foro: '$query' -> URL: $foroUrl");

    $foroResponse = Http::get($foroUrl);

    $foroPeliculas = [];
    if ($foroResponse->successful()) {
        $foroData = $foroResponse->json();
        $foroPeliculas = $foroData['results'] ?? [];
    }

    if (count($foroPeliculas) > 0) {
        Log::channel('peliculas')->info("✅ Resultados foro para '$query'", ['total' => count($foroPeliculas)]);

        return response()->json([
            'status' => 'success',
            'source' => 'foro',
            'results' => $foroPeliculas
        ]);
    }

    // Si no hay resultados en foro, buscar en TMDb (API externa)
    $apiUrl = "$baseUrl/search/movie?query=" . urlencode($query) . "&language=$language&api_key=$apiKey&include_adult=false";

    Log::channel('peliculas')->info("🔍 Búsqueda API externa: '$query' -> URL: $apiUrl");

    $apiResponse = Http::get($apiUrl);

    if ($apiResponse->successful()) {
        $apiMovies = $apiResponse->json()['results'];

        Log::channel('peliculas')->info("✅ Resultados API externa para '$query'", ['total' => count($apiMovies)]);

        return response()->json([
            'status' => 'success',
            'source' => 'api',
            'results' => $apiMovies
        ]);
    }

    Log::channel('peliculas')->error("❌ Error al buscar '$query'", [
        'status' => $apiResponse->status(),
        'body' => $apiResponse->body()
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
    $providersUrl = "$baseUrl/movie/$id/watch/providers?api_key=$apiKey";

    Log::channel('peliculas')->info("🎬 Detalles de la película ID $id");

    $detailsResponse = Http::get($detailsUrl);
    $videosResponse = Http::get($videosUrl);
    $providersResponse = Http::get($providersUrl);

    if ($detailsResponse->successful() && $videosResponse->successful() && $providersResponse->successful()) {
        $movieDetails = $detailsResponse->json();
        $videos = $videosResponse->json();
        $providers = $providersResponse->json();

        $trailer = collect($videos['results'])->first(function ($video) {
            return $video['type'] === 'Trailer' && $video['site'] === 'YouTube';
        });

        // Agregar trailer a detalles
        $movieDetails['trailer'] = $trailer ? 'https://www.youtube.com/embed/' . $trailer['key'] : null;

        // Obtener plataformas de providers
        // Por ejemplo para España sería 'ES' o usa un código de país dinámico
        $countryCode = 'ES'; // Cambia según lo que necesites o configúralo dinámico

        $platforms = [];
        if (isset($providers['results'][$countryCode]['flatrate'])) {
            $platforms = collect($providers['results'][$countryCode]['flatrate'])->pluck('provider_name')->toArray();
        } elseif (isset($providers['results'][$countryCode]['rent'])) {
            $platforms = collect($providers['results'][$countryCode]['rent'])->pluck('provider_name')->toArray();
        } elseif (isset($providers['results'][$countryCode]['buy'])) {
            $platforms = collect($providers['results'][$countryCode]['buy'])->pluck('provider_name')->toArray();
        }

        $movieDetails['platform'] = implode(', ', $platforms);

        Log::channel('peliculas')->info("✅ Detalles obtenidos de película ID $id", [
            'title' => $movieDetails['title'] ?? 'Sin título',
            'hasTrailer' => $movieDetails['trailer'] ? 'Sí' : 'No',
            'platforms' => $movieDetails['platform']
        ]);

        return response()->json([
            'status' => 'success',
            'movie_details' => $movieDetails
        ]);
    }

    Log::channel('peliculas')->error("❌ Error al obtener detalles de película ID $id", [
        'details_status' => $detailsResponse->status(),
        'videos_status' => $videosResponse->status(),
        'providers_status' => $providersResponse->status()
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener los detalles de la película'
    ], 500);
}


}