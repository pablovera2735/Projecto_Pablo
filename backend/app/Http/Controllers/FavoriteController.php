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
        // Obtener los favoritos del usuario
        $favorites = Favorite::where('user_id', $userId)->get();

        // API TMDB configuraciones
        $apiKey = config('services.tmdb.api_key');
        $baseUrl = config('services.tmdb.base_url');
        $language = config('services.tmdb.language');
        
        // Crear un array para almacenar las películas con sus posters
        $moviesWithPosters = [];

        // Recorrer los favoritos y obtener el poster_path de cada película
        foreach ($favorites as $favorite) {
            $movieId = $favorite->movie_id; // Suponiendo que tienes movie_id en la tabla favoritos
            $detailsUrl = "$baseUrl/movie/$movieId?language=$language&api_key=$apiKey";

            // Obtener los detalles de la película desde TMDB
            $detailsResponse = Http::get($detailsUrl);

            // Verificar que la respuesta sea exitosa
            if ($detailsResponse->successful()) {
                $movieDetails = $detailsResponse->json();

                // Obtener el poster_path de la película, si existe
                $posterPath = $movieDetails['poster_path'] ?? null;

                // Agregar la película al array con poster
                $moviesWithPosters[] = [
                    'id' => $movieId,
                    'title' => $movieDetails['title'],
                    'poster_path' => $posterPath ? "https://image.tmdb.org/t/p/w92{$posterPath}" : null, // Formateamos la URL de la imagen
                ];
            } else {
                // Log para errores de la API
                Log::error("No se pudo obtener detalles para la película ID $movieId desde TMDB", [
                    'status' => $detailsResponse->status(),
                    'message' => $detailsResponse->body()
                ]);
            }
        }

        // Devolver los favoritos con los posters
        return response()->json([
            'favorites' => $moviesWithPosters
        ]);
    }

    public function store(Request $request)
    {
        // Validación de los datos de entrada
        $request->validate([
            'movie_id' => 'required',
            'title' => 'required',
            'poster_path' => 'nullable'
        ]);
    
        // Crear un nuevo favorito
        $favorite = Favorite::create([
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'poster_path' => $request->poster_path
        ]);
    
        return response()->json($favorite, 201); // Se especifica el código de estado 201 para indicar que se ha creado correctamente
    }
    
    public function destroy($movieId)
    {
        // Obtener el usuario autenticado
        $userId = auth()->id();

        // Buscar el favorito a eliminar
        $favorite = Favorite::where('user_id', $userId)
            ->where('movie_id', $movieId)
            ->first();

        // Si no se encuentra el favorito
        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }

        // Eliminar el favorito
        $favorite->delete();

        return response()->json(['message' => 'Eliminado'], 200); // Respuesta con código 200
    }
}
