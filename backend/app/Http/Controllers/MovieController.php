<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MovieController extends Controller
{
    // Obtener las películas populares
    public function getPopularMovies(Request $request)
    {
        // Obtener configuraciones desde services.php
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        // Obtener el número de página desde la solicitud, por defecto será la página 1
        $page = $request->get('page', 1);

        // Endpoint de películas populares con paginación
        $url = "$baseUrl/discover/movie?sort_by=popularity.desc&language=$language&api_key=$apiKey&page=$page";

        // Consumir la API de TMDb
        $response = Http::get($url);

        // Verificar si la solicitud fue exitosa
        if ($response->successful()) {
            $movies = $response->json()['results'];
            $totalPages = $response->json()['total_pages'];  // Total de páginas disponibles

            return response()->json([
                'status' => 'success',
                'movies' => $movies,
                'total_pages' => $totalPages
            ]);
        }

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

    // Obtener películas por género
    public function getMoviesByGenre(Request $request, $genreId)
    {
        // Obtener configuraciones desde services.php
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        // Obtener el número de página desde la solicitud, por defecto será la página 1
        $page = $request->get('page', 1);

        // Endpoint para obtener películas por género con paginación
        $url = "$baseUrl/discover/movie?with_genres=$genreId&language=$language&api_key=$apiKey&page=$page";

        // Consumir la API de TMDb
        $response = Http::get($url);

        // Verificar si la solicitud fue exitosa
        if ($response->successful()) {
            $movies = $response->json()['results'];
            $totalPages = $response->json()['total_pages'];  // Total de páginas disponibles

            return response()->json([
                'status' => 'success',
                'movies' => $movies,
                'total_pages' => $totalPages
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No se pudieron obtener las películas por género'
        ], 500);
    }

    // Búsqueda de películas por nombre
    public function searchMovie(Request $request)
    {
        // Validar la solicitud para que tenga un parámetro 'query'
        $request->validate([
            'query' => 'required|string'
        ]);

        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');
        $query = $request->input('query');

        // Endpoint para buscar películas
        $url = "$baseUrl/search/movie?query=$query&language=$language&api_key=$apiKey";

        // Consumir la API de TMDb
        $response = Http::get($url);

        // Verificar si la solicitud fue exitosa
        if ($response->successful()) {
            $movies = $response->json()['results'];

            return response()->json([
                'status' => 'success',
                'movies' => $movies
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No se pudieron obtener los resultados de la búsqueda'
        ], 500);
    }

    // Obtener detalles de una película
    public function getMovieDetails($id)
    {
        // Obtener configuraciones desde services.php
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        // Endpoint para obtener detalles de la película
        $url = "$baseUrl/movie/$id?language=$language&api_key=$apiKey";

        // Consumir la API de TMDb
        $response = Http::get($url);

        // Verificar si la solicitud fue exitosa
        if ($response->successful()) {
            $movieDetails = $response->json();

            return response()->json([
                'status' => 'success',
                'movie_details' => $movieDetails
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No se pudieron obtener los detalles de la película'
        ], 500);
    }
}
