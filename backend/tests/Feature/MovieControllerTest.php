<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MovieControllerTest extends TestCase
{
    /** @test */
    public function it_gets_popular_movies()
    {
        $response = $this->getJson('/api/movies/popular');
        $response->assertStatus(200);
    }
}