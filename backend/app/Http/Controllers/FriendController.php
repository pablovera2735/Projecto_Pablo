<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $friendIds = Friend::where('user_id', $user->id)->pluck('friend_id');
        $friends = User::whereIn('id', $friendIds)->get();

        Log::channel('peliculas')->info('Usuario consultó su lista de amigos', [
            'user_id' => $user->id,
            'cantidad_amigos' => count($friends),
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($friends);
    }

    public function store(Request $request)
    {
        $request->validate(['friend_id' => 'required|exists:users,id']);

        $user = Auth::user();

        if ($user->id == $request->friend_id) {
            return response()->json(['error' => 'No puedes enviarte una solicitud a ti mismo'], 400);
        }

        $exists = DB::table('friend_requests')->where(function ($query) use ($user, $request) {
            $query->where('sender_id', $user->id)->where('receiver_id', $request->friend_id);
        })->orWhere(function ($query) use ($user, $request) {
            $query->where('sender_id', $request->friend_id)->where('receiver_id', $user->id);
        })->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya existe una solicitud de amistad'], 409);
        }

        DB::table('friend_requests')->insert([
            'sender_id' => $user->id,
            'receiver_id' => $request->friend_id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::channel('peliculas')->info('Solicitud de amistad enviada', [
            'sender_id' => $user->id,
            'receiver_id' => $request->friend_id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Solicitud de amistad enviada']);
    }

    public function getPendingRequests()
    {
        $user = auth()->user();

        $pendingRequests = DB::table('friend_requests')
            ->join('users', 'users.id', '=', 'friend_requests.sender_id')
            ->where('friend_requests.receiver_id', $user->id)
            ->where('friend_requests.status', 'pending')
            ->select('users.id', 'users.name', 'users.profile_photo', 'friend_requests.created_at')
            ->get();

        return response()->json($pendingRequests);
    }

    public function acceptFriendRequest(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|exists:users,id',
        ]);

        $user = auth()->user();

        $exists = DB::table('friend_requests')
            ->where('receiver_id', $user->id)
            ->where('sender_id', $request->sender_id)
            ->where('status', 'pending')
            ->exists();

        if (!$exists) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        DB::table('friend_requests')
            ->where('receiver_id', $user->id)
            ->where('sender_id', $request->sender_id)
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        DB::table('friends')->insert([
            ['user_id' => $user->id, 'friend_id' => $request->sender_id, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => $request->sender_id, 'friend_id' => $user->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Log::channel('peliculas')->info('Solicitud de amistad aceptada', [
            'user_id' => $user->id,
            'sender_id' => $request->sender_id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Solicitud aceptada']);
    }

    public function rejectFriendRequest(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|exists:users,id',
        ]);

        $user = auth()->user();

        DB::table('friend_requests')
            ->where('receiver_id', $user->id)
            ->where('sender_id', $request->sender_id)
            ->delete();

        Log::channel('peliculas')->info('Solicitud de amistad rechazada', [
            'user_id' => $user->id,
            'sender_id' => $request->sender_id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Solicitud rechazada']);
    }

    public function getFriends($userId)
    {
        $friends = User::whereIn('id', Friend::where('user_id', $userId)->pluck('friend_id'))->get();

        Log::channel('peliculas')->info('Se consultaron los amigos de otro usuario', [
            'solicitante_id' => auth()->id(),
            'usuario_objetivo' => $userId,
            'cantidad_amigos' => count($friends),
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($friends);
    }

    public function destroy($friendId)
    {
        $user = Auth::user();

        Friend::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $user->id);
        })->delete();

        Log::channel('peliculas')->info('Amigo eliminado', [
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Amigo eliminado']);
    }
}
