<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_login_with_correct_credentials()
    {
        // Crear usuario con contraseña hasheada
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Intentar login
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Validar respuesta
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'accessToken',
                         'token_type',
                         'user' => ['id', 'name', 'email']
                     ]
                 ]);
    }

    /** @test */
    public function login_fails_with_invalid_credentials()
    {
        // Crear usuario
        $user = User::factory()->create();

        // Intentar login con contraseña incorrecta
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        // Validar respuesta
        $response->assertStatus(401)
                 ->assertJson([
                     'message' => 'Credenciales incorrectas'
                 ]);
    }
}
