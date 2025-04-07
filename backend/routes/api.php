<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['cors']], function () {

    Route::post('/login', 'AuthController@login');
    Route::post('/register', 'AuthController@register');
    Route::post('/send-reset-password', 'AuthController@sendResetPassword');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/logout', 'AuthController@logout');


        Route::post('/comments', 'CommentController@store');
    });

    Route::get('/movies/popular', 'MovieController@getPopularMovies');
    Route::get('/movies/genres', 'MovieController@listGenres');
    Route::get('/movies/genre/{genreId}', 'MovieController@getMoviesByGenre');
    Route::get('/movies/search', 'MovieController@searchMovie');
    Route::get('/movies/{id}', 'MovieController@getMovieDetails');
    
    Route::get('/threads/{movieId}', 'ThreadController@showOrCreate');
});
