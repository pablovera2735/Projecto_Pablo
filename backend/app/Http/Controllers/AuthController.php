<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\ProfileComment;
use App\Mail\CustomResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
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
        'is_admin' => 0,
    ]);

    Log::channel('peliculas')->info('Nuevo usuario registrado', [
        'user_id' => $user->id,
        'email' => $user->email
    ]);

    // 🔐 Dispara el evento de verificación de email
    event(new Registered($user));

    return response()->json([
        'message' => 'Cuenta creada correctamente. Revisa tu correo para verificar la cuenta.',
        'user' => $user
    ]);
}


public function verifyEmail(Request $request, $id, $hash)
{
    $user = User::findOrFail($id);

    // Validar que la URL tenga firma válida
    if (! URL::hasValidSignature($request)) {
        return response()->json(['message' => 'Firma inválida.'], 403);
    }

    // Validar que el hash coincida con el email del usuario
    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Hash inválido.'], 403);
    }

    // Si ya está verificado
    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Correo ya verificado.']);
    }

    // Marcar email como verificado
    $user->markEmailAsVerified();

    event(new Verified($user));

    return response()->json(['message' => 'Correo verificado correctamente.']);
}



    public function getProfileComments($userId)
    {
        $comments = ProfileComment::where('profile_user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function getPublicUserProfile($id)
{
    $user = User::with(['comments', 'favorites', 'friends', 'reviews'])->findOrFail($id);

    return response()->json([
        'name' => $user->name,
        'profile_photo' => $user->profile_photo,
        'favorites' => $user->favorites,
        'reviews' => $user->reviews,
        'comments' => $user->comments,
        'friends' => $user->friends->map(function ($friend) {
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'profile_photo' => $friend->profile_photo
            ];
        }),
    ]);
}




    public function storeProfileComment(Request $request)
    {
        $request->validate([
            'profile_user_id' => 'required|exists:users,id',
            'content' => 'required|string|max:1000'
        ]);
    
        $comment = ProfileComment::create([
            'profile_user_id' => $request->profile_user_id,
            'author_id' => auth()->id(),
            'content' => $request->content
        ]);
    
        return response()->json([
            'message' => 'Comentario enviado correctamente',
            'comment' => $comment
        ], 201);
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


public function updateEmail(Request $request)
{
    $request->validate([
        'email' => 'required|email|unique:users,email',
    ]);

    $user = $request->user();
    $newEmail = $request->email;

    // Generar código de 6 dígitos
    $code = rand(100000, 999999);

    // Guardar temporalmente en cache (15 minutos)
    Cache::put("email_change_{$user->id}", [
        'new_email' => $newEmail,
        'code' => $code,
    ], now()->addMinutes(15));

    // Enviar código al nuevo correo
    Mail::raw("Tu código para cambiar el correo es: {$code}", function ($message) use ($newEmail) {
        $message->to($newEmail)
                ->subject('Código de verificación para cambio de correo');
    });

    return response()->json(['message' => 'Código enviado al nuevo correo.']);
}


public function confirmEmailChange(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'code' => 'required|digits:6',
    ]);

    $user = $request->user();
    $key = "email_change_{$user->id}";

    if (!Cache::has($key)) {
        return response()->json(['message' => 'No hay solicitud de cambio o el código expiró.'], 400);
    }

    $data = Cache::get($key);

    if ($data['new_email'] !== $request->email || $data['code'] != $request->code) {
        return response()->json(['message' => 'Código inválido o el correo no coincide.'], 400);
    }

    // Actualizar email
    $user->email = $data['new_email'];
    $user->email_verified_at = null; // invalidar verificación si usas verificación de email
    $user->save();

    Cache::forget($key);

    // Opcional: enviar verificación
    event(new Registered($user));

    return response()->json(['message' => 'Correo actualizado. Verifica tu nuevo correo.']);
}



public function updatePassword(Request $request)
{
    $user = $request->user();

    $validator = Validator::make($request->all(), [
        'current_password' => 'required',
        'password' => 'required|string|min:8|confirmed',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['message' => 'La contraseña actual no es correcta'], 400);
    }

    $user->password = Hash::make($request->password);
    $user->save();

    return response()->json(['message' => 'Contraseña actualizada exitosamente']);
}



public function sendResetPassword(Request $request)
{
    $request->validate(['email' => 'required|email|exists:users']);

    // Generar un código aleatorio de 4 dígitos
    $codigo = rand(1000, 9999);

    // Eliminar registros anteriores asociados al email en la tabla password_resets
    DB::table('password_resets')->where(['email' => $request->email])->delete();

    // Insertar el nuevo código en la tabla password_resets
    DB::table('password_resets')->insert([
        'email' => $request->email,
        'token' => $codigo,
        'created_at' => Carbon::now()
    ]);

    // Enviar el código por correo al usuario
    Mail::to($request->email)->send(new CustomResetPassword($codigo));

    return response()->json(['message' => 'Correo de recuperación enviado.']);
}


public function resetPasswordWithCode(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'code' => 'required|string',
        'new_password' => 'required|string|min:8|confirmed',
    ]);

    // Buscar el código en la tabla de password_resets
    $record = DB::table('password_resets')
        ->where('email', $request->email)
        ->where('token', $request->code)
        ->first();

    // Verificar si el código es válido
    if (!$record) {
        return response()->json(['message' => 'Código inválido o expirado'], 400);
    }

    // Actualizar la contraseña del usuario en la tabla users
    User::where('email', $request->email)->update([
        'password' => Hash::make($request->new_password)
    ]);

    // Eliminar el código usado
    DB::table('password_resets')->where('email', $request->email)->delete();

    return response()->json(['message' => 'Contraseña actualizada correctamente']);
}

public function profile(Request $request)
{
    return response()->json(['email' => $request->user()->email]);
}


    public function logout()
    {
        auth()->user()->tokens()->delete();
        return ['message' => 'Usuario deslogado'];
    }
}