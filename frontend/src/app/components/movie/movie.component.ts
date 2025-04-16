import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
}

interface Genre {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  userName: string = '';
  genres: Genre[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};
  currentPageByGenre: { [key: number]: number } = {};
  totalPagesByGenre: { [key: number]: number } = {};
  moviesPerPage: number = 5;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';


  ngOnInit(): void {
    this.getGenres();
    this.setUserName();
  }

  setUserName(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo 
        ? 'http://localhost:8000/' + user.profile_photo 
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }
  

  getGenres(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/genres')
      .subscribe(response => {
        if (response && response.genres) {
          this.genres = response.genres;
          this.genres.forEach(genre => {
            this.currentPageByGenre[genre.id] = 1;
            this.getMoviesByGenre(genre.id);
          });
        }
      });
  }

  getMoviesByGenre(genreId: number): void {
    const currentPage = this.currentPageByGenre[genreId];
    this.http.get<any>(`http://127.0.0.1:8000/api/movies/genre/${genreId}?page=${currentPage}`)
      .subscribe(response => {
        if (response && response.movies) {
          this.moviesByGenre[genreId] = response.movies;
          this.totalPagesByGenre[genreId] = response.total_pages;

          const startIndex = (currentPage - 1) * this.moviesPerPage;
          const endIndex = startIndex + this.moviesPerPage;
          this.moviesByGenre[genreId] = response.movies.slice(startIndex, endIndex);
        }
      });
  }

   goToDetails(movieId: number): void {
  this.router.navigate(['/movies', movieId, 'detail']);
}

  goToPage(genreId: number, page: number): void {
    if (page > 0 && page <= this.totalPagesByGenre[genreId]) {
      this.currentPageByGenre[genreId] = page;
      this.getMoviesByGenre(genreId);
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Has cerrado sesión');
      window.location.reload();
    });
  }

}
