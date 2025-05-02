<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Thread;

class ThreadController extends Controller
{
    public function showOrCreate($movieId)
    {
        $thread = Thread::firstOrCreate(
            ['movie_id' => $movieId],
            ['title' => 'Discusión de Película']
        );

        // Cargar comentarios principales y sus respuestas con usuarios
        $thread->load(['comments' => function($query) {
            $query->whereNull('parent_id')
                  ->with(['replies.user', 'user']);
        }]);

        return response()->json($thread);
    }
}