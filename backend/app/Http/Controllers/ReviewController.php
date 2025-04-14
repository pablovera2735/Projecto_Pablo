<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Obtener todas las reseñas de una película (sin usar modelo Movie)
    public function index($id)
    {
        $reviews = Review::with('user') // Incluye la info del usuario que dejó la reseña
                ->where('movie_id', $id)
                ->latest()
                ->get();

        return response()->json(['reviews' => $reviews]);
    }

    // Guardar una nueva reseña
    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|integer', // Quitamos el exists:movies,id
            'rating' => 'required|numeric|min:1|max:10', // max 10 para que coincida con el frontend
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = new Review();
        $review->user_id = auth()->id();
        $review->movie_id = $request->movie_id;
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        return response()->json(['message' => 'Reseña guardada correctamente'], 201);
    }
}