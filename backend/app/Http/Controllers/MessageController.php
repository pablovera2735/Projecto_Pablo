<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
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

        return response()->json($messages);
    }


    public function markAsRead(Request $request)
{
    $authId = Auth::id();

    // Marcar como leídos todos los mensajes enviados por $request->sender_id a $authId
    Message::where('sender_id', $request->sender_id)
           ->where('recipient_id', $authId)
           ->where('read', false)
           ->update(['read' => true]);

    return response()->json(['success' => true, 'message' => 'Mensajes marcados como leídos']);
}

public function ping()
{
    $user = Auth::user();
    Cache::put('user-is-online-' . $user->id, true, now()->addMinutes(2));
    return response()->noContent();
}


public function isOnline($id)
{
    return response()->json([
        'is_online' => Cache::has('user-is-online-' . $id)
    ]);
}


}
