<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ListModel;
use App\Models\ListMovie;

class ListController extends Controller
{
    public function index($userId)
    {
        $lists = ListModel::with('movies')->where('user_id', $userId)->get();

        Log::channel('peliculas')->info('Usuario consultó sus listas', [
            'user_id' => $userId,
            'cantidad_listas' => count($lists),
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['lists' => $lists]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $list = ListModel::create([
            'user_id' => auth()->id(),
            'name' => $request->name
        ]);

        Log::channel('peliculas')->info('Lista creada', [
            'user_id' => auth()->id(),
            'list_id' => $list->id,
            'list_name' => $list->name,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($list);
    }

    public function addMovie(Request $request, $listId)
    {
        $request->validate([
            'movie_id' => 'required',
            'title' => 'required',
            'poster_path' => 'nullable'
        ]);

        $list = ListModel::findOrFail($listId);

        if ($list->user_id !== auth()->id()) {
            Log::channel('peliculas')->warning('Intento no autorizado de agregar película a lista ajena', [
                'user_id' => auth()->id(),
                'list_owner_id' => $list->user_id,
                'list_id' => $listId,
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $movie = ListMovie::create([
            'list_id' => $listId,
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'poster_path' => $request->poster_path
        ]);

        Log::channel('peliculas')->info('Película agregada a lista', [
            'user_id' => auth()->id(),
            'list_id' => $listId,
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($movie);
    }
}
