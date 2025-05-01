<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PeopleController extends Controller
{
    public function getAllPeople(Request $request)
{
    $page = $request->input('page', 1); // Valor predeterminado = 1

    $apiKey = config('services.tmdb.api_key');
    $baseUrl = config('services.tmdb.base_url');
    $language = config('services.tmdb.language');

    // Realizamos la consulta a TMDB para obtener personas populares
    $url = "$baseUrl/person/popular?language=$language&api_key=$apiKey&page=$page";

    Log::channel('daily')->info("Obteniendo personas populares desde TMDB: $url");

    $response = Http::get($url);

    if ($response->successful()) {
        // Aquí obtenemos todos los resultados de personas sin filtrarlos por departamento
        $people = $response->json()['results'];

        // Si lo deseas, puedes mezclar los resultados (por ejemplo, si tienes otros resultados de otros roles)
        // Aquí, estamos simplemente devolviendo los resultados tal cual sin hacer filtros adicionales

        return response()->json([
            'people' => $people,
            'total_pages' => $response->json()['total_pages'],
            'total_results' => $response->json()['total_results'],
        ]);
    }

    Log::channel('daily')->error('Error al obtener personas populares', [
        'status' => $response->status(),
        'body' => $response->body(),
    ]);

    return response()->json([
        'status' => 'error',
        'message' => 'No se pudieron obtener las personas populares',
    ], 500);
}

}
