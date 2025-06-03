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

  loadMovie() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}`).subscribe(res => {
      this.movie = res.movie_details;
  
      if (this.movie.trailer) {
        const trailerUrl = this.movie.trailer;
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl);
      }
  
      this.checkIfFavorite();  // Verificar si la película está en favoritos
      this.checkIfWatched();   // Verificar si la película está marcada como vista
    });
  }

  loadReviews() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}/reviews`)
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
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}/cast`)
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
    if (!this.newReview.comment.trim()) return alert('Por favor, escribe un comentario.');
  
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const data = {
      movie_id: this.movie.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };
    
    this.http.post('http://localhost:8000/api/reviews', data, { headers }).subscribe(response => {
      this.newReview = { rating: 5, comment: '' };
      this.loadReviews(); // refresca las reseñas
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
  
    this.http.post('http://localhost:8000/api/favorites', data, { headers })
      .subscribe(response => {
        const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const alreadyExists = storedFavorites.some((movie: any) => movie.id === this.movie.id);
  
        if (!alreadyExists) {
          storedFavorites.push(this.movie);
          sessionStorage.setItem('favorites', JSON.stringify(storedFavorites));
          this.isFavorite = true;
        }
  
        alert('Película agregada a favoritos');
      }, (error) => {
        console.error('Error al agregar a favoritos:', error);
        alert('Hubo un error al agregar la película a favoritos');
      });
  }

  checkIfFavorite() {
    const storedFavorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
    this.isFavorite = storedFavorites.some((movie: any) => movie.id === this.movie.id);
  }

  removeFromFavorites() {
    const token = sessionStorage.getItem('token');
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.delete(`http://localhost:8000/api/favorites/${this.movie.id}`, { headers })
      .subscribe(response => {
        const storedFavorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
        
        const updatedFavorites = storedFavorites.filter((movie: any) => movie.id !== this.movie.id);
        sessionStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  
        if (updatedFavorites.length === 0) {
          sessionStorage.removeItem('favorites'); 
        }
  
        this.isFavorite = false;
        alert('Película eliminada de favoritos');
      }, (error) => {
        console.error('Error al eliminar de favoritos:', error);
        alert('Hubo un error al eliminar la película de favoritos');
      });
  }
  
  markAsWatched(): void {
  const user = this.authService.getUser();
  const token = sessionStorage.getItem('token');

  if (!user || !token) return;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const data = {
    user_id: user.id,
    movie_id: this.movie.id
  };

  this.http.post('http://localhost:8000/api/watched', data, { headers })
    .subscribe({
      next: () => {
        this.isWatched = true;


        const watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
        if (!watchedMovies.includes(this.movie.id)) {
          watchedMovies.push(this.movie.id);
          sessionStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        }
      },
      error: err => {
        console.error('Error al marcar como vista:', err);
        alert('Hubo un error al marcar la película como vista');
      }
    });
}


removeFromWatched(): void {
  const user = this.authService.getUser();
  const token = sessionStorage.getItem('token');

  if (!user || !token) return;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const data = {
    user_id: user.id,
    movie_id: this.movie.id
  };

  this.http.post('http://localhost:8000/api/watched/remove', data, { headers })
    .subscribe({
      next: () => {
        this.isWatched = false;

        // Eliminar de localStorage
        let watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
        watchedMovies = watchedMovies.filter((movieId: number) => movieId !== this.movie.id);

        // Si el array está vacío, eliminar la clave de localStorage
        if (watchedMovies.length === 0) {
          sessionStorage.removeItem('watchedMovies');
        } else {
          sessionStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        }
      },
      error: err => {
        console.error('Error al eliminar de vistos:', err);
        alert('Hubo un error al eliminar la película de los vistos');
      }
    });
}
  checkIfWatched(): void {
  const user = this.authService.getUser();
  const token = sessionStorage.getItem('token');

  if (!user || !token) return;

  // Verificar primero si ya está en localStorage
  const watchedMovies = JSON.parse(sessionStorage.getItem('watchedMovies') || '[]');
  if (watchedMovies.includes(this.movie.id)) {
    this.isWatched = true;
    return; // Si ya está marcado como visto, no es necesario llamar al API
  }


  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.get<any>(`http://localhost:8000/api/is-movie-watched/${user.id}/${this.movie.id}`, { headers })
    .subscribe(response => {
      this.isWatched = response.isWatched;
    });
}


  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
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

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`)
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
