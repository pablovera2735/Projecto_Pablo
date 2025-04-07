<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Thread extends Model
{
    use HasFactory;

    protected $fillable = ['movie_id', 'title'];

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}