import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

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
export class MovieComponent implements OnInit, AfterViewInit, OnDestroy {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';

  genres: Genre[] = [];
  recommendedMovies: Movie[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};
  currentPageByGenre: { [key: number]: number } = {};
  totalPagesByGenre: { [key: number]: number } = {};
  moviesPerPage: number = 5;

  currentSlide: number = 0;
  slideInterval: any;

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
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.recommendedMovies.length;
    this.updateActiveSlide();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.recommendedMovies.length) % this.recommendedMovies.length;
    this.updateActiveSlide();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateActiveSlide();
  }

  updateActiveSlide(): void {
    const slides = document.querySelectorAll('.blog-slide');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
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

  getRecommendedMovies(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/popular')
      .subscribe(response => {
        this.recommendedMovies = response.movies
          .filter((m: Movie) => m.vote_average >= 7.5 && m.backdrop_path)
          .slice(0, 6);
        setTimeout(() => {
          this.updateActiveSlide(); // Activar el primer slide al renderizar
        }, 0);
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
