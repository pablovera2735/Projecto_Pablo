<?php

use App\Http\Controllers\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::group(['middleware' => ['cors']], function () {

    Route::post('/login', 'AuthController@login');
    Route::post('/register', 'AuthController@register');
    Route::post('/send-reset-password', 'AuthController@sendResetPassword');
    Route::post('/reset-password', 'AuthController@resetPasswordWithCode');

    Route::get('/email/verify/{id}/{hash}', 'AuthController@verifyEmail')
        ->middleware('signed')
        ->name('verification.verify');

    Route::post('/email/resend', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'El correo ya fue verificado.']);
        }

        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Correo de verificación reenviado.']);
    })->middleware(['auth:sanctum']);

    Route::middleware(['auth:sanctum'])->group(function () {
        // Rutas que no necesitan bloqueo de foro
        Route::post('/logout', 'AuthController@logout');
        Route::get('/user/{id}/profile', 'AuthController@getUserProfile');
        Route::post('/profile/upload-photo', 'AuthController@uploadProfilePhoto');
        Route::get('/profile-comments/{userId}', 'AuthController@getProfileComments');
        Route::post('/profile-comments', 'AuthController@storeProfileComment');
        Route::delete('/profile/delete-photo', 'AuthController@deleteProfilePhoto');
        Route::put('/profile/update-email', 'AuthController@updateEmail');
        Route::put('/profile/update-password', 'AuthController@updatePassword');
        Route::get('/user/{id}/public-profile', 'AuthController@getPublicUserProfile');
        
        Route::get('/admin/users', 'AdminController@getAllUsers');
        Route::delete('/admin/users/{id}', 'AdminController@deleteUser');
        Route::put('/admin/users/{id}/revoke-admin', 'AdminController@revokeAdmin');
        Route::put('/admin/users/{id}/make-admin', 'AdminController@makeAdmin');
        Route::get('/admin/comments', 'AdminController@getAllComments');
        Route::delete('/admin/comments/{id}', 'AdminController@deleteComment');
        Route::get('/admin/reviews', 'AdminController@getAllReviews');
        Route::delete('/admin/reviews/{id}', 'AdminController@deleteReview');
        Route::put('/admin/users/{id}/block-forum', 'AdminController@blockUserForum');
        Route::put('/admin/users/{id}/unblock-forum', 'AdminController@unblockUserForum');
    
        Route::get('/favorites/{userId}', 'FavoriteController@index');
        Route::post('/favorites', 'FavoriteController@store');
        Route::delete('/favorites/{movieId}', 'FavoriteController@destroy');

        Route::post('/watched', 'WatchedMovieController@markAsWatched');
        Route::post('/watched/remove', 'WatchedMovieController@removeFromWatched');
        Route::get('/watched/{userId}/{movieId}', 'WatchedMovieController@isMovieWatched');
        Route::get('/watched/{userId}', 'WatchedMovieController@index');

        Route::get('/friends', 'FriendController@index');
        Route::post('/friends', 'FriendController@store');
        Route::delete('/friends/{friendId}', 'FriendController@destroy');
        Route::get('/friends/pending', 'FriendController@getPendingRequests');
        Route::post('/friends/accept', 'FriendController@acceptFriendRequest');
        Route::post('/friends/reject', 'FriendController@rejectFriendRequest');
        Route::get('/friends/{userId}', 'FriendController@getFriends');

        Route::post('/messages/send', 'MessageController@send');
        Route::get('/messages/conversation/{userId}', 'MessageController@conversation');

        Route::get('/lists/{userId}', 'ListController@index');
        Route::post('/lists', 'ListController@store');
        Route::post('/lists/{listId}/add-movie', 'ListController@addMovie');

        // Aquí agregamos middleware para bloqueo de foro para el usuario que no respete la comunidad
        Route::middleware('check.forum.blocked')->group(function () {
            Route::post('/comments', 'CommentController@store');
            Route::post('/reviews', 'ReviewController@store');
        });
    });    

    Route::get('/movies/search', 'MovieController@searchMovie');
    Route::get('/movies/{id}/cast', 'MovieController@getMovieCast');
    Route::get('/movies/popular', 'MovieController@getPopularMovies');
    Route::get('/people/popular', 'PeopleController@getAllPeople');
    Route::get('/people/{id}', 'PeopleController@getPersonDetail');
    Route::get('/people/{id}/credits', 'PeopleController@getPersonCredits');
    Route::get('/movies/genres', 'MovieController@listGenres');
    Route::get('/movies/genre/{genreId}', 'MovieController@getMoviesByGenre');
    Route::get('/movies/{id}', 'MovieController@getMovieDetails');
    Route::get('/movies/{id}/reviews', 'ReviewController@index');
    
    Route::get('/threads/{movieId}', 'ThreadController@showOrCreate');
});
