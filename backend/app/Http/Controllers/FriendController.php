<?php

namespace App\Http\Controllers;
use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $friends = User::whereIn('id', Friend::where('user_id', $user->id)->pluck('friend_id'))->get();

        return response()->json($friends);
    }

    public function store(Request $request)
{
    $request->validate(['friend_id' => 'required|exists:users,id']);

    $user = Auth::user();

    $friend = Friend::firstOrCreate([
        'user_id' => $user->id,
        'friend_id' => $request->friend_id
    ]);

    Log::channel('peliculas')->info('Amigo agregado correctamente', [
        'user_id' => $user->id,
        'friend_id' => $request->friend_id,
        'timestamp' => now()->toDateTimeString()
    ]);

    return response()->json(['message' => 'Amigo agregado']);
}

    

    public function getFriends($userId)
    {
        $friends = User::whereIn('id', Friend::where('user_id', $userId)->pluck('friend_id'))->get();
        return response()->json($friends);
    }


    public function destroy($friendId)
    {
        $user = Auth::user();

        Friend::where('user_id', $user->id)->where('friend_id', $friendId)->delete();

        return response()->json(['message' => 'Amigo eliminado']);
    }
}