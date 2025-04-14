<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'movie_id', 'rating', 'comment',
    ];

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
