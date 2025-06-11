import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
  searchTerm: string = '';
  suggestions: any[] = [];
  notifications: any[] = [];

  genres: Genre[] = [];
  recommendedMovies: Movie[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};
  currentPageByGenre: { [key: number]: number } = {};
  totalPagesByGenre: { [key: number]: number } = {};
  moviesPerPage: number = 6;

  currentSlide: number = 0;
  slideInterval: any;
  showDropdown: boolean = false;
  showBackToTop: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getGenres();
    this.getRecommendedMovies();
    this.setUserName();
    this.loadNotifications();
  }

  ngAfterViewInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMobileMenu(): void {
  this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
  this.mobileMenuOpen = false;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
    });
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
        ? 'https://filmania.ddns.net:8000/' + user.profile_photo
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get<any>(`https://filmania.ddns.net:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8);
      });

      this.closeMobileMenu();
  }

  getItemImage(item: any): string {
    if (item.poster_path || item.profile_path) {
      const path = item.poster_path || item.profile_path;
      return `https://image.tmdb.org/t/p/w92${path}`;
    }
    return 'assets/img/no-image.png';
  }

  goToSearchResults(): void {
    this.router.navigate(['/busqueda'], { queryParams: { q: this.searchTerm } });
  }

  getGenres(): void {
    this.http.get<any>('https://filmania.ddns.net:8000/api/movies/genres')
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
    this.http.get<any>(`https://filmania.ddns.net:8000/api/movies/genre/${genreId}?page=${currentPage}`)
      .subscribe(response => {
        if (response && response.movies) {
          this.moviesByGenre[genreId] = response.movies.slice(0, this.moviesPerPage);
          this.totalPagesByGenre[genreId] = response.total_pages;
        }
      });
  }

  getRecommendedMovies(): void {
    this.http.get<any>('https://filmania.ddns.net:8000/api/movies/popular')
      .subscribe(response => {
        this.recommendedMovies = response.movies
          .filter((m: Movie) => m.vote_average >= 6.5 && m.backdrop_path)
          .slice(0, 6);
        setTimeout(() => {
          this.updateActiveSlide();
        }, 0);
      });
  }

  goToDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'detail']);
  }

  goToPage(genreId: number, page: number, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (page > 0 && page <= this.totalPagesByGenre[genreId]) {
      this.currentPageByGenre[genreId] = page;
      this.getMoviesByGenre(genreId);
    }
  }

  getLimitedPagesArray(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }

    return pages;
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/movies']);

    const token = sessionStorage.getItem('token');
    if (token) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout exitoso en servidor');
        },
        error: (err) => {
          console.warn('Error en logout del servidor, pero no pasa nada:', err);
        }
      });
    }
  }

  private clearSession(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
}