import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  userName: string = '';
  movieId!: string;
  movie: any;
  trailerUrl: SafeResourceUrl = '';
  alertMessage: string = '';
  showAllSuggestions: boolean = false;
  alertType: 'success' | 'error' = 'success';
  cast: any[] = [];
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  reviews: any[] = [];
  newReview = { rating: 5, comment: '' };
  searchTerm: string = '';
  suggestions: any[] = [];
  notifications: any[] = [];
  isFavorite: boolean = false;
  isWatched: boolean = false;
  showDropdown: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.movieId = params.get('id')!;
      this.loadMovie();
      this.loadCast();
      this.loadReviews();
      this.setUserName();
      this.checkIfFavorite();
      this.loadNotifications();
    });
  }

  showAlert(message: string, type: 'success' | 'error' = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 4000);
  }

  loadMovie() {
    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/${this.movieId}`).subscribe(res => {
      this.movie = res.movie_details;
      if (this.movie.trailer) {
        const trailerUrl = this.movie.trailer;
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl);
      }
      this.checkIfFavorite();
      this.checkIfWatched();
    });
  }

  loadReviews() {
    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/${this.movieId}/reviews`)
      .subscribe(res => {
        this.reviews = res.reviews;
      });
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

  loadCast() {
    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/${this.movieId}/cast`)
      .subscribe(res => {
        this.cast = res.cast;
      });
  }

  goToDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'detail']);
  }

  goToDetailsPeople(personId: number): void {
    this.router.navigate(['/persona', personId, 'detail']);
  }

  submitReview() {
    if (!this.newReview.comment.trim()) {
      this.showAlert('Por favor, escribe un comentario.', 'error');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = {
      movie_id: this.movie.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };

    this.http.post('http://filmania.ddns.net:8000/api/reviews', data, { headers }).subscribe({
      next: () => {
        this.newReview = { rating: 5, comment: '' };
        this.loadReviews();
        this.showAlert('Reseña enviada correctamente.');
      },
      error: () => {
        this.showAlert('Error al enviar reseña.', 'error');
      }
    });
  }

  addToFavorites() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = {
      movie_id: this.movie.id,
      title: this.movie.title,
      poster_path: this.movie.poster_path,
    };

    this.http.post('http://filmania.ddns.net:8000/api/favorites', data, { headers })
      .subscribe({
        next: () => {
          const storedFavorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
          const alreadyExists = storedFavorites.some((movie: any) => movie.id === this.movie.id);

          if (!alreadyExists) {
            storedFavorites.push(this.movie);
            sessionStorage.setItem('favorites', JSON.stringify(storedFavorites));
            this.isFavorite = true;
          }

          this.showAlert('Película agregada a favoritos.');
        },
        error: () => {
          this.showAlert('Hubo un error al agregar a favoritos.', 'error');
        }
      });
  }

  removeFromFavorites() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://filmania.ddns.net:8000/api/favorites/${this.movie.id}`, { headers })
      .subscribe({
        next: () => {
          const storedFavorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
          const updatedFavorites = storedFavorites.filter((movie: any) => movie.id !== this.movie.id);
          sessionStorage.setItem('favorites', JSON.stringify(updatedFavorites));
          if (updatedFavorites.length === 0) sessionStorage.removeItem('favorites');
          this.isFavorite = false;
          this.showAlert('Película eliminada de favoritos.');
        },
        error: () => {
          this.showAlert('Hubo un error al eliminar la película de favoritos.', 'error');
        }
      });
  }

  markAsWatched(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
    if (!user || !token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const data = { user_id: user.id, movie_id: this.movie.id };

    this.http.post('http://filmania.ddns.net:8000/api/watched', data, { headers })
      .subscribe({
        next: () => {
          this.isWatched = true;
          const watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
          if (!watchedMovies.includes(this.movie.id)) {
            watchedMovies.push(this.movie.id);
            sessionStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
          }
          this.showAlert('Película marcada como vista.');
        },
        error: () => {
          this.showAlert('Hubo un error al marcar la película como vista.', 'error');
        }
      });
  }

  removeFromWatched(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
    if (!user || !token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const data = { user_id: user.id, movie_id: this.movie.id };

    this.http.post('http://filmania.ddns.net:8000/api/watched/remove', data, { headers })
      .subscribe({
        next: () => {
          this.isWatched = false;
          let watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
          watchedMovies = watchedMovies.filter((movieId: number) => movieId !== this.movie.id);
          watchedMovies.length === 0
            ? sessionStorage.removeItem('watchedMovies')
            : sessionStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
          this.showAlert('Película eliminada de vistos.');
        },
        error: () => {
          this.showAlert('Hubo un error al eliminar la película de los vistos.', 'error');
        }
      });
  }

  checkIfWatched(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
    if (!user || !token) return;

    const watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
    if (watchedMovies.includes(this.movie.id)) {
      this.isWatched = true;
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`http://filmania.ddns.net:8000/api/is-movie-watched/${user.id}/${this.movie.id}`, { headers })
      .subscribe(response => {
        this.isWatched = response.isWatched;
      });
  }

  checkIfFavorite() {
    const storedFavorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
    this.isFavorite = storedFavorites.some((movie: any) => movie.id === this.movie.id);
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  setUserName(): void {
    const user = this.authService.getUser();
    if (user && user.name) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? 'http://filmania.ddns.net:8000/' + user.profile_photo
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

    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/search?q=${this.searchTerm}`)
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

  logout(): void {
    this.clearLocalSession();
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

  private clearLocalSession(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
}