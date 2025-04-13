<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListModel extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'name'];

    public function movies()
    {
        return $this->hasMany(ListMovie::class, 'list_id');
    }
}
