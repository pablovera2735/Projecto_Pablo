<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request) 
    {
        $request->validate([
            'thread_id' => 'required|exists:threads,id',
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'thread_id' => $request->thread_id,
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id
        ]);

        // Registro del comentario en el log personalizado
        Log::channel('peliculas')->info('Nuevo comentario registrado', [
            'user_id' => auth()->id(),
            'thread_id' => $request->thread_id,
            'parent_id' => $request->parent_id,
            'es_respuesta' => $request->parent_id !== null,
            'timestamp' => now()->toDateTimeString(),
            'contenido' => $request->content
        ]);
    
        // Cargar relaciones según si es comentario o respuesta
        if ($request->parent_id) {
            return $comment->load('user');
        } else {
            return $comment->load(['user', 'replies']);
        }
    }
}
