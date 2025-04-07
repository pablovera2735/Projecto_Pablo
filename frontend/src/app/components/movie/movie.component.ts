import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Movie {
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
  moviesByGenre: { [key: number]: Movie[] } = {};  // Películas por género
  currentPageByGenre: { [key: number]: number } = {};  // Página actual por género
  totalPagesByGenre: { [key: number]: number } = {};  // Total de páginas por género
  moviesPerPage: number = 5;  // Limitar a 4 películas por página

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getGenres();
    this.setUserName();
  }

  setUserName(): void {
    const user = this.authService.getUser();
    this.userName = user ? user.name : 'Invitado';
  }

  // Obtener los géneros
  getGenres(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/genres')
      .subscribe(response => {
        if (response && response.genres) {
          this.genres = response.genres;
          // Inicializar la página para cada género
          this.genres.forEach(genre => {
            this.currentPageByGenre[genre.id] = 1;  // Comenzamos en la página 1
            this.getMoviesByGenre(genre.id);
          });
        }
      });
  }

  // Obtener las películas por género y página
  getMoviesByGenre(genreId: number): void {
    const currentPage = this.currentPageByGenre[genreId];
    this.http.get<any>(`http://127.0.0.1:8000/api/movies/genre/${genreId}?page=${currentPage}`)
      .subscribe(response => {
        if (response && response.movies) {
          this.moviesByGenre[genreId] = response.movies;
          this.totalPagesByGenre[genreId] = response.total_pages;
          // Mostrar solo las primeras 4 películas de la página actual
          const startIndex = (currentPage - 1) * this.moviesPerPage;
          const endIndex = startIndex + this.moviesPerPage;
          this.moviesByGenre[genreId] = response.movies.slice(startIndex, endIndex);
        }
      });
  }

  // Cambiar de página dentro de un género
  goToPage(genreId: number, page: number): void {
    if (page > 0 && page <= this.totalPagesByGenre[genreId]) {
      this.currentPageByGenre[genreId] = page;
      this.getMoviesByGenre(genreId);
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Has cerrado sesión');
      window.location.reload();
    });
  }
}
