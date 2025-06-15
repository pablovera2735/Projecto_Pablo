<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    // Middleware para asegurar autenticación
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Enviar mensaje
    public function send(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id|not_in:' . Auth::id(),
            'message' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'message' => $request->message,
        ]);

        Log::channel('peliculas')->info('Mensaje enviado', [
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'timestamp' => now()->toDateTimeString(),
            'message_id' => $message->id
        ]);

        return response()->json(['success' => true, 'message' => 'Mensaje enviado correctamente']);
    }

    // Obtener mensajes entre usuario actual y otro usuario
    public function conversation($userId)
    {
        $authId = Auth::id();

        $messages = Message::where(function($q) use ($authId, $userId) {
            $q->where('sender_id', $authId)->where('recipient_id', $userId);
        })->orWhere(function($q) use ($authId, $userId) {
            $q->where('sender_id', $userId)->where('recipient_id', $authId);
        })->orderBy('created_at', 'asc')->get();

        Log::channel('peliculas')->info('Conversación cargada', [
            'user_id' => $authId,
            'with_user_id' => $userId,
            'total_messages' => $messages->count(),
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json($messages);
    }

    public function markAsRead(Request $request)
    {
        $authId = Auth::id();

        $updated = Message::where('sender_id', $request->sender_id)
            ->where('recipient_id', $authId)
            ->where('read', false)
            ->update(['read' => true]);

        Log::channel('peliculas')->info('Mensajes marcados como leídos', [
            'auth_user_id' => $authId,
            'from_user_id' => $request->sender_id,
            'mensajes_actualizados' => $updated,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['success' => true, 'message' => 'Mensajes marcados como leídos']);
    }

    public function ping()
    {
        $user = Auth::user();
        Cache::put('user-is-online-' . $user->id, true, now()->addMinutes(2));

        Log::channel('peliculas')->info('Ping de usuario activo', [
            'user_id' => $user->id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->noContent();
    }

    public function isOnline($id)
    {
        $isOnline = Cache::has('user-is-online-' . $id);

        Log::channel('peliculas')->info('Consulta de estado online', [
            'consultado_id' => $id,
            'estado_online' => $isOnline,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json([
            'is_online' => $isOnline
        ]);
    }
}
