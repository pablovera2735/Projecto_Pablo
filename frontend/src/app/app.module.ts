import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { MovieComponent } from './components/movie/movie.component';
import { MovieForumComponent } from './components/movie-forum/movie-forum.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recover-password', component: ForgotPasswordComponent },
  { path: 'movies', component: MovieComponent },
  { path: 'movies/:id/detail', component: MovieDetailComponent },
  { path: 'foro', component: MovieListComponent},
  { path: 'favorites', component: FavoritesComponent },
  { path: 'movies/:id/forum', component: MovieForumComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    MovieComponent,
    MovieForumComponent,
    MovieListComponent,
    FavoritesComponent,
    MovieDetailComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
