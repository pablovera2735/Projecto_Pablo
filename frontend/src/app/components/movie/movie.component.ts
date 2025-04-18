import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any; // 👈 Importación necesaria para usar Bootstrap JS

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  backdrop_path: string;
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
export class MovieComponent implements OnInit, AfterViewInit {
  userName: string = '';
  genres: Genre[] = [];
  recommendedMovies: Movie[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};
  currentPageByGenre: { [key: number]: number } = {};
  totalPagesByGenre: { [key: number]: number } = {};
  moviesPerPage: number = 5;
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getGenres();
    this.getRecommendedMovies();
    this.setUserName();
  }

  ngAfterViewInit(): void {
    const carouselElement = document.querySelector('#recommendedCarousel');
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000, // Esto establece el intervalo entre los deslizamientos (en milisegundos)
        ride: 'carousel', // Esto asegura que el carrusel empiece a moverse automáticamente
        wrap: true, // El carrusel volverá al principio una vez que llegue al final
        pause: false // Esto asegura que el carrusel siga moviéndose incluso si el usuario pasa el mouse por encima
      });
    }
  }
  
  getRecommendedMovies(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/popular')
      .subscribe(response => {
        this.recommendedMovies = response.movies
          .filter((m: Movie) => m.vote_average >= 7.5 && m.backdrop_path)
          .slice(0, 6);
  
        // Esperamos a que Angular actualice la vista
        setTimeout(() => {
          const carouselElement = document.querySelector('#recommendedCarousel');
          if (carouselElement) {
            const carousel = new bootstrap.Carousel(carouselElement, {
              interval: 5000, // ⏱️ Cambia cada 5 segundos
              ride: 'carousel',
              wrap: true,
              pause: false
            });
            console.log('✅ Carrusel inicializado con intervalo de 5s');
          }
        }, 0);
      });
  }
  
  
  

  setUserName(): void {
    const user = this.authService.getUser();
    if (user && user.name) {
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
          this.moviesByGenre[genreId] = response.movies.slice(0, this.moviesPerPage);
          this.totalPagesByGenre[genreId] = response.total_pages;
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
      localStorage.clear();
      alert('Has cerrado sesión');
      window.location.reload();
    });
  }
}
