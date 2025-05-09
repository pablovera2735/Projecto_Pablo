<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['cors']], function () {

    Route::post('/login', 'AuthController@login');
    Route::post('/register', 'AuthController@register');
    Route::post('/send-reset-password', 'AuthController@sendResetPassword');
    Route::post('/reset-password', 'AuthController@resetPasswordWithCode');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', 'AuthController@logout');
        Route::get('/user/{id}/profile', 'AuthController@getUserProfile');
        Route::post('/comments', 'CommentController@store');
        Route::post('/reviews', 'ReviewController@store');
        
        Route::post('/profile/upload-photo', 'AuthController@uploadProfilePhoto');
        Route::delete('/profile/delete-photo', 'AuthController@deleteProfilePhoto');
        Route::put('/profile/update-email', 'AuthController@updateEmail');
        Route::put('/profile/update-password', 'AuthController@updatePassword');
        
        Route::get('/admin/users', 'AdminController@getAllUsers');
        Route::delete('/admin/users/{id}', 'AdminController@deleteUser');
        Route::put('/admin/users/{id}/make-admin', 'AdminController@makeAdmin');
    
        Route::get('/favorites/{userId}', 'FavoriteController@index');
        Route::post('/favorites', 'FavoriteController@store');
        Route::delete('/favorites/{movieId}', 'FavoriteController@destroy');

        Route::get('/friends', 'FriendController@index');
        Route::post('/friends', 'FriendController@store');
        Route::delete('/friends/{friendId}', 'FriendController@destroy');
    
        Route::get('/lists/{userId}', 'ListController@index');
        Route::post('/lists', 'ListController@store');
        Route::post('/lists/{listId}/add-movie', 'ListController@addMovie');
    });    

    Route::get('/movies/search', 'MovieController@searchMovie');
    Route::get('/movies/{id}/cast', 'MovieController@getMovieCast');
    Route::get('/movies/popular', 'MovieController@getPopularMovies');
    Route::get('/people/popular', 'PeopleController@getAllPeople');
    Route::get('/movies/genres', 'MovieController@listGenres');
    Route::get('/movies/genre/{genreId}', 'MovieController@getMoviesByGenre');
    Route::get('/movies/{id}', 'MovieController@getMovieDetails');
    Route::get('/movies/{id}/reviews', 'ReviewController@index');
    
    Route::get('/threads/{movieId}', 'ThreadController@showOrCreate');
});