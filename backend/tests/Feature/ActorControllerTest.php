<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ActorControllerTest extends TestCase
{
    /** @test */
    public function it_fetches_popular_actors()
    {
        $response = $this->getJson('/api/people/popular');
        $response->assertStatus(200);
    }
}
