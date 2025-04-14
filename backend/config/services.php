<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'tmdb' => [
        'api_key' => env('TMDB_API_KEY'),
        'base_url' => 'https://api.themoviedb.org/3',
        'image_url' => 'https://image.tmdb.org/t/p/w500',
        'language' => 'es-ES',
        'genres' => [
            ['id' => 28, 'name' => 'Acción'],
            ['id' => 12, 'name' => 'Aventura'],
            ['id' => 16, 'name' => 'Animación'],
            ['id' => 35, 'name' => 'Comedia'],
            ['id' => 80, 'name' => 'Crimen'],
            ['id' => 99, 'name' => 'Documental'],
            ['id' => 18, 'name' => 'Drama'],
            ['id' => 14, 'name' => 'Fantasía'],
            ['id' => 36, 'name' => 'Historia'],
            ['id' => 27, 'name' => 'Terror'],
            ['id' => 10402, 'name' => 'Música'],
            ['id' => 10749, 'name' => 'Romance'],
            ['id' => 878, 'name' => 'Ciencia ficción'],
            ['id' => 53, 'name' => 'Suspense'],
            ['id' => 10752, 'name' => 'Guerra'],
        ],
    ],

];
