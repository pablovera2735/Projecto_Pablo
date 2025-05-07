<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    public function index($userId)
    {
        return response()->json([
            'favorites' => Favorite::where('user_id', $userId)->get()
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required',
            'title' => 'required',
            'poster_path' => 'nullable'
        ]);
    
        $favorite = Favorite::create([
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'title' => $request->title,
            'poster_path' => $request->poster_path
        ]);
    
        return response()->json($favorite);
    }
    
    public function destroy($movieId)
{
    $userId = auth()->id(); // 🔐 Usa el usuario autenticado

    $favorite = Favorite::where('user_id', $userId)
        ->where('movie_id', $movieId)
        ->first();

    if (!$favorite) {
        return response()->json(['message' => 'Favorite not found'], 404);
    }

    $favorite->delete();

    return response()->json(['message' => 'Eliminado']);
}



}