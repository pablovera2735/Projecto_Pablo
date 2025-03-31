<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
            'toke_type' => 'Bearer',
            'user' => $user]
        ]);
    }


public function register(Request $request)
{
    // Validación de campos
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed' // Confirmación integrada
    ]);

    // Crear el nuevo usuario en la base de datos
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password)
    ]);

    // Crear el token de acceso
    $token = $user->createToken('auth_token')->plainTextToken;

    // Respuesta con los datos del nuevo usuario
    return response()->json(['data' => [
        'accessToken' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]]);
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
