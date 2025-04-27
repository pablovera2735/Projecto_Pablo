<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class ListControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_list()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson('/api/lists', [
            'name' => 'Mi Lista'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('name', 'Mi Lista');
    }
}
