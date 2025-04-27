<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_stores_a_review()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson('/api/reviews', [
            'movie_id' => 123,
            'rating' => 9,
            'comment' => 'Gran película'
        ]);

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Reseña guardada correctamente']);
    }
}
