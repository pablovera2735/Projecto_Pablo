<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileComment extends Model
{
    use HasFactory;

    protected $fillable = ['profile_user_id', 'author_id', 'content'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}