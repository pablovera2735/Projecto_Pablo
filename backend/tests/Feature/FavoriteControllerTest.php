<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class FavoriteControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_adds_a_favorite()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson('/api/favorites', [
            'movie_id' => 100,
            'title' => 'Peli test'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('movie_id', 100);
    }
}