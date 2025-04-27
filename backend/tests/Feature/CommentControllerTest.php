<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Thread;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_stores_a_comment()
    {
        $user = User::factory()->create();
        $thread = Thread::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/api/comments', [
            'thread_id' => $thread->id,
            'content' => 'Comentario de prueba'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('content', 'Comentario de prueba');
    }
}
