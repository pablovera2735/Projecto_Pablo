<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListMovie extends Model
{
    use HasFactory;
    protected $fillable = ['list_id', 'movie_id', 'title', 'poster_path'];

    public function list()
    {
        return $this->belongsTo(ListModel::class, 'list_id');
    }
}
