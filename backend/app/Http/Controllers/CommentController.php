<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
    
        // Cargar relaciones según si es comentario o respuesta
        if ($request->parent_id) {
            return $comment->load('user');
        } else {
            return $comment->load(['user', 'replies']);
        }
    }
}