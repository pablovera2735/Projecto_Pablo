<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
    
    public function destroy($id)
    {
        $favorite = Favorite::findOrFail($id);
    
        if ($favorite->user_id != auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    
        $favorite->delete();
    
        return response()->json(['message' => 'Eliminado']);
    }
}
