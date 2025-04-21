<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Mail\CustomResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        //validaciones de campos que viajan en la request
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        //en caso de cumplir las validaciones, se comprueban las credenciales
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        //en caso de credenciales correctas, se recupera la información del usuario
        $user = User::where('email', $request['email'])->firstOrFail();

        //se crea y almacena el token de autenticación
        $token = $user->createToken('auth_token')->plainTextToken;

        //se devuelve respuesta con los datos del usuario logado 
        return response()->json(['data'=> [
            'accessToken' => $token,
            'token_type' => 'Bearer',
            'user' => $user]
        ]);
    }


    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed'
        ]);
    
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_photo' => 'Perfil_Inicial.jpg',
            'default_photo' => true,
        ]);
    
        Log::channel('daily')->info('Nuevo usuario registrado', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    
        $token = $user->createToken('auth_token')->plainTextToken;
    
        return response()->json(['data' => [
            'accessToken' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]]);
    }    


public function getUserProfile($id)
{
    $user = User::with('comments')->findOrFail($id);

    return response()->json([
        'name' => $user->name,
        'profile_photo' => $user->profile_photo, // Asegúrate de que este campo exista
        'comments' => $user->comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at->toDateTimeString(),
            ];
        }),
    ]);
}

public function uploadProfilePhoto(Request $request)
{
    $request->validate([
        'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $user = auth()->user();

    $file = $request->file('photo');
    $filename = time() . '_' . $file->getClientOriginalName();
    $file->move(public_path('uploads/avatars'), $filename);

    $user->profile_photo = 'uploads/avatars/' . $filename;
    $user->default_photo = false;
    $user->save();

    return response()->json([
        'message' => 'Foto de perfil actualizada',
        'profile_photo' => $user->profile_photo,
    ]);
}

public function deleteProfilePhoto(Request $request)
{
    $user = auth()->user();

    // Eliminar archivo actual si no es el predeterminado
    if (!$user->default_photo && $user->profile_photo && file_exists(public_path($user->profile_photo))) {
        unlink(public_path($user->profile_photo));
    }

    // Restaurar valores por defecto
    $user->profile_photo = 'Perfil_Inicial.jpg';
    $user->default_photo = true;
    $user->save();

    return response()->json([
        'message' => 'Foto de perfil eliminada',
        'profile_photo' => $user->profile_photo
    ]);
}



public function sendResetPassword(Request $request)
{
    $request->validate(['email' => 'required|email|exists:users']);

    // Generar un código aleatorio de 4 dígitos como nueva contraseña
    $codigo = rand(1000, 9999);

    // Eliminar registros anteriores asociados al email en la tabla password_resets
    DB::table('password_resets')->where(['email' => $request->email])->delete();

    // Actualizar la contraseña del usuario en la tabla users
    DB::table('users')->where('email', $request->email)->update([
        'password' => Hash::make($codigo)  // Guardar la nueva contraseña hasheada
    ]);

    // Insertar el nuevo código en la tabla password_resets
    DB::table('password_resets')->insert([
        'email' => $request->email,
        'token' => $codigo,
        'created_at' => Carbon::now()
    ]);


    Mail::to($request->email)->send(new CustomResetPassword($codigo));

    return response()->json(['message' => 'Correo de recuperación enviado.']);
}

    public function logout()
    {
        auth()->user()->tokens()->delete();
        return ['message' => 'Usuario deslogado'];
    }
}
