<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ListModel;
use App\Models\ListMovie;

class ListController extends Controller
{
    public function index($userId)
{
    $lists = ListModel::with('movies')->where('user_id', $userId)->get();
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
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $movie = ListMovie::create([
        'list_id' => $listId,
        'movie_id' => $request->movie_id,
        'title' => $request->title,
        'poster_path' => $request->poster_path
    ]);

    return response()->json($movie);
}
}
