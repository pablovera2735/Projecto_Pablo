<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ActorController extends Controller
{
    public function getPopularActors(Request $request)
    {
        $page = $request->input('page', 1);

        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');

        $url = "$baseUrl/person/popular?language=$language&api_key=$apiKey&page=$page";

        Log::channel('daily')->info("Obteniendo actores populares desde TMDB: $url");

        $response = Http::get($url);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        Log::channel('daily')->error('Error al obtener actores populares', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'No se pudieron obtener los actores populares',
        ], 500);
    }
}
