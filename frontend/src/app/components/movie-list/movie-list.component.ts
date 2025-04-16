import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

interface Genre {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  genres: Genre[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.setUserName();
  }

  setUserName(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userName = user.name || 'Invitado';
      this.profilePhoto = user.profile_photo 
        ? `http://localhost:8000/${user.profile_photo}` 
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  loadGenres(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/genres')
      .subscribe(res => {
        this.genres = res.genres;
        this.genres.forEach(genre => {
          this.loadMoviesByGenre(genre.id);
        });
      });
  }

  loadMoviesByGenre(genreId: number): void {
    this.http.get<any>(`http://127.0.0.1:8000/api/movies/genre/${genreId}?page=1`)
      .subscribe(res => {
        this.moviesByGenre[genreId] = res.movies;
      });
  }

  goToForum(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'forum']);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    });
  }  
}
