<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['middleware' => ['cors']], function () {

    Route::post('/login', 'AuthController@login');
    Route::post('/register', 'AuthController@register');
    Route::post('/send-reset-password', 'AuthController@sendResetPassword');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/logout', 'AuthController@logout');
    });


    /* Me faltaria añadir tras inciiar sesion que pyeda acceder a la api de peliculas */

    Route::get('/movies/popular', 'MovieController@getPopularMovies');
    Route::get('/movies/genres', 'MovieController@listGenres');
    Route::get('/movies/genre/{genreId}', 'MovieController@getMoviesByGenre' );
    Route::get('/movies/search', 'MovieController@searchMovie' );
    Route::get('/movies/{id}', 'MovieController@getMovieDetails' );
});
