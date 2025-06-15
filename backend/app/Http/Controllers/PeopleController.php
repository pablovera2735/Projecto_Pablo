<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PeopleController extends Controller
{
    public function getAllPeople(Request $request)
    {
        $page = $request->input('page', 1);
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        $url = "$baseUrl/person/popular?language=$language&api_key=$apiKey&page=$page";
        Log::channel('peliculas')->info("Obteniendo personas populares desde TMDB: $url");

        $response = Http::get($url);

        if ($response->successful()) {
            $people = $response->json()['results'];
            return response()->json([
                'people' => $people,
                'total_pages' => $response->json()['total_pages'],
                'total_results' => $response->json()['total_results'],
            ]);
        }

        Log::channel('peliculas')->error('Error al obtener personas populares', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'No se pudieron obtener las personas populares',
        ], 500);
    }

    public function getPersonDetail($id)
    {
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        $url = "$baseUrl/person/$id?language=$language&api_key=$apiKey";
        Log::channel('peliculas')->info("Obteniendo detalles de la persona ID $id desde TMDB: $url");

        $response = Http::get($url);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        Log::channel('peliculas')->error("Error al obtener detalles de la persona ID $id", [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return response()->json(['message' => 'No se pudo obtener el detalle de la persona'], 500);
    }

    public function getPersonCredits($id)
    {
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        $url = "$baseUrl/person/$id/combined_credits?language=$language&api_key=$apiKey";
        Log::channel('peliculas')->info("Obteniendo créditos de la persona ID $id desde TMDB: $url");

        $response = Http::get($url);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        Log::channel('peliculas')->error("Error al obtener créditos de la persona ID $id", [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return response()->json(['message' => 'No se pudieron obtener los créditos de la persona'], 500);
    }

    public function searchPerson(Request $request)
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        $url = "$baseUrl/search/person?language=$language&api_key=$apiKey&query=" . urlencode($query);

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                return response()->json(['results' => $response->json()['results'] ?? []]);
            }

            Log::channel('peliculas')->error('TMDB API failed', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return response()->json(['message' => 'Error consultando TMDB'], 500);
        } catch (\Exception $e) {
            Log::channel('peliculas')->error('Error buscando persona', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error interno del servidor'], 500);
        }
    }
}
