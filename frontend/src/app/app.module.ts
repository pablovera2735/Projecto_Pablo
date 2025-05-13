import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { MovieComponent } from './components/movie/movie.component';
import { MovieForumComponent } from './components/movie-forum/movie-forum.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { PopularAuthorsComponent } from './components/popular-authors/popular-authors.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { ReleaseComponent } from './components/release/release.component';
import { AboutComponent } from './components/about/about.component';
import { PersonDetailComponent } from './components/person-detail/person-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot_password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'movies', component: MovieComponent },
  { path: 'movies/:id/detail', component: MovieDetailComponent },
  { path: 'personas', component: PopularAuthorsComponent },
  { path: 'persona/:id', component: PersonDetailComponent },
  { path: 'estrenos', component: ReleaseComponent},
  { path: 'nosotros', component: AboutComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'foro', component: MovieListComponent},
  { path: 'favorites', component: FavoritesComponent },
  { path: 'movies/:id/forum', component: MovieForumComponent },
  { path: 'friend', component: FriendListComponent },
  { path: 'perfil', component: UserProfileComponent },
  { path: 'ajustes', component: UserSettingsComponent },
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
    UserProfileComponent,
    FriendListComponent,
    ResetPasswordComponent,
    PopularAuthorsComponent,
    UserSettingsComponent,
    AdminPanelComponent,
    ReleaseComponent,
    AboutComponent,
    PersonDetailComponent,
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
