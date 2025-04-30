<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function getAllUsers()
    {
        if (Auth::user()->email !== 'admin@mail.com') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    public function deleteUser($id)
    {
        if (Auth::user()->email !== 'admin@mail.com') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if (Auth::id() == $id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    public function makeAdmin($id)
    {
        if (Auth::user()->email !== 'admin@mail.com') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);
        $user->email = 'admin_' . $user->email;
        $user->save();

        return response()->json(['message' => 'Usuario promovido']);
    }
}
