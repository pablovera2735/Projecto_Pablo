<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Thread;

class ThreadController extends Controller
{
    public function showOrCreate($movieId)
    {
        $thread = Thread::firstOrCreate(
            ['movie_id' => $movieId],
            ['title' => 'Discusión de Película']
        );

        return response()->json($thread->load(['comments.replies', 'comments.user']));
    }
}