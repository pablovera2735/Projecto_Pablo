<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo',
        'default_photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // 🔹 Comentarios
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // 🔹 Favoritos
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    // 🔹 Reseñas
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // 🔹 Actividades (películas visitadas, etc.)
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
