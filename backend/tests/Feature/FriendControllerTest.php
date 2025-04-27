<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class FriendControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_friend()
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/api/friends', [
            'friend_id' => $friend->id
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Amigo agregado']);
    }
}
