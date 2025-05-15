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
    // Obtener amigos actuales del usuario autenticado
    public function index()
    {
        $user = Auth::user();

        $friendIds = Friend::where('user_id', $user->id)->pluck('friend_id');
        $friends = User::whereIn('id', $friendIds)->get();

        return response()->json($friends);
    }

    // Enviar solicitud de amistad
    public function store(Request $request)
    {
        $request->validate(['friend_id' => 'required|exists:users,id']);

        $user = Auth::user();

        // Evitar enviar solicitud a sí mismo
        if ($user->id == $request->friend_id) {
            return response()->json(['error' => 'No puedes enviarte una solicitud a ti mismo'], 400);
        }

        // Revisar si ya hay una solicitud pendiente o aceptada
        $exists = DB::table('friend_requests')->where(function ($query) use ($user, $request) {
            $query->where('sender_id', $user->id)->where('receiver_id', $request->friend_id);
        })->orWhere(function ($query) use ($user, $request) {
            $query->where('sender_id', $request->friend_id)->where('receiver_id', $user->id);
        })->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya existe una solicitud de amistad'], 409);
        }

        // Crear solicitud
        DB::table('friend_requests')->insert([
            'sender_id' => $user->id,
            'receiver_id' => $request->friend_id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::channel('peliculas')->info('Solicitud de amistad enviada', [
            'user_id' => $user->id,
            'friend_id' => $request->friend_id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Solicitud de amistad enviada']);
    }

    // Obtener solicitudes pendientes
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

    // Aceptar solicitud de amistad
    public function acceptFriendRequest(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|exists:users,id',
        ]);

        $user = auth()->user();

        // Verificar si la solicitud realmente existe
        $exists = DB::table('friend_requests')
            ->where('receiver_id', $user->id)
            ->where('sender_id', $request->sender_id)
            ->where('status', 'pending')
            ->exists();

        if (!$exists) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        // Aceptar solicitud
        DB::table('friend_requests')
            ->where('receiver_id', $user->id)
            ->where('sender_id', $request->sender_id)
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        // Agregar a la tabla de amigos (ambas direcciones)
        DB::table('friends')->insert([
            ['user_id' => $user->id, 'friend_id' => $request->sender_id, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => $request->sender_id, 'friend_id' => $user->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        return response()->json(['message' => 'Solicitud aceptada']);
    }

    // Rechazar solicitud de amistad
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

        return response()->json(['message' => 'Solicitud rechazada']);
    }

    // Obtener amigos de otro usuario
    public function getFriends($userId)
    {
        $friends = User::whereIn('id', Friend::where('user_id', $userId)->pluck('friend_id'))->get();
        return response()->json($friends);
    }

    // Eliminar amigo
    public function destroy($friendId)
    {
        $user = Auth::user();

        Friend::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $user->id);
        })->delete();

        return response()->json(['message' => 'Amigo eliminado']);
    }
}
