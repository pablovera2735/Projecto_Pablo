<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WatchedMovie extends Model
{
    protected $table = 'watched_movies'; // o 'watched' si así se llama tu tabla
    protected $fillable = ['user_id', 'movie_id'];
    public $timestamps = true;
}