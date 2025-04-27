<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ThreadControllerTest extends TestCase
{
    /** @test */
    public function it_creates_or_gets_a_thread()
    {
        $response = $this->getJson('/api/threads/555');
        $response->assertStatus(200)
                 ->assertJsonPath('movie_id', 555);
    }
}